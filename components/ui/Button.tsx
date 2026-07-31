import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ActivityIndicator } from 'react-native-paper';

import { Label } from '@/components/ui/Typography';
import { colors, radius, shadows, spacing } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyles = VARIANT_STYLES[variant];
  const sizeStyles = SIZE_STYLES[size];

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => {
        scale.value = withSpring(0.96);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        styles.base,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        animatedStyle,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} size="small" />
      ) : (
        <>
          {icon}
          <Label
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={[styles.label, { color: variantStyles.textColor }, sizeStyles.text]}
          >
            {label}
          </Label>
        </>
      )}
    </AnimatedPressable>
  );
}

const VARIANT_STYLES = {
  primary: {
    container: { backgroundColor: colors.primary, ...shadows.md },
    textColor: colors.white,
  },
  secondary: {
    container: { backgroundColor: colors.accent, ...shadows.sm },
    textColor: colors.textPrimary,
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    textColor: colors.primary,
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    textColor: colors.primary,
  },
};

const SIZE_STYLES = {
  sm: { container: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md }, text: { fontSize: 12 } },
  md: { container: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg }, text: { fontSize: 13 } },
  lg: { container: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl }, text: { fontSize: 15 } },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
    minHeight: 48,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    flexShrink: 1,
  },
});
