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
  messageText,
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

/** Web research works without LLM keys — chat should never hard-fail. */
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

function appendResearchToSystem(
  messages: ProxyChatMessage[],
  research: WebResearchResult,
): ProxyChatMessage[] {
  if (!research.formattedContext.trim()) return messages;

  const block =
    '\n\n--- ONLINE AGRICULTURE SOURCES (use these facts; farmer must not see website names in reply) ---\n' +
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

async function completeWithResearchFallback(
  messages: ProxyChatMessage[],
  opts: AiChatOptions,
): Promise<{ answer: string; provider: string; research: WebResearchResult }> {
  const { query, correction, correctionNote } = extractResearchQuery(messages);
  const chatOpts = { ...opts, temperature: resolveTemperature(opts) };
  const emptyResearch: WebResearchResult = {
    query,
    snippets: [],
    formattedContext: '',
    dbContext: '',
  };

  // Client prompt often already includes DB + web context — try LLM first (fast path).
  const llmFirst = await tryAllLlmProviders(messages, chatOpts);
  if (llmFirst) {
    if (correction) {
      cacheAnswerAsync(query, llmFirst, emptyResearch, opts, 'correction');
    }
    return { answer: llmFirst, provider: getAiProvider(), research: emptyResearch };
  }

  // LLM unavailable — search online, retry LLM, then return web-only answer.
  const research = await researchAgricultureOnline(query, {
    correction,
    correctionNote,
    cropIds: opts.cropIds,
  });
  const augmented = appendResearchToSystem(messages, research);
  const llmSecond = await tryAllLlmProviders(augmented, chatOpts);
  if (llmSecond) {
    cacheAnswerAsync(query, llmSecond, research, opts, getAiProvider());
    return { answer: llmSecond, provider: getAiProvider(), research };
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
  const chatOpts = { ...opts, temperature: resolveTemperature(opts) };

  const streamAttempts: (() => Promise<ReadableStream<Uint8Array>>)[] = [];
  if (getAiProvider() === 'ollama' && isOllamaConfigured()) {
    streamAttempts.push(() => streamOllamaChat(messages, chatOpts));
  } else if (isGeminiConfigured()) {
    streamAttempts.push(() => streamGeminiChat(messages, chatOpts));
  }
  if (isOllamaConfigured() && getAiProvider() !== 'ollama') {
    streamAttempts.push(() => streamOllamaChat(messages, chatOpts));
  }

  for (const attempt of streamAttempts) {
    try {
      return await attempt();
    } catch {
      /* fall through */
    }
  }

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
