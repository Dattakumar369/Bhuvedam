import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Caption } from '@/components/ui/Typography';
import {
  formatFreshnessLabel,
  freshnessTone,
} from '@/services/alerts/syncStatusService';
import { colors, radius, spacing } from '@/theme';

interface DataFreshnessBadgeProps {
  label: string;
  updatedAt: string | null | undefined;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export function DataFreshnessBadge({
  label,
  updatedAt,
  icon = 'clock-outline',
}: DataFreshnessBadgeProps) {
  const tone = freshnessTone(updatedAt);

  return (
    <View style={[styles.badge, tone === 'fresh' && styles.fresh, tone === 'stale' && styles.stale]}>
      <MaterialCommunityIcons
        name={icon}
        size={12}
        color={tone === 'fresh' ? colors.primary : colors.textTertiary}
      />
      <Caption style={[styles.text, tone === 'fresh' && styles.textFresh]}>
        {label}: {formatFreshnessLabel(updatedAt)}
      </Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceVariant,
  },
  fresh: { backgroundColor: `${colors.primary}12` },
  stale: { backgroundColor: `${colors.accent}12` },
  text: { fontSize: 10, color: colors.textTertiary },
  textFresh: { color: colors.primary },
});
