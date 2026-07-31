import type { ChatMessage } from '@/types/ai';
import {
  buildOpenAIMessageContent,
  historyHasVisionImage,
} from '@/services/ai/visionMessages';

export interface OpenAICompatConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  visionModel?: string;
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

function parseApiError(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string } | string;
      message?: string;
    };
    if (typeof parsed.error === 'string') return parsed.error;
    if (parsed.error?.message) return parsed.error.message;
    if (parsed.message) return parsed.message;
  } catch {
    // use raw body
  }
  return body || `AI request failed (${status})`;
}

export async function streamFromOpenAICompat(
  messages: ChatMessage[],
  systemPrompt: string,
  config: OpenAICompatConfig,
  onChunk: (content: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const useVision = historyHasVisionImage(messages);
  const model =
    useVision && config.visionModel ? config.visionModel : config.model;

  const url = config.apiUrl.replace(/\/$/, '') + '/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: buildOpenAIMessages(messages, systemPrompt),
      stream: true,
      temperature: 0.2,
      max_tokens: 1024,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(parseApiError(response.status, errorText));
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Streaming not supported');

  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
        };
        const token = parsed.choices?.[0]?.delta?.content;
        if (token) {
          fullContent += token;
          onChunk(fullContent);
        }
      } catch {
        // skip malformed SSE chunks
      }
    }
  }

  return fullContent;
}
