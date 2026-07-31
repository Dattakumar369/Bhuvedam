import type { ChatMessage } from '@/types/ai';
import { imageSessionCache } from '@/services/media/imageSessionCache';

export const VISION_SYSTEM_ADDON = `IMAGE ANALYSIS MODE:
The farmer uploaded a photo of crop, leaf, pest, soil, or field condition.
- Describe what you can clearly see in the image.
- Identify likely crop, disease, pest, nutrient issue, or weed if visible.
- Give practical next steps (spray, fertilizer, irrigation, when to consult local ag officer).
- If the photo is blurry or unclear, say so — do not guess details you cannot see.
- Label advice as general suggestion when not from LIVE DATA.`;

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
