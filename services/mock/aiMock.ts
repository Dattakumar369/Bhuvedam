import type { ChatMessage, Conversation } from '@/types/ai';
import type { LanguageCode } from '@/constants/languages';
import { getTranslations } from '@/constants/i18n/translations';
import { generateId } from '@/utils/format';

function getAIResponse(message: string, language: LanguageCode): string {
  const { mockResponses } = getTranslations(language);
  const lower = message.toLowerCase();

  const cropKeywords = ['crop', 'plant', 'फसल', 'पिक', 'பயிர', 'పంట', 'ಬೆಳೆ', 'वाढ', 'नां', 'बो'];
  const pestKeywords = ['pest', 'insect', 'कीट', 'कीटक', 'பூச்ச', 'తెగ', 'ಕೀಟ'];
  const irrigationKeywords = ['irrigation', 'water', 'सिंच', 'पाण', 'பாச', 'నీట', 'ನೀರ'];

  if (cropKeywords.some((k) => lower.includes(k))) {
    return mockResponses.crop;
  }
  if (pestKeywords.some((k) => lower.includes(k))) {
    return mockResponses.pest;
  }
  if (irrigationKeywords.some((k) => lower.includes(k))) {
    return mockResponses.irrigation;
  }
  return mockResponses.default;
}

export async function simulateAIResponse(
  message: string,
  language: LanguageCode = 'en',
): Promise<ChatMessage> {
  await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));
  return {
    id: generateId(),
    role: 'assistant',
    content: getAIResponse(message, language),
    timestamp: new Date().toISOString(),
  };
}

export async function simulateStreamingResponse(
  message: string,
  language: LanguageCode,
  onChunk: (chunk: string) => void,
): Promise<ChatMessage> {
  const fullResponse = getAIResponse(message, language);
  const words = fullResponse.split(' ');
  let content = '';

  for (const word of words) {
    await new Promise((resolve) => setTimeout(resolve, 40 + Math.random() * 30));
    content += (content ? ' ' : '') + word;
    onChunk(content);
  }

  return {
    id: generateId(),
    role: 'assistant',
    content: fullResponse,
    timestamp: new Date().toISOString(),
  };
}

export function createMockConversation(
  title: string,
  preview: string,
  language: LanguageCode = 'en',
): Conversation {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title,
    messages: [
      {
        id: generateId(),
        role: 'user',
        content: preview,
        timestamp: now,
      },
      {
        id: generateId(),
        role: 'assistant',
        content: getAIResponse(preview, language),
        timestamp: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}
