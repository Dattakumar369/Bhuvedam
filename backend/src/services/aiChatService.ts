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

export function getAiProvider(): AiProvider {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit === 'gemini' || explicit === 'ollama') return explicit;
  if (isGeminiConfigured()) return 'gemini';
  if (isOllamaConfigured()) return 'ollama';
  return 'gemini';
}

export function isAiConfigured(): boolean {
  return getAiProvider() === 'gemini' ? isGeminiConfigured() : isOllamaConfigured();
}

export async function completeAiChat(
  messages: ProxyChatMessage[],
  opts: { voiceMode?: boolean; signal?: AbortSignal } = {},
): Promise<string> {
  const provider = getAiProvider();
  try {
    if (provider === 'gemini') {
      return await completeGeminiChat(messages, opts);
    }
    return await completeOllamaChat(messages, opts);
  } catch (err) {
    if (provider === 'gemini' && isOllamaConfigured()) {
      return completeOllamaChat(messages, opts);
    }
    throw err;
  }
}

export async function streamAiChat(
  messages: ProxyChatMessage[],
  opts: { voiceMode?: boolean; signal?: AbortSignal },
): Promise<ReadableStream<Uint8Array>> {
  if (getAiProvider() === 'gemini') {
    return streamGeminiChat(messages, opts);
  }
  return streamOllamaChat(messages, opts);
}

export { type ProxyChatMessage };
