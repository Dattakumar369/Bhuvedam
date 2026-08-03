import {
  completeOllamaChat,
  isOllamaConfigured,
  type ProxyChatMessage,
} from './aiProxyService';
import {
  completeGeminiChat,
  isGeminiConfigured,
} from './geminiProxyService';
import { resolveAgentTemperature } from './agents/agentTemperature';
import { cacheAiKnowledgeAnswer } from './aiKnowledgeCache';
import {
  extractPriorUserQuestion,
  hasThinLibraryInSystem,
  isCorrectionMessage,
  isUncertainLlmAnswer,
  messageText,
  shouldSearchWebFirst,
  wantsWebSearch,
} from './correctionDetect';
import {
  buildResearchFallbackAnswer,
  researchAgricultureOnline,
  type WebResearchResult,
} from './webResearchService';

export type AiProvider = 'gemini' | 'ollama';

export interface AiChatOptions {
  voiceMode?: boolean;
  signal?: AbortSignal;
  agentId?: string;
  temperature?: number;
  cropIds?: string[];
}

function resolveTemperature(opts: AiChatOptions): number {
  if (opts.temperature != null) return opts.temperature;
  return resolveAgentTemperature(opts.agentId, opts.voiceMode);
}

const GEMINI_ATTEMPT_MS = 12000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label}_TIMEOUT`)), ms);
    }),
  ]);
}

export function getAiProvider(): AiProvider {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (isOllamaConfigured() && explicit !== 'gemini') return 'ollama';
  if (explicit === 'gemini' && isGeminiConfigured()) return 'gemini';
  if (explicit === 'ollama' && isOllamaConfigured()) return 'ollama';
  if (isGeminiConfigured()) return 'gemini';
  if (isOllamaConfigured()) return 'ollama';
  return 'ollama';
}

export function isAiConfigured(): boolean {
  return true;
}

function extractResearchQuery(messages: ProxyChatMessage[]): {
  query: string;
  correction: boolean;
  correctionNote: string;
} {
  const lastUser = messageText(messages.filter((m) => m.role === 'user').at(-1)?.content ?? '');
  const correction = isCorrectionMessage(lastUser);
  const query = correction ? extractPriorUserQuestion(messages) : lastUser;
  return { query: query || lastUser, correction, correctionNote: lastUser };
}

function emptyResearch(query: string): WebResearchResult {
  return { query, snippets: [], formattedContext: '', dbContext: '' };
}

function appendResearchToSystem(
  messages: ProxyChatMessage[],
  research: WebResearchResult,
): ProxyChatMessage[] {
  if (!research.formattedContext.trim()) return messages;

  const block =
    '\n\n--- ONLINE AGRICULTURE SOURCES (MANDATORY — answer ONLY from these facts; never say you have no information) ---\n' +
    research.formattedContext;

  const out = messages.map((m) => ({ ...m }));
  const sysIdx = out.findIndex((m) => m.role === 'system');
  if (sysIdx >= 0) {
    const prev = messageText(out[sysIdx].content);
    out[sysIdx] = { ...out[sysIdx], content: `${prev}${block}` };
  } else {
    out.unshift({ role: 'system', content: block.trim() });
  }
  return out;
}

function isThinDbContext(context: string): boolean {
  const t = context.trim();
  if (!t) return true;
  if (/no matching entries in bhuvedam farming library/i.test(t)) return true;
  if (/no library match/i.test(t)) return true;
  return t.length < 120;
}

async function tryAllLlmProviders(
  messages: ProxyChatMessage[],
  chatOpts: AiChatOptions & { temperature: number },
): Promise<string | null> {
  const attempts: (() => Promise<string>)[] = [];

  if (isGeminiConfigured()) {
    attempts.push(() =>
      withTimeout(completeGeminiChat(messages, chatOpts), GEMINI_ATTEMPT_MS, 'GEMINI'),
    );
  }
  if (isOllamaConfigured()) {
    attempts.push(() => completeOllamaChat(messages, chatOpts));
  }

  for (const attempt of attempts) {
    try {
      const text = (await attempt()).trim();
      if (text.length >= 15) return text;
    } catch {
      /* try next provider */
    }
  }
  return null;
}

function cacheAnswerAsync(
  query: string,
  answer: string,
  research: WebResearchResult,
  opts: AiChatOptions,
  provider: string,
): void {
  void cacheAiKnowledgeAnswer(query, answer, {
    cropIds: opts.cropIds,
    provider,
    dbContext: research.dbContext,
    webSnippets: research.snippets,
    forceStore: provider.includes('web') || provider.includes('correction'),
  }).catch(() => undefined);
}

function directWebAnswer(
  query: string,
  research: WebResearchResult,
  opts: AiChatOptions,
  provider: string,
): { answer: string; provider: string; research: WebResearchResult } {
  const answer = buildResearchFallbackAnswer(query, research, opts.voiceMode);
  cacheAnswerAsync(query, answer, research, opts, provider);
  return { answer, provider, research };
}

async function completeWithResearchFallback(
  messages: ProxyChatMessage[],
  opts: AiChatOptions,
): Promise<{ answer: string; provider: string; research: WebResearchResult }> {
  const { query, correction, correctionNote } = extractResearchQuery(messages);
  const chatOpts = { ...opts, temperature: resolveTemperature(opts) };

  let research = emptyResearch(query);
  let workingMessages = messages;

  // STEP 1: No library answer yet → search web FIRST (before LLM).
  if (shouldSearchWebFirst(messages) || correction || wantsWebSearch(query)) {
    research = await researchAgricultureOnline(query, {
      correction,
      correctionNote,
      cropIds: opts.cropIds,
    });
    if (research.formattedContext.trim()) {
      workingMessages = appendResearchToSystem(messages, research);
    }
  }

  const dbEmpty = isThinDbContext(research.dbContext) || hasThinLibraryInSystem(messages);

  // STEP 2: Web found info + DB had nothing → answer from web (no "sorry").
  if (research.snippets.length > 0 && dbEmpty) {
    const llmWithWeb = await tryAllLlmProviders(workingMessages, chatOpts);
    if (llmWithWeb && !isUncertainLlmAnswer(llmWithWeb)) {
      cacheAnswerAsync(query, llmWithWeb, research, opts, getAiProvider());
      return { answer: llmWithWeb, provider: getAiProvider(), research };
    }
    return directWebAnswer(
      query,
      research,
      opts,
      correction ? 'correction_research' : 'web_research',
    );
  }

  // STEP 3: Normal LLM with whatever context we have.
  let answer = await tryAllLlmProviders(workingMessages, chatOpts);

  if (answer && isUncertainLlmAnswer(answer)) {
    if (!research.formattedContext.trim()) {
      research = await researchAgricultureOnline(query, {
        correction,
        correctionNote,
        cropIds: opts.cropIds,
      });
      workingMessages = appendResearchToSystem(messages, research);
    }
    if (research.snippets.length > 0) {
      const retry = await tryAllLlmProviders(workingMessages, chatOpts);
      if (retry && !isUncertainLlmAnswer(retry)) {
        cacheAnswerAsync(query, retry, research, opts, getAiProvider());
        return { answer: retry, provider: getAiProvider(), research };
      }
      return directWebAnswer(
        query,
        research,
        opts,
        correction ? 'correction_research' : 'web_research',
      );
    }
  }

  if (answer && !isUncertainLlmAnswer(answer)) {
    if (correction) cacheAnswerAsync(query, answer, research, opts, 'correction');
    return { answer, provider: getAiProvider(), research };
  }

  // STEP 4: LLM failed — final web search + direct web answer.
  if (!research.formattedContext.trim()) {
    research = await researchAgricultureOnline(query, {
      correction,
      correctionNote,
      cropIds: opts.cropIds,
    });
    workingMessages = appendResearchToSystem(messages, research);
  }

  if (research.snippets.length > 0) {
    const llmLast = await tryAllLlmProviders(workingMessages, chatOpts);
    if (llmLast && !isUncertainLlmAnswer(llmLast)) {
      cacheAnswerAsync(query, llmLast, research, opts, getAiProvider());
      return { answer: llmLast, provider: getAiProvider(), research };
    }
    return directWebAnswer(
      query,
      research,
      opts,
      correction ? 'correction_research' : 'web_research',
    );
  }

  return directWebAnswer(query, research, opts, 'web_research');
}

export async function completeAiChat(
  messages: ProxyChatMessage[],
  opts: AiChatOptions = {},
): Promise<string> {
  const result = await completeWithResearchFallback(messages, opts);
  return result.answer;
}

export async function streamAiChat(
  messages: ProxyChatMessage[],
  opts: AiChatOptions,
): Promise<ReadableStream<Uint8Array>> {
  const { answer } = await completeWithResearchFallback(messages, opts);
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: answer })}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

export { type ProxyChatMessage };
