import { StyleSheet, View, ViewProps } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppColors } from '@/hooks/useAppColors';
import { radius, shadows, spacing } from '@/theme';

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
  const c = useAppColors();

  const variantStyle =
    variant === 'elevated'
      ? { backgroundColor: c.surface, borderRadius: radius.lg, ...shadows.md }
      : variant === 'filled'
        ? { backgroundColor: c.surfaceVariant, borderRadius: radius.lg }
        : variant === 'outlined'
          ? {
              backgroundColor: c.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: c.border,
            }
          : {
              backgroundColor: c.glass,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)',
            };

  const content = (
    <View {...props} style={[styles.base, variantStyle, { padding }, style]}>
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

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
});
