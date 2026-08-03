import { create } from 'zustand';

import { getTranslations } from '@/constants/i18n/translations';
import { resolveApiError } from '@/services/api/userFacingError';
import { STORAGE_KEYS } from '@/constants/app';
import { hasRealAIProvider } from '@/constants/aiConfig';
import type { LanguageCode } from '@/constants/languages';
import {
  buildFullSystemPromptAsync,
  prepareContextBeforeChat,
} from '@/services/ai/contextBuilder';
import { streamAIResponse } from '@/services/ai/aiStreamService';
import { getEarlySpeakSnippet } from '@/services/ai/voiceEarlySpeak';
import { cacheAiKnowledgeAnswer, isThinDbContext } from '@/services/agData/knowledgeService';
import { createMockConversation } from '@/services/mock/aiMock';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import { useLanguageStore } from '@/store/languageStore';
import { useUserStore } from '@/store/userStore';
import type { ChatMessage, Conversation } from '@/types/ai';
import { trimMessagesForModel } from '@/services/ai/modelMessages';
import { VISION_SYSTEM_ADDON, historyHasVisionImage } from '@/services/ai/visionMessages';
import { imageSessionCache } from '@/services/media/imageSessionCache';
import { generateId } from '@/utils/format';
import { detectQueryLanguage } from '@/utils/detectQueryLanguage';
import { secureStorage } from '@/utils/storage';

const MAX_STORED_CONVERSATIONS = 15;
const MAX_MESSAGES_PER_CONVERSATION = 60;
const MAX_MODEL_HISTORY = 6;

async function persistConversations(conversations: Conversation[]): Promise<void> {
  const trimmed = conversations.slice(0, MAX_STORED_CONVERSATIONS).map((conv) => ({
    ...conv,
    messages: conv.messages
      .filter((m) => !m.isStreaming && (m.content.trim() || m.imageUri))
      .slice(-MAX_MESSAGES_PER_CONVERSATION)
      .map(({ imageUri: _imageUri, ...m }) => m),
  }));
  await secureStorage.set(STORAGE_KEYS.conversations, JSON.stringify(trimmed));
}

interface PendingChatImage {
  uri: string;
  base64: string;
}

interface SendMessageOptions {
  editMessageId?: string;
  image?: PendingChatImage;
  defaultImagePrompt?: string;
}

interface AIState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  voiceModeEnabled: boolean;
  abortController: AbortController | null;
  hydrate: () => Promise<void>;
  initializeConversations: () => void;
  createConversation: () => string;
  setActiveConversation: (id: string | null) => void;
  sendMessage: (
    conversationId: string,
    content: string,
    onComplete?: (response: string) => void,
    onEarlySpeak?: (snippet: string) => void,
    options?: SendMessageOptions,
  ) => Promise<void>;
  stopGeneration: () => void;
  deleteConversation: (id: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  getActiveConversation: () => Conversation | undefined;
  setVoiceModeEnabled: (enabled: boolean) => void;
  toggleVoiceMode: () => void;
  clearError: () => void;
  reset: () => Promise<void>;
}

