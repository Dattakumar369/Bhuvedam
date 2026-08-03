import { GoogleGenAI } from '@google/genai';

import type { ProxyChatMessage } from './aiProxyService';

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

function messageText(content: ProxyChatMessage['content']): string {
  if (typeof content === 'string') return content;
  return content.map((part) => part.text ?? '').join(' ').trim();
}

function trimSystemText(text: string, maxChars = 10000): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(-maxChars)}\n\n[Earlier context trimmed for speed.]`;
}

function buildPrompt(messages: ProxyChatMessage[], voiceMode: boolean) {
  let systemText = '';
  const turns: string[] = [];

  for (const message of messages) {
    const text = messageText(message.content);
    if (!text) continue;

    if (message.role === 'system') {
      systemText = systemText ? `${systemText}\n\n${text}` : text;
      continue;
    }

    const label = message.role === 'assistant' ? 'Assistant' : 'Farmer';
    turns.push(`${label}: ${text}`);
  }

  if (!turns.length) {
    throw new Error('No user messages for Gemini');
  }

  const conversation = turns.join('\n');
  const instruction = trimSystemText(
    systemText ||
      'You are Bhuvedam AI — a Telugu-speaking agriculture assistant for Indian farmers.',
  );

  return {
    systemInstruction: instruction,
    userPrompt: `${conversation}\nAssistant:`,
    voiceMode,
  };
}

export async function completeGeminiChat(
  messages: ProxyChatMessage[],
  opts: { voiceMode?: boolean; signal?: AbortSignal; temperature?: number } = {},
): Promise<string> {
  const { model } = geminiConfig();
  const ai = getClient();
  const { systemInstruction, userPrompt, voiceMode } = buildPrompt(messages, opts.voiceMode ?? false);
  const temperature = opts.temperature ?? (voiceMode ? 0.25 : 0.15);

  const response = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction,
      maxOutputTokens: voiceMode ? 768 : 2048,
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
