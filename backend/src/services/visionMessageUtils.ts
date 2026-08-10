import type { ProxyChatMessage } from './aiProxyService';

export type ParsedImagePart = { mimeType: string; data: string };

export function messageText(content: ProxyChatMessage['content']): string {
  if (typeof content === 'string') return content;
  return content.map((part) => part.text ?? '').join(' ').trim();
}

export function parseOpenAIContent(content: ProxyChatMessage['content']): {
  text: string;
  images: ParsedImagePart[];
} {
  if (typeof content === 'string') {
    return { text: content, images: [] };
  }

  const images: ParsedImagePart[] = [];
  const textParts: string[] = [];

  for (const part of content) {
    if (part.type === 'text' && part.text?.trim()) {
      textParts.push(part.text.trim());
    }
    if (part.type === 'image_url' && part.image_url?.url) {
      const match = part.image_url.url.match(/^data:([^;]+);base64,(.+)$/i);
      if (match?.[1] && match[2]) {
        images.push({ mimeType: match[1], data: match[2] });
      }
    }
  }

  return { text: textParts.join('\n'), images };
}

export function messageHasVisionContent(content: ProxyChatMessage['content']): boolean {
  return parseOpenAIContent(content).images.length > 0;
}

export function historyHasVisionImage(messages: ProxyChatMessage[]): boolean {
  return messages.some((m) => m.role === 'user' && messageHasVisionContent(m.content));
}

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export function buildGeminiContents(
  messages: ProxyChatMessage[],
): Array<{ role: 'user' | 'model'; parts: GeminiPart[] }> {
  const contents: Array<{ role: 'user' | 'model'; parts: GeminiPart[] }> = [];

  for (const message of messages) {
    if (message.role === 'system') continue;

    const { text, images } = parseOpenAIContent(message.content);
    const parts: GeminiPart[] = [];

    for (const image of images) {
      parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
    }
    if (text) parts.push({ text });

    if (!parts.length) continue;

    contents.push({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts,
    });
  }

  return contents;
}

export type OllamaVisionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[];
};

export function toOllamaVisionMessages(messages: ProxyChatMessage[]): OllamaVisionMessage[] {
  return messages.map((message) => {
    const { text, images } = parseOpenAIContent(message.content);

    if (message.role === 'user' && images.length) {
      return {
        role: 'user',
        content: text || 'Analyze this farm photo.',
        images: images.map((img) => img.data),
      };
    }

    return {
      role: message.role,
      content: messageText(message.content),
    };
  });
}
