import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Caption, Display, Subtitle } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  greeting?: string;
  children?: React.ReactNode;
  /** Less bottom padding when header already has a profile block */
  dense?: boolean;
}

export function GradientHeader({
  title,
  subtitle,
  greeting,
  children,
  dense = false,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[...colors.gradient.header]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradient,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: dense ? spacing.xl + spacing.md : spacing.xxxl,
        },
      ]}
    >
      <Animated.View entering={FadeInDown.springify()}>
        {greeting ? <Caption style={styles.greeting}>{greeting}</Caption> : null}
        <Display style={styles.title}>{title}</Display>
        {subtitle ? <Subtitle style={styles.subtitle}>{subtitle}</Subtitle> : null}
        {children}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  greeting: { color: 'rgba(255,255,255,0.75)', marginBottom: spacing.xs },
  title: { color: colors.white, fontSize: 28 },
  subtitle: { color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs },
});
