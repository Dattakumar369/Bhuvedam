import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Body, Caption } from '@/components/ui/Typography';
import type { Conversation } from '@/types/ai';
import { formatRelativeTime } from '@/utils/date';
import { truncate } from '@/utils/format';
import { colors, radius, spacing } from '@/theme';

interface ConversationListItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export function ConversationListItem({ conversation, onPress }: ConversationListItemProps) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const preview = lastMessage?.content ?? '';

  return (
    <Pressable onPress={onPress} style={styles.container} accessibilityRole="button">
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name="chat-outline" size={22} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Body style={styles.title} numberOfLines={1}>
          {conversation.title}
        </Body>
        <Caption numberOfLines={1}>{truncate(preview, 60)}</Caption>
      </View>
      <Caption style={styles.time}>{formatRelativeTime(conversation.updatedAt)}</Caption>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  title: { fontFamily: 'Poppins_600SemiBold', marginBottom: 2 },
  time: { color: colors.textTertiary },
});
