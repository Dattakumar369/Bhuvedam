import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { APP } from '@/constants/app';
import { Subtitle } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

/** Total splash visibility — keep in sync with app/index.tsx */
export const SPLASH_MIN_DURATION_MS = 4200;

const ICON_CARD = 148;
const WORD = 'BHUVEDAM';
const ACCENT_INDEXES = new Set([0, 3]);

/**
 * Splash = app icon come alive:
 * light-blue icon card → globe rings spin behind B → BHUVEDAM fades in right below the icon.
 */
export function BhuvedamSplashAnimation() {
  const cardScale = useSharedValue(0.88);
  const cardOpacity = useSharedValue(0);
  const globeSpin = useSharedValue(0);
  const bScale = useSharedValue(0.7);
  const bOpacity = useSharedValue(0);
  const wordProgress = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
    cardScale.value = withSpring(1, { damping: 16, stiffness: 120 });

    globeSpin.value = withRepeat(
      withTiming(360, { duration: 7000, easing: Easing.linear }),
      -1,
      false,
    );

    bOpacity.value = withDelay(350, withTiming(1, { duration: 500 }));
    bScale.value = withDelay(350, withSpring(1, { damping: 12, stiffness: 130 }));

    wordProgress.value = withDelay(
      1100,
      withTiming(1, { duration: 850, easing: Easing.out(Easing.cubic) }),
    );

    taglineOpacity.value = withDelay(2200, withTiming(1, { duration: 500 }));
  }, [bOpacity, bScale, cardOpacity, cardScale, globeSpin, taglineOpacity, wordProgress]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const globeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${globeSpin.value}deg` }],
  }));

  const bStyle = useAnimatedStyle(() => ({
    opacity: bOpacity.value,
    transform: [{ scale: bScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: interpolate(taglineOpacity.value, [0, 1], [8, 0]) }],
  }));

  return (
    <View style={styles.stage}>
      <Animated.View style={[styles.iconCard, cardStyle]}>
        <Animated.View style={[styles.globeLayer, globeStyle]}>
          <View style={styles.ringOuter} />
          <View style={styles.ringInner} />
          <View style={styles.meridianV} />
          <View style={styles.meridianH} />
          <View style={styles.equator} />
        </Animated.View>

        <View style={styles.blueprintLayer} pointerEvents="none">
          <View style={styles.triangleLeft} />
          <View style={styles.triangleRight} />
          <View style={styles.baseLine} />
          <View style={styles.centerDash} />
        </View>

        <Animated.View style={[styles.bWrap, bStyle]}>
          <Text style={styles.bLetter}>B</Text>
        </Animated.View>
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
  iconCard: {
    width: ICON_CARD,
    height: ICON_CARD,
    borderRadius: ICON_CARD * 0.22,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#0D3B1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  globeLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: ICON_CARD * 0.88,
    height: ICON_CARD * 0.88,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: 'rgba(74, 144, 226, 0.45)',
  },
  ringInner: {
    position: 'absolute',
    width: ICON_CARD * 0.58,
    height: ICON_CARD * 0.58,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: 'rgba(74, 144, 226, 0.38)',
  },
  meridianV: {
    position: 'absolute',
    width: 1,
    height: ICON_CARD * 0.82,
    backgroundColor: 'rgba(74, 144, 226, 0.22)',
  },
  meridianH: {
    position: 'absolute',
    width: ICON_CARD * 0.82,
    height: 1,
    backgroundColor: 'rgba(74, 144, 226, 0.18)',
  },
  equator: {
    position: 'absolute',
    width: ICON_CARD * 0.76,
    height: 1,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    transform: [{ rotate: '12deg' }],
  },
  blueprintLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triangleLeft: {
    position: 'absolute',
    width: 1,
    height: ICON_CARD * 0.62,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    transform: [{ rotate: '-32deg' }, { translateY: ICON_CARD * 0.08 }],
  },
  triangleRight: {
    position: 'absolute',
    width: 1,
    height: ICON_CARD * 0.62,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    transform: [{ rotate: '32deg' }, { translateY: ICON_CARD * 0.08 }],
  },
  baseLine: {
    position: 'absolute',
    bottom: ICON_CARD * 0.22,
    width: ICON_CARD * 0.72,
    height: 1,
    backgroundColor: 'rgba(74, 144, 226, 0.25)',
  },
  centerDash: {
    position: 'absolute',
    width: 1,
    height: ICON_CARD * 0.78,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.18)',
  },
  bWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  bLetter: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 62,
    color: '#3B9AE8',
    includeFontPadding: false,
    textShadowColor: 'rgba(59, 154, 232, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
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
