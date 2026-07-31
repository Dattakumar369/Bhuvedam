import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Headline, Subtitle, Body } from '@/components/ui';
import { APP } from '@/constants/app';
import { LANGUAGES, type LanguageCode } from '@/constants/languages';
import { useLanguageStore } from '@/store/languageStore';
import { useUserStore } from '@/store/userStore';
import { colors, layout, radius, spacing } from '@/theme';

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const setOnboardingComplete = useUserStore((s) => s.setOnboardingComplete);

  const handleContinue = async () => {
    await setOnboardingComplete(true);
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xxl }]}>
      <Animated.View entering={FadeInDown.springify()} style={styles.header}>
        <Headline>Choose Language</Headline>
        <Subtitle>अपनी भाषा चुनें · Choose your preferred language</Subtitle>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {LANGUAGES.map((lang, index) => (
          <Animated.View key={lang.code} entering={FadeInDown.delay(index * 60).springify()}>
            <LanguageOption
              flag={lang.flag}
              name={lang.name}
              nativeName={lang.nativeName}
              selected={language === lang.code}
              onPress={() => void setLanguage(lang.code as LanguageCode)}
            />
          </Animated.View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button label="Continue" onPress={() => void handleContinue()} fullWidth size="lg" />
        <Body style={styles.footerText}>{APP.name} · {APP.tagline}</Body>
      </View>
    </View>
  );
}

function LanguageOption({
  flag,
  name,
  nativeName,
  selected,
  onPress,
}: {
  flag: string;
  name: string;
  nativeName: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Body style={styles.flag}>{flag}</Body>
      <View style={styles.optionText}>
        <Body style={styles.optionName}>{name}</Body>
        <Subtitle>{nativeName}</Subtitle>
      </View>
      {selected ? <Body style={styles.check}>✓</Body> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: layout.screenPadding, marginBottom: spacing.xl },
  list: { paddingHorizontal: layout.screenPadding, gap: spacing.sm, paddingBottom: spacing.xxl },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
    minHeight: layout.minTouchTarget + 16,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  flag: { fontSize: 28 },
  optionText: { flex: 1 },
  optionName: { fontFamily: 'Poppins_600SemiBold' },
  check: { color: colors.primary, fontSize: 20, fontFamily: 'Poppins_700Bold' },
  footer: { paddingHorizontal: layout.screenPadding, gap: spacing.md },
  footerText: { textAlign: 'center', color: colors.textTertiary },
});
