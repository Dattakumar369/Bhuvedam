import {
  completeOllamaChat,
  isOllamaConfigured,
  streamOllamaChat,
  type ProxyChatMessage,
} from './aiProxyService';
import {
  completeGeminiChat,
  isGeminiConfigured,
  streamGeminiChat,
} from './geminiProxyService';
import { resolveAgentTemperature } from './agents/agentTemperature';
import { cacheAiKnowledgeAnswer } from './aiKnowledgeCache';
import {
  extractPriorUserQuestion,
  isCorrectionMessage,
  isUncertainLlmAnswer,
  messageText,
  systemNeedsWebResearch,
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
    '\n\n--- ONLINE AGRICULTURE SOURCES (MANDATORY — use these facts in your answer; never say you have no information when this section has data) ---\n' +
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

async function loadWebResearch(
  query: string,
  opts: AiChatOptions,
  correction: boolean,
  correctionNote: string,
): Promise<WebResearchResult> {
  return researchAgricultureOnline(query, {
    correction,
    correctionNote,
    cropIds: opts.cropIds,
  });
}

async function completeWithResearchFallback(
  messages: ProxyChatMessage[],
  opts: AiChatOptions,
): Promise<{ answer: string; provider: string; research: WebResearchResult }> {
  const { query, correction, correctionNote } = extractResearchQuery(messages);
  const chatOpts = { ...opts, temperature: resolveTemperature(opts) };
  const userAskedWeb = wantsWebSearch(query) || wantsWebSearch(correctionNote);

  let research = emptyResearch(query);
  let workingMessages = messages;

  // Search web BEFORE LLM when DB was empty, user asked to search, or correction.
  if (userAskedWeb || correction || systemNeedsWebResearch(messages)) {
    research = await loadWebResearch(query, opts, correction, correctionNote);
    if (research.formattedContext.trim()) {
      workingMessages = appendResearchToSystem(messages, research);
    }
  }

  let answer = await tryAllLlmProviders(workingMessages, chatOpts);

  // LLM said "sorry / don't know" — search web and retry (even if LLM API succeeded).
  if (answer && isUncertainLlmAnswer(answer)) {
    if (!research.formattedContext.trim()) {
      research = await loadWebResearch(query, opts, correction, correctionNote);
    }
    if (research.formattedContext.trim()) {
      workingMessages = appendResearchToSystem(messages, research);
      const retry = await tryAllLlmProviders(workingMessages, chatOpts);
      if (retry && !isUncertainLlmAnswer(retry)) {
        cacheAnswerAsync(query, retry, research, opts, getAiProvider());
        return { answer: retry, provider: getAiProvider(), research };
      }
      answer = retry ?? answer;
    }
  }

  if (answer && !isUncertainLlmAnswer(answer)) {
    if (correction) cacheAnswerAsync(query, answer, research, opts, 'correction');
    return { answer, provider: getAiProvider(), research };
  }

  // LLM failed completely — web search + retry + web-only answer.
  if (!research.formattedContext.trim()) {
    research = await loadWebResearch(query, opts, correction, correctionNote);
    workingMessages = appendResearchToSystem(messages, research);
  }

  const llmAfterWeb = await tryAllLlmProviders(workingMessages, chatOpts);
  if (llmAfterWeb && !isUncertainLlmAnswer(llmAfterWeb)) {
    cacheAnswerAsync(query, llmAfterWeb, research, opts, getAiProvider());
    return { answer: llmAfterWeb, provider: getAiProvider(), research };
  }

  const fallback = buildResearchFallbackAnswer(query, research, opts.voiceMode);
  cacheAnswerAsync(
    query,
    fallback,
    research,
    opts,
    correction ? 'correction_research' : 'web_research',
  );
  return {
    answer: fallback,
    provider: correction ? 'correction_research' : 'web_research',
    research,
  };
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
