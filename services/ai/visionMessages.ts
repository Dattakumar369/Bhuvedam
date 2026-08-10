import type { ChatMessage } from '@/types/ai';
import { imageSessionCache } from '@/services/media/imageSessionCache';

/** Vision mode: analyze whatever photo the farmer sends — no rejection templates. */
export const VISION_SYSTEM_ADDON = `PHOTO ANALYSIS:
The farmer sent a photo. Look at it carefully and analyze what is actually in the image.

If they typed a question, answer it using what you see in the photo.
If the photo shows crops, plants, pests, or a field — give practical farming advice when useful.
If the photo shows something else — still describe it clearly and help with their question.

Use simple language. Only describe what is visible — do not invent crop names, diseases, or details you cannot see.`;

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

export const VISION_MODEL_TEMPERATURE = 0.25;
