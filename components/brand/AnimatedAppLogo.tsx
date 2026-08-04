import { useEffect } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { APP_ASSETS } from '@/constants/assets';

interface AnimatedAppLogoProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
  /** Play entrance animation on mount */
  animate?: boolean;
}

export function AnimatedAppLogo({ size = 112, style, animate = true }: AnimatedAppLogoProps) {
  const logoScale = useSharedValue(animate ? 0.35 : 1);
  const logoOpacity = useSharedValue(animate ? 0 : 1);
  const logoRotate = useSharedValue(animate ? -8 : 0);
  const ringScale = useSharedValue(0.85);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    if (!animate) return;

    logoOpacity.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
    logoRotate.value = withSpring(0, { damping: 14, stiffness: 140 });
    logoScale.value = withSpring(1, { damping: 11, stiffness: 120, mass: 0.9 });

    ringOpacity.value = withDelay(
      250,
      withRepeat(
        withSequence(
          withTiming(0.45, { duration: 0 }),
          withTiming(0, { duration: 1100, easing: Easing.out(Easing.quad) }),
        ),
        2,
        false,
      ),
    );
    ringScale.value = withDelay(
      250,
      withRepeat(
        withSequence(
          withTiming(0.85, { duration: 0 }),
          withTiming(1.55, { duration: 1100, easing: Easing.out(Easing.cubic) }),
        ),
        2,
        false,
      ),
    );
  }, [animate, logoOpacity, logoRotate, logoScale, ringOpacity, ringScale]);

  const plateStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }, { rotate: `${logoRotate.value}deg` }],
    opacity: logoOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const imageSize = size * 0.72;
  const plateRadius = size * 0.22;

  return (
    <View style={[styles.wrap, { width: size * 1.5, height: size * 1.5 }, style]}>
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: plateRadius,
          },
          ringStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.plate,
          {
            width: size,
            height: size,
            borderRadius: plateRadius,
          },
          plateStyle,
        ]}
      >
        <Image
          source={APP_ASSETS.logo}
          accessibilityLabel="Bhuvedam logo"
          style={{ width: imageSize, height: imageSize }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plate: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
