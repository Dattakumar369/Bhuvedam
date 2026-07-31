import { StyleSheet, View } from 'react-native';

import { Caption } from '@/components/ui/Typography';
import { colors, radius } from '@/theme';

interface BadgeProps {
  label: string | number;
  variant?: 'primary' | 'accent' | 'error';
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  return (
    <View style={[styles.badge, VARIANTS[variant]]}>
      <Caption style={styles.label}>{label}</Caption>
    </View>
  );
}

const VARIANTS = {
  primary: { backgroundColor: colors.primary },
  accent: { backgroundColor: colors.accent },
  error: { backgroundColor: colors.error },
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  label: { color: colors.white, fontSize: 10, fontFamily: 'Poppins_600SemiBold' },
});
