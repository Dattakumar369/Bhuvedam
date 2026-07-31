import { AI_CONFIG, hasRealAIProvider } from '@/constants/aiConfig';
import type { LanguageCode } from '@/constants/languages';
import { API_CONFIG } from '@/constants/app';
import { streamFromOllama } from '@/services/ai/ollamaStreamService';
import { streamFromOpenAICompat } from '@/services/ai/openAICompatStreamService';
import { buildOpenAIMessageContent } from '@/services/ai/visionMessages';
import { ENDPOINTS } from '@/services/api/endpoints';
import { getAuthToken, setAuthToken } from '@/services/api/client';
import type { ChatMessage } from '@/types/ai';

interface StreamOptions {
  messages: ChatMessage[];
  language: LanguageCode;
  systemPrompt: string;
  onChunk: (content: string) => void;
  signal?: AbortSignal;
  voiceMode?: boolean;
}

function buildOpenAIMessages(messages: ChatMessage[], systemPrompt: string) {
  return [
    { role: 'system' as const, content: systemPrompt },
    ...messages
      .filter(
        (m) => m.role !== 'system' && !m.isStreaming && (m.content.trim() || m.imageUri),
      )
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: buildOpenAIMessageContent(m),
      })),
  ];
}

async function streamFromBackend({ messages, language, systemPrompt, onChunk, signal }: StreamOptions): Promise<string> {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUserMessage) throw new Error('No user message');

  const response = await fetch(`${API_CONFIG.baseUrl}${ENDPOINTS.ai.stream}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
    },
    body: JSON.stringify({
      messages: buildOpenAIMessages(messages, systemPrompt),
      message: lastUserMessage.content,
      language,
    }),
    signal,
  });

  if (!response.ok) {
    let code = 'AI_UNAVAILABLE';
    try {
      const errBody = (await response.json()) as { code?: string };
      if (errBody.code) code = errBody.code;
    } catch {
      // ignore parse errors
    }
    const err = new Error(code) as Error & { code?: string };
    err.code = code;
    throw err;
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Streaming not supported');

  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (!data || data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data) as { content?: string };
        if (parsed.content) {
          fullContent += parsed.content;
          onChunk(fullContent);
        }
      } catch {
        fullContent += data;
        onChunk(fullContent);
      }
    }
  }

  return fullContent;
}

export async function streamAIResponse(options: StreamOptions): Promise<string> {
  const lastUser = [...options.messages].reverse().find((m) => m.role === 'user');
  if (!lastUser) throw new Error('No user message to respond to');

  if (AI_CONFIG.useBackend) {
    return streamFromBackend(options);
  }

  if (AI_CONFIG.provider === 'ollama' && AI_CONFIG.ollamaApiKey) {
    return streamFromOllama(options);
  }

  if (AI_CONFIG.provider === 'openai' && AI_CONFIG.apiKey) {
    return streamFromOpenAICompat(
      options.messages,
      options.systemPrompt,
      {
        apiUrl: AI_CONFIG.apiUrl,
        apiKey: AI_CONFIG.apiKey,
        model: AI_CONFIG.model,
        visionModel: 'gpt-4o-mini',
      },
      options.onChunk,
      options.signal,
    );
  }

  if (!hasRealAIProvider()) {
    throw new Error(
      'AI is not configured. Add EXPO_PUBLIC_OLLAMA_API_KEY to your .env file and restart the app.',
    );
  }

  throw new Error('No AI provider available');
}

export { setAuthToken };
