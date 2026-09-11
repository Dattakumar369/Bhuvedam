import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { APP } from '@/constants/app';
import { APP_ASSETS } from '@/constants/assets';
import { Subtitle } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

/** Total splash visibility — keep in sync with app/index.tsx */
export const SPLASH_MIN_DURATION_MS = 2000;

const ICON_SIZE = 148;
const WORD = 'BHUVEDAM';
const ACCENT_INDEXES = new Set([0, 3]);

/**
 * Opening brand moment: real logo asset pops in, then BHUVEDAM + tagline.
 */
export function BhuvedamSplashAnimation() {
  const logoScale = useSharedValue(0.82);
  const logoOpacity = useSharedValue(0);
  const wordProgress = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 120 });

    wordProgress.value = withDelay(
      450,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );

    taglineOpacity.value = withDelay(1100, withTiming(1, { duration: 400 }));
  }, [logoOpacity, logoScale, taglineOpacity, wordProgress]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: interpolate(taglineOpacity.value, [0, 1], [8, 0]) }],
  }));

  return (
    <View style={styles.stage}>
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <Image
          source={APP_ASSETS.logo}
          accessibilityLabel="Bhuvedam logo"
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={styles.nameRow}>
        {WORD.split('').map((char, index) => (
          <AnimatedLetter key={`${char}-${index}`} char={char} index={index} progress={wordProgress} />
        ))}
      </View>

      <Animated.View style={taglineStyle}>
        <Subtitle style={styles.tagline}>{APP.tagline}</Subtitle>
      </Animated.View>
    </View>
  );
}

function AnimatedLetter({
  char,
  index,
  progress,
}: {
  char: string;
  index: number;
  progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const start = index * 0.085;
    const t = interpolate(progress.value, [start, start + 0.32], [0, 1], 'clamp');
    return {
      opacity: t,
      transform: [
        { translateY: interpolate(t, [0, 1], [6, 0]) },
        { scale: interpolate(t, [0, 1], [0.94, 1]) },
      ],
    };
  });

  const accent = ACCENT_INDEXES.has(index);

  return (
    <Animated.Text
      style={[
        styles.nameLetter,
        accent ? styles.nameAccent : styles.nameWhite,
        { fontSize: accent ? 36 : 30 },
        style,
      ]}
    >
      {char}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  logoWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE * 0.22,
    overflow: 'hidden',
    shadowColor: '#0D3B1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: 1,
  },
  nameLetter: {
    fontFamily: 'Poppins_700Bold',
    includeFontPadding: false,
    letterSpacing: 0.4,
  },
  nameWhite: {
    color: colors.white,
  },
  nameAccent: {
    color: '#9AD4FF',
  },
  tagline: {
    color: 'rgba(255,255,255,0.86)',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
