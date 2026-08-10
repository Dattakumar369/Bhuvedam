import type { ChatMessage } from '@/types/ai';
import { imageSessionCache } from '@/services/media/imageSessionCache';

export const VISION_SYSTEM_ADDON = `IMAGE SCAN MODE (farmer uploaded a crop/field photo):
Reply in a CLEAR, CLEAN structure — simple language, no jargon dump.

**What I see** — crop/plant part in photo, visible symptoms (spots, yellowing, holes, wilt, pest, etc.)
**Likely problem** — best guess: disease / pest / nutrient / weed / healthy / unclear
**What to do** — 2–4 practical steps (field check, irrigation, safe spray only if needed)
**Important** — confirm with local agriculture officer before buying spray; say if photo is blurry or not enough to judge

Rules:
- Do NOT invent product brands or exact doses unless FARMING LIBRARY in context supports it.
- If unsure, say "photo alone is not enough" and ask crop name + village.
- Never claim 100% diagnosis from one photo.`;

export function messageHasVisionImage(message: ChatMessage): boolean {
  return message.role === 'user' && Boolean(message.imageUri || imageSessionCache.has(message.id));
}

export function historyHasVisionImage(messages: ChatMessage[]): boolean {
  return messages.some(messageHasVisionImage);
}

export function getImageBase64ForMessage(message: ChatMessage): string | undefined {
  return imageSessionCache.getBase64(message.id);
}

type OpenAIContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export function buildOpenAIMessageContent(message: ChatMessage): string | OpenAIContentPart[] {
  const base64 = getImageBase64ForMessage(message);
  if (message.role === 'user' && base64) {
    // Gemma 4 & most vision models: image before text for best results
    return [
      {
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${base64}` },
      },
      { type: 'text', text: message.content },
    ];
  }
  return message.content;
}

export type OllamaVisionMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
};

export function buildOllamaMessage(message: ChatMessage): OllamaVisionMessage {
  const base64 = getImageBase64ForMessage(message);
  if (message.role === 'user' && base64) {
    return { role: 'user', content: message.content, images: [base64] };
  }
  return { role: message.role as 'user' | 'assistant', content: message.content };
}
