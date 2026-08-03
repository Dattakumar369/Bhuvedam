import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatBubble } from '@/components/ui';
import { AppDialog } from '@/components/ui/Dialog';
import { Body, Caption } from '@/components/ui/Typography';
import { ChatInput } from '@/features/ai/components/ChatInput';
import { MessageActionSheet } from '@/features/ai/components/MessageActionSheet';
import { SuggestedQuestions } from '@/features/ai/components/SuggestedQuestions';
import { TypingIndicator } from '@/features/ai/components/TypingIndicator';
import { VoiceAssistantBar } from '@/features/ai/components/VoiceAssistantBar';
import { useChat } from '@/hooks/useChat';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useTranslation } from '@/hooks/useTranslation';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useVoiceOutput } from '@/hooks/useVoiceOutput';
import { stopSpeaking } from '@/services/ai/speechService';
import { pickChatImage, type PickedChatImage } from '@/services/media/pickChatImage';
import { useAIStore } from '@/store/aiStore';
import type { ChatMessage } from '@/types/ai';
import { truncate } from '@/utils/format';
import { colors, spacing } from '@/theme';
import { FEATURES } from '@/constants/features';
import { LANGUAGES } from '@/constants/languages';
import { AI_TRUST_UI_NOTE } from '@/constants/trustPolicy';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const listRef = useRef<FlashListRef<ChatMessage>>(null);
  const [input, setInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<ChatMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChatMessage | null>(null);
  const [pendingImage, setPendingImage] = useState<PickedChatImage | null>(null);
  const { t, language } = useTranslation();
  const languageLabel = LANGUAGES.find((l) => l.code === language)?.nativeName ?? language;
  const { conversation, isTyping, voiceModeEnabled, send, stop, removeMessage, toggleVoiceMode } =
    useChat(id);
  const setActiveConversation = useAIStore((s) => s.setActiveConversation);
  const clearError = useAIStore((s) => s.clearError);
  const aiError = useAIStore((s) => s.error);
  const { isSpeaking, speakText, stopSpeakingNow } = useVoiceOutput();
  const startListeningRef = useRef<() => Promise<void>>(async () => {});
  const stopListeningRef = useRef<() => void>(() => {});
  const resumeListenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResumeListenTimer = useCallback(() => {
    if (resumeListenTimerRef.current) {
      clearTimeout(resumeListenTimerRef.current);
      resumeListenTimerRef.current = null;
    }
  }, []);

  const resumeListeningAfterSpeech = useCallback(() => {
    if (!voiceModeEnabled) return;
    clearResumeListenTimer();
    // Brief pause so speaker echo is not picked up as a new question.
    resumeListenTimerRef.current = setTimeout(() => {
      resumeListenTimerRef.current = null;
      if (voiceModeEnabled) void startListeningRef.current();
    }, 800);
  }, [voiceModeEnabled, clearResumeListenTimer]);

  const handleVoiceComplete = useCallback(
    (response: string) => {
      if (!voiceModeEnabled) return;
      stopListeningRef.current();
      stopSpeakingNow();
      speakText(response, () => {
        resumeListeningAfterSpeech();
      });
    },
    [speakText, voiceModeEnabled, stopSpeakingNow, resumeListeningAfterSpeech],
  );

  const handleVoiceResult = useCallback(
    (transcript: string) => {
      const text = transcript.trim();
      if (!text || !id || isTyping || isSpeaking) return;
      clearResumeListenTimer();
      stopListeningRef.current();
      stopSpeakingNow();
      setInput('');
      void send(text, handleVoiceComplete);
    },
    [
      id,
      send,
      handleVoiceComplete,
      stopSpeakingNow,
      isTyping,
      isSpeaking,
      clearResumeListenTimer,
    ],
  );

  const { isListening, transcript, toggleListening, startListening, stopListening } = useVoiceInput({
    onResult: handleVoiceResult,
    onPartialResult: setInput,
    blocked: isSpeaking || isTyping,
  });

  startListeningRef.current = startListening;
  stopListeningRef.current = stopListening;

  useEffect(() => {
    if (id) setActiveConversation(id);
    return () => {
      setActiveConversation(null);
      clearError();
      clearResumeListenTimer();
      stopSpeaking();
    };
  }, [id, setActiveConversation, clearError, clearResumeListenTimer]);

  const scrollToEnd = useCallback(() => {
    if (conversation?.messages.length) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [conversation?.messages.length]);

  useEffect(() => {
    scrollToEnd();
  }, [conversation?.messages, isTyping, scrollToEnd]);

  useEffect(() => {
    if (keyboardHeight > 0) scrollToEnd();
  }, [keyboardHeight, scrollToEnd]);

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && !(FEATURES.chatImageUploadEnabled && pendingImage)) || !id || isTyping) return;
    stopSpeakingNow();
    stopListening();
    clearResumeListenTimer();
    const editId = editingMessageId;
    const image = FEATURES.chatImageUploadEnabled ? pendingImage : null;
    setInput('');
    setPendingImage(null);
    setEditingMessageId(null);
    await send(
      text,
      handleVoiceComplete,
      undefined,
      {
        editMessageId: editId ?? undefined,
        image: image ?? undefined,
        defaultImagePrompt: t.chatImageDefaultPrompt,
      },
    );
  };

  const handleAttachImage = useCallback(async () => {
    if (isTyping || editingMessageId) return;
    const picked = await pickChatImage();
    if (picked) setPendingImage(picked);
  }, [isTyping, editingMessageId]);

  const openMessageActions = useCallback((message: ChatMessage) => {
    if (message.isStreaming || !message.content.trim()) return;
    setActionMessage(message);
  }, []);

  const handleEditMessage = useCallback((message: ChatMessage) => {
    setEditingMessageId(message.id);
    setInput(message.content);
    setActionMessage(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setInput('');
    setPendingImage(null);
  }, []);

  const confirmDeleteMessage = useCallback(() => {
    if (!deleteTarget) return;
    if (editingMessageId === deleteTarget.id) {
      cancelEdit();
    }
    removeMessage(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, editingMessageId, cancelEdit, removeMessage]);

  const hasUserMessages = conversation?.messages.some((m) => m.role === 'user') ?? false;

  if (!conversation) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <View style={[styles.aiAvatar, isListening && styles.aiAvatarListening]}>
            <MaterialCommunityIcons name="robot" size={18} color={colors.white} />
          </View>
          <View>
            <Body style={styles.aiName}>Bhuvedam AI</Body>
            <Caption style={styles.aiStatus}>
              {isListening
                ? t.statusListening
                : isTyping
                  ? t.statusThinking
                  : isSpeaking
                    ? t.statusSpeaking
                    : truncate(conversation.title, 30)}
            </Caption>
            <Caption style={styles.languageBadge}>{languageLabel}</Caption>
          </View>
        </View>
        <Pressable
          onPress={toggleVoiceMode}
          style={styles.backBtn}
          accessibilityLabel="Toggle voice mode"
        >
          <MaterialCommunityIcons
            name={voiceModeEnabled ? 'volume-high' : 'volume-off'}
            size={22}
            color={voiceModeEnabled ? colors.primary : colors.textTertiary}
          />
        </Pressable>
      </View>

      <View style={styles.trustBar}>
        <MaterialCommunityIcons name="shield-lock-outline" size={14} color={colors.primary} />
        <Caption style={styles.trustText}>{AI_TRUST_UI_NOTE[language]}</Caption>
      </View>

      {FEATURES.chatImageUploadEnabled ? (
        <View style={styles.imageNoteBar}>
          <MaterialCommunityIcons name="camera-outline" size={14} color={colors.textTertiary} />
          <Caption style={styles.imageNoteText}>{t.chatImageSessionNote}</Caption>
        </View>
      ) : null}

      <VoiceAssistantBar
        isListening={isListening}
        isSpeaking={isSpeaking}
        isTyping={isTyping}
        voiceModeEnabled={voiceModeEnabled}
        transcript={transcript}
        onToggleVoiceMode={toggleVoiceMode}
        onStopSpeaking={() => {
          clearResumeListenTimer();
          stopSpeakingNow();
        }}
      />

      <View style={styles.listContainer}>
        {aiError ? (
          <View style={styles.errorBanner}>
            <Caption style={styles.errorText}>{aiError}</Caption>
          </View>
        ) : null}
        <FlashList
          ref={listRef}
          data={conversation.messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ChatBubble
              message={item}
              index={index}
              isEditing={editingMessageId === item.id}
              onLongPress={openMessageActions}
              onActionPress={openMessageActions}
            />
          )}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.lg }}
          onContentSizeChange={scrollToEnd}
        />
        {isTyping ? (
          <View style={styles.typingWrap}>
            <TypingIndicator />
          </View>
        ) : null}
      </View>

      {!hasUserMessages && !isTyping && !isListening ? (
        <SuggestedQuestions
          onSelect={(q) => {
            setInput(q);
          }}
        />
      ) : null}

      <ChatInput
        value={input}
        onChangeText={setInput}
        onSend={() => void handleSend()}
        onVoicePress={() => {
          clearResumeListenTimer();
          if (isTyping) {
            stop();
            return;
          }
          if (isSpeaking) {
            stopSpeakingNow();
          }
          void toggleListening();
        }}
        isListening={isListening}
        disabled={isTyping}
        placeholder={t.chatPlaceholder}
        listeningPlaceholder={t.chatListeningPlaceholder}
        editing={editingMessageId != null}
        editingLabel={t.editingMessage}
        cancelEditLabel={t.cancelEdit}
        onCancelEdit={cancelEdit}
        pendingImageUri={FEATURES.chatImageUploadEnabled ? pendingImage?.uri : undefined}
        onAttachImage={
          FEATURES.chatImageUploadEnabled ? () => void handleAttachImage() : undefined
        }
        onRemoveImage={FEATURES.chatImageUploadEnabled ? () => setPendingImage(null) : undefined}
        attachImageLabel={t.chatAttachImage}
      />

      <MessageActionSheet
        visible={actionMessage != null}
        message={actionMessage}
        title={t.messageActionsTitle}
        editLabel={t.messageEdit}
        deleteLabel={t.messageDelete}
        onDismiss={() => setActionMessage(null)}
        onEdit={handleEditMessage}
        onDelete={(message) => {
          setActionMessage(null);
          setDeleteTarget(message);
        }}
      />

      <AppDialog
        visible={deleteTarget != null}
        title={t.messageDeleteConfirmTitle}
        message={
          deleteTarget?.role === 'user'
            ? t.messageDeleteConfirmUser
            : t.messageDeleteConfirmAssistant
        }
        confirmLabel={t.messageDelete}
        cancelLabel={t.cancelEdit}
        destructive
        onConfirm={confirmDeleteMessage}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarListening: { backgroundColor: colors.error },
  aiName: { fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
  aiStatus: { color: colors.textTertiary, fontSize: 11 },
  languageBadge: { color: colors.primary, fontSize: 10, marginTop: 1 },
  trustBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: `${colors.primary}08`,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trustText: { flex: 1, color: colors.textTertiary, fontSize: 10, lineHeight: 14 },
  imageNoteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    backgroundColor: `${colors.primary}08`,
  },
  imageNoteText: { flex: 1, color: colors.textTertiary, fontSize: 10, lineHeight: 14 },
  listContainer: { flex: 1 },
  errorBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: `${colors.error}15`,
    borderWidth: 1,
    borderColor: `${colors.error}40`,
  },
  errorText: { color: colors.error, fontSize: 12 },
  typingWrap: { paddingHorizontal: spacing.md },
});
