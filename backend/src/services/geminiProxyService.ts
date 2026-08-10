import { GoogleGenAI } from '@google/genai';

import type { ProxyChatMessage } from './aiProxyService';
import {
  buildGeminiContents,
  historyHasVisionImage,
  messageText,
} from './visionMessageUtils';

function geminiConfig() {
  return {
    key: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  };
}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const { key } = geminiConfig();
  if (!key) throw new Error('GEMINI_API_KEY not configured on server');
  if (!client) client = new GoogleGenAI({ apiKey: key });
  return client;
}

export function isGeminiConfigured(): boolean {
  return Boolean(geminiConfig().key.trim());
}

function trimSystemText(text: string, maxChars = 10000): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(-maxChars)}\n\n[Earlier context trimmed for speed.]`;
}

function extractSystemInstruction(messages: ProxyChatMessage[]): string {
  const parts = messages
    .filter((m) => m.role === 'system')
    .map((m) => messageText(m.content))
    .filter(Boolean);

  const merged = parts.join('\n\n').trim();
  return trimSystemText(
    merged ||
      'You are Bhuvedam AI — a Telugu-speaking agriculture assistant for Indian farmers.',
  );
}

function buildTextPrompt(messages: ProxyChatMessage[]): string {
  const turns: string[] = [];

  for (const message of messages) {
    if (message.role === 'system') continue;
    const text = messageText(message.content);
    if (!text) continue;
    const label = message.role === 'assistant' ? 'Assistant' : 'Farmer';
    turns.push(`${label}: ${text}`);
  }

  if (!turns.length) {
    throw new Error('No user messages for Gemini');
  }

  return `${turns.join('\n')}\nAssistant:`;
}

export async function completeGeminiChat(
  messages: ProxyChatMessage[],
  opts: { voiceMode?: boolean; signal?: AbortSignal; temperature?: number } = {},
): Promise<string> {
  const { model } = geminiConfig();
  const ai = getClient();
  const systemInstruction = extractSystemInstruction(messages);
  const useVision = historyHasVisionImage(messages);
  const temperature = useVision
    ? 0.1
    : (opts.temperature ?? (opts.voiceMode ? 0.25 : 0.15));
  const maxOutputTokens = opts.voiceMode ? 768 : 2048;

  if (useVision) {
    const contents = buildGeminiContents(messages);
    if (!contents.length) {
      throw new Error('No vision content for Gemini');
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        maxOutputTokens,
        temperature,
        abortSignal: opts.signal,
      },
    });

    const text = response.text?.trim() ?? '';
    if (text) return text;
    throw new Error('Gemini returned an empty response');
  }

  const userPrompt = buildTextPrompt(messages);
  const response = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction,
      maxOutputTokens,
      temperature,
      abortSignal: opts.signal,
    },
  });

  const text = response.text?.trim() ?? '';
  if (text) return text;
  throw new Error('Gemini returned an empty response');
}

export async function streamGeminiChat(
  messages: ProxyChatMessage[],
  opts: { voiceMode?: boolean; signal?: AbortSignal; temperature?: number },
): Promise<ReadableStream<Uint8Array>> {
  const content = await completeGeminiChat(messages, opts);
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}
