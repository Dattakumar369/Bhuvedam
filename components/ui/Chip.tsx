import { Pressable, StyleSheet } from 'react-native';

import { Label } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Label style={[styles.label, selected && styles.selectedLabel]}>{label}</Label>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: `${colors.primary}18`,
    borderColor: colors.primary,
  },
  label: { color: colors.textSecondary },
  selectedLabel: { color: colors.primary },
});
