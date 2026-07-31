import { useCallback } from 'react';

import { useAIStore } from '@/store/aiStore';

interface SendOptions {
  editMessageId?: string;
  image?: { uri: string; base64: string };
  defaultImagePrompt?: string;
}

export function useChat(conversationId?: string) {
  const conversations = useAIStore((s) => s.conversations);
  const isTyping = useAIStore((s) => s.isTyping);
  const voiceModeEnabled = useAIStore((s) => s.voiceModeEnabled);
  const sendMessage = useAIStore((s) => s.sendMessage);
  const stopGeneration = useAIStore((s) => s.stopGeneration);
  const createConversation = useAIStore((s) => s.createConversation);
  const deleteConversation = useAIStore((s) => s.deleteConversation);
  const deleteMessage = useAIStore((s) => s.deleteMessage);
  const initializeConversations = useAIStore((s) => s.initializeConversations);
  const toggleVoiceMode = useAIStore((s) => s.toggleVoiceMode);

  const conversation = conversations.find((c) => c.id === conversationId);

  const send = useCallback(
    async (
      content: string,
      onComplete?: (response: string) => void,
      onEarlySpeak?: (snippet: string) => void,
      options?: SendOptions,
    ) => {
      if (!conversationId) return;
      await sendMessage(conversationId, content, onComplete, onEarlySpeak, options);
    },
    [conversationId, sendMessage],
  );

  const create = useCallback(() => createConversation(), [createConversation]);

  const remove = useCallback(
    (id: string) => deleteConversation(id),
    [deleteConversation],
  );

  const removeMessage = useCallback(
    (messageId: string) => {
      if (!conversationId) return;
      deleteMessage(conversationId, messageId);
    },
    [conversationId, deleteMessage],
  );

  const init = useCallback(() => initializeConversations(), [initializeConversations]);

  const stop = useCallback(() => stopGeneration(), [stopGeneration]);

  return {
    conversation,
    conversations,
    isTyping,
    voiceModeEnabled,
    send,
    create,
    remove,
    removeMessage,
    init,
    stop,
    toggleVoiceMode,
  };
}
