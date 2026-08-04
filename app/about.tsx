import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppLogo } from '@/components/brand';
import { Card, Header } from '@/components/ui';
import { Body, Headline, Subtitle } from '@/components/ui/Typography';
import { APP } from '@/constants/app';
import { colors, layout, spacing } from '@/theme';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Header title="About" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
      >
        <View style={styles.hero}>
          <AppLogo size={88} style={styles.logo} />
          <Headline>{APP.name}</Headline>
          <Subtitle>{APP.tagline}</Subtitle>
          <Subtitle style={styles.version}>Version {APP.version}</Subtitle>
        </View>

        <Card variant="elevated">
          <Body style={styles.paragraph}>
            Bhuvedam is an AI-powered agriculture assistant designed to help farmers make smarter
            decisions. We combine weather intelligence, crop expertise, and conversational AI to
            deliver actionable insights right at your fingertips.
          </Body>
          <Body style={styles.paragraph}>
            Our mission is to empower every farmer with technology that was once available only to
            large agribusinesses — making precision farming accessible, affordable, and easy to use.
          </Body>
        </Card>

        <Card variant="filled" style={styles.mission}>
          <Subtitle style={styles.missionLabel}>OUR MISSION</Subtitle>
          <Body style={styles.missionText}>
            To democratize agricultural intelligence and help farmers increase yield, reduce waste,
            and build sustainable farming practices for future generations.
          </Body>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.screenPadding, gap: spacing.lg },
  hero: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.xs },
  logo: { marginBottom: spacing.sm },
  version: { color: colors.textTertiary, marginTop: spacing.sm },
  paragraph: { lineHeight: 24, color: colors.textSecondary, marginBottom: spacing.md },
  mission: { padding: spacing.lg },
  missionLabel: {
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  missionText: { lineHeight: 24, color: colors.textSecondary },
});
