import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { AnimatedAppLogo } from '@/components/brand/AnimatedAppLogo';
import { APP } from '@/constants/app';
import { Display, Subtitle } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

/** Minimum time the animated splash stays visible (ms). */
export const SPLASH_MIN_DURATION_MS = 2600;

export function SplashScreen() {
  return (
    <LinearGradient colors={[...colors.gradient.header]} style={styles.container}>
      <View style={styles.content}>
        <AnimatedAppLogo size={120} style={styles.logo} />

        <Animated.View entering={FadeInUp.delay(650).duration(700).springify()} style={styles.textBlock}>
          <Display style={styles.title}>{APP.name}</Display>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(900).duration(700).springify()}>
          <Subtitle style={styles.tagline}>{APP.tagline}</Subtitle>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(1400).duration(600)} style={styles.loader}>
          <View style={styles.loaderDot} />
          <View style={[styles.loaderDot, styles.loaderDotMid]} />
          <View style={[styles.loaderDot, styles.loaderDotLate]} />
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', width: '100%' },
  logo: { marginBottom: spacing.lg },
  textBlock: { marginBottom: spacing.xs },
  title: { color: colors.white, textAlign: 'center' },
  tagline: { color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  loader: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xxxl,
    alignItems: 'center',
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  loaderDotMid: {
    opacity: 0.65,
    transform: [{ scale: 1.15 }],
  },
  loaderDotLate: {
    opacity: 0.45,
  },
});
