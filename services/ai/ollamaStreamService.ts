import { AI_CONFIG } from '@/constants/aiConfig';
import type { LanguageCode } from '@/constants/languages';
import { getAgentTemperature } from '@/services/ai/agents';
import {
  buildOllamaMessage,
  historyHasVisionImage,
} from '@/services/ai/visionMessages';
import type { ChatMessage } from '@/types/ai';
import { userApiError } from '@/utils/apiUserError';

interface OllamaStreamOptions {
  messages: ChatMessage[];
  language: LanguageCode;
  systemPrompt: string;
  onChunk: (content: string) => void;
  signal?: AbortSignal;
  voiceMode?: boolean;
  agentId?: string;
}

type OllamaChatResponse = {
  message?: { role?: string; content?: string; thinking?: string };
  error?: string;
};

function buildOllamaMessages(messages: ChatMessage[], systemPrompt: string) {
  return [
    { role: 'system' as const, content: systemPrompt },
    ...messages
      .filter((m) => m.role !== 'system' && (m.content.trim() || m.imageUri) && !m.isStreaming)
      .map((m) => buildOllamaMessage(m)),
  ];
}

function parseOllamaError(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    // use raw body
  }
  return body || `Ollama request failed (${status})`;
}

function extractAssistantContent(data: OllamaChatResponse): string {
  const content = data.message?.content?.trim() ?? '';
  if (content) return content;

  const thinking = data.message?.thinking?.trim() ?? '';
  if (thinking) return thinking;

  if (data.error) return data.error;

  return '';
}

async function requestOllamaChat(
  messages: ChatMessage[],
  systemPrompt: string,
  stream: boolean,
  signal?: AbortSignal,
  voiceMode = false,
  onChunk?: (content: string) => void,
  agentId?: string,
): Promise<OllamaChatResponse> {
  if (!AI_CONFIG.ollamaApiKey) {
    throw userApiError('AI_NOT_CONFIGURED');
  }

  const useVision = historyHasVisionImage(messages);
  const model = useVision ? AI_CONFIG.ollamaVisionModel : AI_CONFIG.ollamaModel;
  const baseTemp = getAgentTemperature(agentId ?? 'general');
  const temperature = voiceMode ? Math.min(baseTemp + 0.05, 0.3) : baseTemp;
  const payload: Record<string, unknown> = {
    model,
    messages: buildOllamaMessages(messages, systemPrompt),
    stream,
    options: {
      temperature,
      top_p: 0.85,
      repeat_penalty: 1.15,
      num_predict: voiceMode ? 768 : 1536,
    },
  };
  if (model.includes('gpt-oss')) payload.think = 'low';

  const response = await fetch(`${AI_CONFIG.ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_CONFIG.ollamaApiKey}`,
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw userApiError('AI_UNAVAILABLE');
  }

  if (stream) {
    return consumeOllamaStream(response, onChunk, signal);
  }

  return (await response.json()) as OllamaChatResponse;
}

async function consumeOllamaStream(
  response: Response,
  onChunk?: (content: string) => void,
  signal?: AbortSignal,
): Promise<OllamaChatResponse> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('STREAM_UNSUPPORTED');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';
  let lastPayload: OllamaChatResponse = {};

  while (true) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const parsed = JSON.parse(trimmed) as OllamaChatResponse & {
          message?: { content?: string };
        };
        lastPayload = parsed;
        const token = parsed.message?.content ?? parsed.message?.thinking;
        if (token) {
          fullContent += token;
          onChunk?.(fullContent);
        }
      } catch {
        // skip malformed JSON lines
      }
    }
  }

  return {
    ...lastPayload,
    message: {
      ...lastPayload.message,
      role: 'assistant',
      content: fullContent || lastPayload.message?.content || '',
    },
  };
}

export async function streamFromOllama({
  messages,
  systemPrompt,
  onChunk,
  signal,
  voiceMode = false,
  agentId,
}: OllamaStreamOptions): Promise<string> {
  try {
    const data = await requestOllamaChat(
      messages,
      systemPrompt,
      true,
      signal,
      voiceMode,
      onChunk,
      agentId,
    );
    const content = extractAssistantContent(data);
    if (!content) {
      throw userApiError('AI_UNAVAILABLE');
    }
    onChunk(content);
    return content;
  } catch (error) {
    if (error instanceof Error && error.message === 'STREAM_UNSUPPORTED') {
      const data = await requestOllamaChat(messages, systemPrompt, false, signal, voiceMode);
      const content = extractAssistantContent(data);
      if (!content) {
        throw userApiError('AI_UNAVAILABLE');
      }
      onChunk(content);
      return content;
    }
    throw error;
  }
}
