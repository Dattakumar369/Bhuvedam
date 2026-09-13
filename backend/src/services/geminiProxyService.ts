import { GoogleGenAI } from '@google/genai';

import type { ProxyChatMessage } from './aiProxyService';
import {
  buildGeminiContents,
  historyHasVisionImage,
  messageText,
  type GeminiPart,
} from './visionMessageUtils';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function geminiConfig() {
  return {
    key: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  };
}

let client: GoogleGenAI | null = null;
let clientKey = '';

function getClient(): GoogleGenAI {
  const { key } = geminiConfig();
  if (!key) throw new Error('GEMINI_API_KEY not configured on server');
  if (!client || clientKey !== key) {
    client = new GoogleGenAI({ apiKey: key });
    clientKey = key;
  }
  return client;
}

export function isGeminiConfigured(): boolean {
  return getGeminiConfigIssue() === null;
}

/** Returns null when Gemini is ready; otherwise a short reason for logs. */
export function getGeminiConfigIssue(): string | null {
  const key = geminiConfig().key.trim();
  if (!key) return 'GEMINI_API_KEY missing';
  // Standard (AIza…) and auth (AQ.…) keys from Google AI Studio.
  if (!key.startsWith('AIza') && !key.startsWith('AQ.')) {
    return 'GEMINI_API_KEY unrecognized — create one at https://aistudio.google.com/apikey';
  }
  if (key.length < 20) return 'GEMINI_API_KEY too short';
  return null;
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

function partsToRest(parts: GeminiPart[]): Array<Record<string, unknown>> {
  return parts.map((part) => {
    if ('text' in part) return { text: part.text };
    return {
      inlineData: {
        mimeType: part.inlineData.mimeType,
        data: part.inlineData.data,
      },
    };
  });
}

/** Native REST — recommended for AIza and AQ auth keys (x-goog-api-key header). */
async function completeGeminiChatViaRest(
  messages: ProxyChatMessage[],
  opts: { voiceMode?: boolean; signal?: AbortSignal; temperature?: number },
  useVision: boolean,
  systemInstruction: string,
  temperature: number,
  maxOutputTokens: number,
): Promise<string> {
  const { key, model } = geminiConfig();
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent`;

  let contents: Array<{ role: string; parts: Array<Record<string, unknown>> }>;

  if (useVision) {
    const built = buildGeminiContents(messages);
    if (!built.length) throw new Error('No vision content for Gemini');
    contents = built.map((turn) => ({
      role: turn.role,
      parts: partsToRest(turn.parts),
    }));
  } else {
    contents = [{ role: 'user', parts: [{ text: buildTextPrompt(messages) }] }];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    }),
    signal: opts.signal,
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Gemini REST ${response.status}: ${raw.slice(0, 400)}`);
  }

  const data = JSON.parse(raw) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('')
      .trim() ?? '';

  if (text) return text;
  throw new Error('Gemini returned an empty response');
}

async function completeGeminiChatViaSdk(
  messages: ProxyChatMessage[],
  opts: { voiceMode?: boolean; signal?: AbortSignal; temperature?: number },
  useVision: boolean,
  systemInstruction: string,
  temperature: number,
  maxOutputTokens: number,
): Promise<string> {
  const { model } = geminiConfig();
  const ai = getClient();

  if (useVision) {
    const contents = buildGeminiContents(messages);
    if (!contents.length) throw new Error('No vision content for Gemini');

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

export async function completeGeminiChat(
  messages: ProxyChatMessage[],
  opts: { voiceMode?: boolean; signal?: AbortSignal; temperature?: number } = {},
): Promise<string> {
  const configIssue = getGeminiConfigIssue();
  if (configIssue) throw new Error(configIssue);

  const systemInstruction = extractSystemInstruction(messages);
  const useVision = historyHasVisionImage(messages);
  const temperature = useVision
    ? (opts.temperature ?? 0.25)
    : (opts.temperature ?? (opts.voiceMode ? 0.25 : 0.15));
  const maxOutputTokens = opts.voiceMode ? 1024 : 2048;

  // REST first — native x-goog-api-key works for both AIza and AQ auth keys.
  try {
    return await completeGeminiChatViaRest(
      messages,
      opts,
      useVision,
      systemInstruction,
      temperature,
      maxOutputTokens,
    );
  } catch (restErr) {
    console.warn(
      '[gemini] REST failed, trying SDK:',
      restErr instanceof Error ? restErr.message.slice(0, 200) : restErr,
    );
  }

  return completeGeminiChatViaSdk(
    messages,
    opts,
    useVision,
    systemInstruction,
    temperature,
    maxOutputTokens,
  );
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
