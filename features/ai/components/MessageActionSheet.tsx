import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Body, Caption } from '@/components/ui/Typography';
import type { ChatMessage } from '@/types/ai';
import { colors, radius, spacing } from '@/theme';

interface MessageActionSheetProps {
  visible: boolean;
  message: ChatMessage | null;
  editLabel: string;
  deleteLabel: string;
  title: string;
  onDismiss: () => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (message: ChatMessage) => void;
}

export function MessageActionSheet({
  visible,
  message,
  editLabel,
  deleteLabel,
  title,
  onDismiss,
  onEdit,
  onDelete,
}: MessageActionSheetProps) {
  if (!message) return null;

  const isUser = message.role === 'user';
  const preview = message.content.trim().slice(0, 120);

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss} title={title}>
      <Caption style={styles.preview} numberOfLines={3}>
        {preview}
      </Caption>

      <View style={styles.actions}>
        {isUser ? (
          <Pressable
            style={styles.actionRow}
            onPress={() => {
              onDismiss();
              onEdit(message);
            }}
          >
            <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.primary} />
            <Body style={styles.actionLabel}>{editLabel}</Body>
          </Pressable>
        ) : null}

        <Pressable
          style={styles.actionRow}
          onPress={() => {
            onDismiss();
            onDelete(message);
          }}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.error} />
          <Body style={[styles.actionLabel, styles.deleteLabel]}>{deleteLabel}</Body>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  preview: {
    color: colors.textTertiary,
    marginBottom: spacing.md,
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
  },
  actions: { gap: spacing.xs },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceVariant,
  },
  actionLabel: { fontFamily: 'Poppins_600SemiBold' },
  deleteLabel: { color: colors.error },
});
