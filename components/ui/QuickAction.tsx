import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Label, Caption } from '@/components/ui/Typography';
import { colors, radius, shadows, spacing } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface QuickActionProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  color?: string;
  onPress: () => void;
}

export function QuickAction({ icon, label, color = colors.primary, onPress }: QuickActionProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[styles.container, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}18` }]}>
        <MaterialCommunityIcons name={icon} size={26} color={color} />
      </View>
      <Caption style={styles.label}>{label}</Caption>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    minWidth: 72,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  label: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
