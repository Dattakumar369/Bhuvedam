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

export type AiProvider = 'gemini' | 'ollama';

const GEMINI_ATTEMPT_MS = 8000;

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
  // Ollama is reliable on Vercel; use unless gemini-only is explicitly requested.
  if (isOllamaConfigured() && explicit !== 'gemini') return 'ollama';
  if (explicit === 'gemini' && isGeminiConfigured()) return 'gemini';
  if (explicit === 'ollama' && isOllamaConfigured()) return 'ollama';
  if (isGeminiConfigured()) return 'gemini';
  if (isOllamaConfigured()) return 'ollama';
  return 'ollama';
}

export function isAiConfigured(): boolean {
  return isGeminiConfigured() || isOllamaConfigured();
}

async function tryGeminiThenOllama(
  messages: ProxyChatMessage[],
  opts: { voiceMode?: boolean; signal?: AbortSignal },
): Promise<string> {
  if (isGeminiConfigured()) {
    try {
      return await withTimeout(completeGeminiChat(messages, opts), GEMINI_ATTEMPT_MS, 'GEMINI');
    } catch {
      /* fall through to Ollama */
    }
  }
  if (isOllamaConfigured()) {
    return completeOllamaChat(messages, opts);
  }
  throw new Error('AI_NOT_CONFIGURED');
}

export async function completeAiChat(
  messages: ProxyChatMessage[],
  opts: { voiceMode?: boolean; signal?: AbortSignal } = {},
): Promise<string> {
  if (getAiProvider() === 'ollama') {
    return completeOllamaChat(messages, opts);
  }
  return tryGeminiThenOllama(messages, opts);
}

export async function streamAiChat(
  messages: ProxyChatMessage[],
  opts: { voiceMode?: boolean; signal?: AbortSignal },
): Promise<ReadableStream<Uint8Array>> {
  if (getAiProvider() === 'ollama') {
    return streamOllamaChat(messages, opts);
  }
  return streamGeminiChat(messages, opts);
}

export { type ProxyChatMessage };
