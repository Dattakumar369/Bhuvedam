import { Platform } from 'react-native';

import { AI_CONFIG, hasRealAIProvider } from '@/constants/aiConfig';
import type { LanguageCode } from '@/constants/languages';
import { API_CONFIG, STORAGE_KEYS } from '@/constants/app';
import { streamFromOllama } from '@/services/ai/ollamaStreamService';
import { streamFromOpenAICompat } from '@/services/ai/openAICompatStreamService';
import { buildOpenAIMessageContent } from '@/services/ai/visionMessages';
import { apiClient, getAuthToken, setAuthToken } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { ChatMessage } from '@/types/ai';
import { secureStorage } from '@/utils/storage';

const AI_REQUEST_TIMEOUT_MS = 58000;

function capSystemPrompt(systemPrompt: string, maxChars = 8000): string {
  if (systemPrompt.length <= maxChars) return systemPrompt;
  return `${systemPrompt.slice(-maxChars)}\n\n[Context trimmed for speed.]`;
}

async function ensureAuthToken(): Promise<string | null> {
  let token = getAuthToken();
  if (!token) {
    token = await secureStorage.get(STORAGE_KEYS.authToken);
    if (token) setAuthToken(token);
  }
  return token;
}

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

function throwBackendError(code: string): never {
  const err = new Error(code) as Error & { code?: string };
  err.code = code;
  throw err;
}

async function parseBackendError(response: Response): Promise<never> {
  let code = 'AI_UNAVAILABLE';
  try {
    const errBody = (await response.json()) as { code?: string };
    if (errBody.code) code = errBody.code;
  } catch {
    // ignore parse errors
  }
  throwBackendError(code);
}

function parseBackendSSE(text: string, onChunk: (content: string) => void): string {
  let fullContent = '';

  for (const line of text.split('\n')) {
    if (!line.startsWith('data:')) continue;
    const data = line.slice(5).trim();
    if (!data || data === '[DONE]') continue;

    try {
      const parsed = JSON.parse(data) as { content?: string };
      if (parsed.content) {
        fullContent = parsed.content;
        onChunk(fullContent);
      }
    } catch {
      fullContent += data;
      onChunk(fullContent);
    }
  }

  return fullContent;
}

async function chatFromBackend({
  messages,
  systemPrompt,
  onChunk,
  signal,
  voiceMode,
}: StreamOptions): Promise<string> {
  if (!(await ensureAuthToken())) {
    throwBackendError('UNAUTHORIZED');
  }

  const res = await apiClient.post<{ content?: string }>(
    ENDPOINTS.ai.send,
    {
      messages: buildOpenAIMessages(messages, capSystemPrompt(systemPrompt)),
      voiceMode,
    },
    { timeout: AI_REQUEST_TIMEOUT_MS, signal },
  );

  const content = res.data.content?.trim() ?? '';
  if (!content) throwBackendError('AI_UNAVAILABLE');

  onChunk(content);
  return content;
}

async function streamFromBackend(options: StreamOptions): Promise<string> {
  const { messages, systemPrompt, onChunk, signal, voiceMode } = options;
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
      language: options.language,
      voiceMode,
    }),
    signal,
  });

  if (!response.ok) {
    await parseBackendError(response);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    const fullContent = parseBackendSSE(text, onChunk);
    if (!fullContent.trim()) throwBackendError('AI_UNAVAILABLE');
    return fullContent;
  }

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
          fullContent = parsed.content;
          onChunk(fullContent);
        }
      } catch {
        fullContent += data;
        onChunk(fullContent);
      }
    }
  }

  if (!fullContent.trim()) throwBackendError('AI_UNAVAILABLE');
  return fullContent;
}

export async function streamAIResponse(options: StreamOptions): Promise<string> {
  const lastUser = [...options.messages].reverse().find((m) => m.role === 'user');
  if (!lastUser) throw new Error('No user message to respond to');

  if (AI_CONFIG.useBackend) {
    // React Native fetch cannot reliably read SSE streams on device.
    if (Platform.OS !== 'web') {
      return chatFromBackend(options);
    }

    try {
      return await streamFromBackend(options);
    } catch (error) {
      if (error instanceof Error && error.message === 'Streaming not supported') {
        return chatFromBackend(options);
      }
      throw error;
    }
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
