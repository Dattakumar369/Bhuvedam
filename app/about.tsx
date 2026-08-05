import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppLogo } from '@/components/brand';
import { Card, Header } from '@/components/ui';
import { Body, Headline, Subtitle } from '@/components/ui/Typography';
import { APP } from '@/constants/app';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, layout, spacing } from '@/theme';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { app, screens } = useTranslation();

  return (
    <View style={styles.container}>
      <Header title={app.aboutApp} showBack onBack={() => router.back()} />

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
          <Subtitle style={styles.version}>
            {screens.versionLabel} {APP.version}
          </Subtitle>
        </View>

        <Card variant="elevated">
          <Body style={styles.paragraph}>{screens.aboutPara1}</Body>
          <Body style={styles.paragraph}>{screens.aboutPara2}</Body>
        </Card>

        <Card variant="filled" style={styles.mission}>
          <Subtitle style={styles.missionLabel}>{screens.aboutMissionLabel}</Subtitle>
          <Body style={styles.missionText}>{screens.aboutMissionText}</Body>
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
