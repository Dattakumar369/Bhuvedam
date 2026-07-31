import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { APP } from '@/constants/app';
import { Body, Display, Subtitle } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

export function SplashScreen() {
  return (
    <LinearGradient colors={[...colors.gradient.header]} style={styles.container}>
      <Animated.View entering={FadeIn.duration(800)} style={styles.content}>
        <View style={styles.logoCircle}>
          <Body style={styles.logoEmoji}>🌾</Body>
        </View>
        <Display style={styles.title}>{APP.name}</Display>
        <Subtitle style={styles.tagline}>{APP.tagline}</Subtitle>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center' },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logoEmoji: { fontSize: 48 },
  title: { color: colors.white, marginBottom: spacing.xs },
  tagline: { color: 'rgba(255,255,255,0.85)' },
});
