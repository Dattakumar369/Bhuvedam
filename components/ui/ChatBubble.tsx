import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Body, Caption } from '@/components/ui/Typography';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import type { ChatMessage } from '@/types/ai';
import { formatTime } from '@/utils/date';
import { colors, radius, spacing } from '@/theme';

interface ChatBubbleProps {
  message: ChatMessage;
  index: number;
  onLongPress?: (message: ChatMessage) => void;
  onActionPress?: (message: ChatMessage) => void;
  isEditing?: boolean;
}

export function ChatBubble({
  message,
  index,
  onLongPress,
  onActionPress,
  isEditing,
}: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const canInteract =
    !message.isStreaming && Boolean(message.content.trim() || message.imageUri);

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 30).springify()}
      style={[styles.row, isUser && styles.rowUser]}
    >
      <Pressable
        onLongPress={canInteract ? () => onLongPress?.(message) : undefined}
        delayLongPress={350}
        style={[styles.bubbleWrap, isEditing && styles.bubbleEditing]}
      >
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {message.imageUri ? (
            <Image source={{ uri: message.imageUri }} style={styles.messageImage} />
          ) : null}
          {message.content.trim() ? (
            isUser ? (
              <Body style={styles.userText}>{message.content}</Body>
            ) : (
              <MarkdownRenderer content={message.content} />
            )
          ) : message.isStreaming ? (
            <MarkdownRenderer content="..." />
          ) : null}
          {message.isStreaming ? <View style={styles.cursor} /> : null}
        </View>

        {canInteract ? (
          <Pressable
            onPress={() => onActionPress?.(message)}
            style={[styles.moreBtn, isUser ? styles.moreBtnUser : styles.moreBtnAssistant]}
            hitSlop={8}
            accessibilityLabel="Message options"
          >
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={16}
              color={isUser ? 'rgba(255,255,255,0.85)' : colors.textTertiary}
            />
          </Pressable>
        ) : null}
      </Pressable>

      <Caption style={[styles.time, isUser && styles.timeUser]}>
        {formatTime(message.timestamp)}
      </Caption>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.md,
    alignItems: 'flex-start',
    maxWidth: '88%',
  },
  rowUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubbleWrap: {
    position: 'relative',
    maxWidth: '100%',
  },
  bubbleEditing: {
    opacity: 0.75,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.lg,
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.xs,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userText: { color: colors.white },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  time: { marginTop: spacing.xxs, color: colors.textTertiary },
  timeUser: { textAlign: 'right' },
  cursor: {
    width: 8,
    height: 16,
    backgroundColor: colors.primary,
    marginTop: 4,
    borderRadius: 2,
  },
  moreBtn: {
    position: 'absolute',
    top: 4,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  moreBtnUser: { right: 4 },
  moreBtnAssistant: { right: 4, backgroundColor: `${colors.surfaceVariant}90` },
});
