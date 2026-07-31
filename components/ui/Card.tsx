import { StyleSheet, View, ViewProps } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, radius, shadows, spacing } from '@/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined' | 'glass';
  padding?: number;
  animate?: boolean;
  delay?: number;
}

export function Card({
  children,
  variant = 'elevated',
  padding = spacing.lg,
  animate = false,
  delay = 0,
  style,
  ...props
}: CardProps) {
  const content = (
    <View
      {...props}
      style={[styles.base, VARIANT_STYLES[variant], { padding }, style]}
    >
      {children}
    </View>
  );

  if (animate) {
    return (
      <Animated.View entering={FadeInDown.delay(delay).springify()}>
        {content}
      </Animated.View>
    );
  }

  return content;
}

const VARIANT_STYLES = StyleSheet.create({
  elevated: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  filled: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.lg,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  glass: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
});