function createWelcomeConversation(language: LanguageCode): Conversation {
  const t = getTranslations(language);
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: t.newChat,
    messages: [
      {
        id: generateId(),
        role: 'assistant',
        content: t.aiWelcome,
        timestamp: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export const useAIStore = create<AIState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isTyping: false,
  isLoading: false,
  error: null,
  voiceModeEnabled: false,
  abortController: null,

  hydrate: async () => {
    const userId = useUserStore.getState().user?.id;
    const isAuthenticated = useUserStore.getState().isAuthenticated;
    if (!isAuthenticated || !userId) {
      await get().reset();
      return;
    }

    const lastUserId = await secureStorage.get(STORAGE_KEYS.lastUserId);
    if (!lastUserId || lastUserId !== userId) {
      await get().reset();
      return;
    }

    const raw = await secureStorage.get(STORAGE_KEYS.conversations);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Conversation[];
      if (parsed.length) set({ conversations: parsed });
    } catch {
      // ignore corrupt storage
    }
  },

  reset: async () => {
    set({
      conversations: [],
      activeConversationId: null,
      isTyping: false,
      isLoading: false,
      error: null,
      abortController: null,
    });
    await secureStorage.remove(STORAGE_KEYS.conversations);
  },

  initializeConversations: () => {
    if (get().conversations.length > 0) return;
    if (hasRealAIProvider()) return;
    const language = useLanguageStore.getState().language;
    const t = getTranslations(language);
    set({
      conversations: t.mockConversations.map(({ title, preview }) =>
        createMockConversation(title, preview, language),
      ),
    });
  },

  createConversation: () => {
    const language = useLanguageStore.getState().language;
    const conversation = createWelcomeConversation(language);
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConversationId: conversation.id,
    }));
    void persistConversations(get().conversations);
    return conversation.id;
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setVoiceModeEnabled: (enabled) => set({ voiceModeEnabled: enabled }),

  toggleVoiceMode: () => set((state) => ({ voiceModeEnabled: !state.voiceModeEnabled })),

  clearError: () => set({ error: null }),

  stopGeneration: () => {
    get().abortController?.abort();
    set({ abortController: null, isTyping: false });
  },

  sendMessage: async (conversationId, content, onComplete, onEarlySpeak, options) => {
    const trimmed = content.trim();
    const pendingImage = options?.image;
    if (!trimmed && !pendingImage) return;

    const messageText =
      trimmed ||
      options?.defaultImagePrompt ||
      'Analyze this farm photo — identify crop, disease/pest if visible, and suggest practical solutions.';

    if (get().isTyping) {
      get().stopGeneration();
    }

    const editMessageId = options?.editMessageId;
    const conversation = get().conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    let userMessage: ChatMessage;
    let history: ChatMessage[];

    const assistantId = generateId();
    const streamingMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    const abortController = new AbortController();

    if (editMessageId) {
      const msgIndex = conversation.messages.findIndex((m) => m.id === editMessageId);
      if (msgIndex < 0) return;
      const existing = conversation.messages[msgIndex];
      if (existing.role !== 'user' || existing.isStreaming) return;

      userMessage = {
        ...existing,
        content: messageText,
        timestamp: new Date().toISOString(),
      };
      const keptMessages = conversation.messages.slice(0, msgIndex);
      const pastMessages = trimMessagesForModel(
        keptMessages.filter(
          (m) => !m.isStreaming && m.role !== 'system' && (m.content.trim() || m.imageUri),
        ),
        MAX_MODEL_HISTORY - 1,
      );
      history = [...pastMessages, userMessage];

      set((state) => ({
        isTyping: true,
        error: null,
        abortController,
        conversations: state.conversations.map((conv) => {
          if (conv.id !== conversationId) return conv;
          return {
            ...conv,
            messages: [...keptMessages, userMessage, streamingMessage],
            updatedAt: new Date().toISOString(),
          };
        }),
      }));
    } else {
      userMessage = {
        id: generateId(),
        role: 'user',
        content: messageText,
        timestamp: new Date().toISOString(),
        ...(pendingImage ? { imageUri: pendingImage.uri } : {}),
      };

      if (pendingImage) {
        imageSessionCache.set(userMessage.id, pendingImage.base64);
      }

      const pastMessages = trimMessagesForModel(
        conversation.messages.filter(
          (m) =>
            !m.isStreaming && m.role !== 'system' && (m.content.trim() || m.imageUri),
        ),
        MAX_MODEL_HISTORY - 1,
      );
      history = [...pastMessages, userMessage];

      set((state) => ({
        isTyping: true,
        error: null,
        abortController,
        conversations: state.conversations.map((conv) => {
          if (conv.id !== conversationId) return conv;
          const title =
            conv.messages.length <= 1
              ? pendingImage
                ? '📷 Photo analysis'
                : messageText.slice(0, 40)
              : conv.title;
          return {
            ...conv,
            title,
            messages: [...conv.messages, userMessage, streamingMessage],
            updatedAt: new Date().toISOString(),
          };
        }),
      }));
    }

    const visionMode = historyHasVisionImage(history);

    try {
      const language = useLanguageStore.getState().language;
      const replyLanguage = detectQueryLanguage(messageText, language);
      const voiceMode = get().voiceModeEnabled;
      let spokeEarly = false;

      await prepareContextBeforeChat(messageText);
      const { prompt: baseSystemPrompt, dbContext, cropIds } = await buildFullSystemPromptAsync(
        language,
        get().conversations,
        conversationId,
        voiceMode,
        messageText,
      );

      const systemPrompt = visionMode
        ? `${baseSystemPrompt}\n\n${VISION_SYSTEM_ADDON}`
        : baseSystemPrompt;

      const fullResponse = await streamAIResponse({
        messages: history,
        language: replyLanguage,
        systemPrompt,
        voiceMode,
        signal: abortController.signal,
        onChunk: (chunk) => {
          // Early TTS while streaming conflicts with voice mode (cuts off full answer, mic hears echo).
          if (!voiceMode && !spokeEarly) {
            const snippet = getEarlySpeakSnippet(chunk);
            if (snippet) {
              spokeEarly = true;
              onEarlySpeak?.(snippet);
            }
          }

          set((state) => ({
            conversations: state.conversations.map((conv) => {
              if (conv.id !== conversationId) return conv;
              return {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === assistantId ? { ...msg, content: chunk } : msg,
                ),
              };
            }),
          }));
        },
      });

      set((state) => ({
        isTyping: false,
        abortController: null,
        conversations: state.conversations.map((conv) => {
          if (conv.id !== conversationId) return conv;
          return {
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: fullResponse, isStreaming: false }
                : msg,
            ),
          };
        }),
      }));

      void persistConversations(get().conversations);

      if (isThinDbContext(dbContext) && fullResponse.trim().length >= 80) {
        void cacheAiKnowledgeAnswer(messageText, fullResponse, { cropIds, dbContext });
      }

      onComplete?.(fullResponse);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;

      const errorMessage = resolveApiError(error, 'AI_CHAT_FAILED');

      if (__DEV__) {
        console.error('[AI] Response failed:', error);
      }

      set((state) => ({
        isTyping: false,
        abortController: null,
        error: errorMessage,
        conversations: state.conversations.map((conv) => {
          if (conv.id !== conversationId) return conv;
          return {
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content: errorMessage,
                    isStreaming: false,
                  }
                : msg,
            ),
          };
        }),
      }));
    }
  },

  deleteConversation: (id) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
    }));
    void persistConversations(get().conversations);
  },

  deleteMessage: (conversationId, messageId) => {
    if (get().isTyping) {
      get().stopGeneration();
    }

    const language = useLanguageStore.getState().language;
    const welcomeMessage = createWelcomeConversation(language).messages[0];

    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id !== conversationId) return conv;

        const idx = conv.messages.findIndex((m) => m.id === messageId);
        if (idx < 0) return conv;

        const msg = conv.messages[idx];
        if (msg.isStreaming) return conv;

        imageSessionCache.remove(messageId);

        let messages =
          msg.role === 'user'
            ? conv.messages.slice(0, idx)
            : conv.messages.filter((_, i) => i !== idx);

        if (messages.length === 0) {
          messages = [welcomeMessage];
        }

        return {
          ...conv,
          messages,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    void persistConversations(get().conversations);
  },

  getActiveConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find((c) => c.id === activeConversationId);
  },
}));
