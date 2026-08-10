import type { ChatMessage } from '@/types/ai';
import { imageSessionCache } from '@/services/media/imageSessionCache';

/** System instructions when chat includes a photo — model analyzes image directly (no user prompt required). */
export const VISION_SYSTEM_ADDON = `IMAGE ANALYSIS (farmer uploaded a photo — analyze it directly like ChatGPT/Gemini vision):
Look at the image first. The farmer may or may not have typed a question — if they did, answer it using what you see.

If the image is NOT agriculture (laptop, phone, person, food, furniture, building, vehicle, etc.):
Reply briefly:
**Not a farm photo**
**What I see:** [what the object actually is]
**Please upload:** a clear crop leaf, stem, pest-on-plant, or field photo.

If it IS a crop/field/plant photo, reply naturally in simple language:
**What I see** — only what is visible in the photo
**Likely problem** — disease / pest / nutrient / weed / healthy / unclear
**What to do** — 2–4 practical steps
**Important** — confirm spray with local ag officer; one photo is not a full diagnosis

Never invent crop names or diseases when the photo is not clearly a farm plant.`;

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

/** Image-only messages send just the image; optional farmer text is included when present. */
export function buildOpenAIMessageContent(message: ChatMessage): string | OpenAIContentPart[] {
  const base64 = getImageBase64ForMessage(message);
  if (message.role === 'user' && base64) {
    const parts: OpenAIContentPart[] = [
      {
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${base64}` },
      },
    ];
    const userText = message.content.trim();
    if (userText) {
      parts.push({ type: 'text', text: userText });
    }
    return parts;
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
    return {
      role: 'user',
      content: message.content.trim(),
      images: [base64],
    };
  }
  return { role: message.role as 'user' | 'assistant', content: message.content };
}

export const VISION_MODEL_TEMPERATURE = 0.1;
