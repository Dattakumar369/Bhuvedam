import { Pressable, StyleSheet, View } from 'react-native';

import { Headline, Subtitle } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionTitle({ title, subtitle, actionLabel, onAction }: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Headline style={styles.title}>{title}</Headline>
        {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button">
          <Subtitle style={styles.action}>{actionLabel}</Subtitle>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  textContainer: { flex: 1 },
  title: { fontSize: 20 },
  action: { color: colors.primary, fontFamily: 'Poppins_600SemiBold' },
});
