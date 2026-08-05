import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Header, Headline, Subtitle, Body } from '@/components/ui';
import { APP } from '@/constants/app';
import { LANGUAGES, type LanguageCode } from '@/constants/languages';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppColors } from '@/hooks/useAppColors';
import { useLanguageStore } from '@/store/languageStore';
import { useUserStore } from '@/store/userStore';
import { layout, radius, spacing } from '@/theme';

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const c = useAppColors();
  const { app } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const setOnboardingComplete = useUserStore((s) => s.setOnboardingComplete);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  const pickLanguage = async (code: LanguageCode) => {
    await setLanguage(code);
  };

  const handlePrimaryAction = async () => {
    if (isAuthenticated) {
      router.back();
      return;
    }
    await setOnboardingComplete(true);
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: isAuthenticated ? 0 : insets.top + spacing.xxl }]}>
      {isAuthenticated ? (
        <Header title={app.language} showBack onBack={() => router.back()} />
      ) : (
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <Headline>{app.chooseLanguage}</Headline>
          <Subtitle>{app.chooseLanguageSubtitle}</Subtitle>
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {LANGUAGES.map((lang, index) => (
          <Animated.View key={lang.code} entering={FadeInDown.delay(index * 60).springify()}>
            <LanguageOption
              flag={lang.flag}
              name={lang.name}
              nativeName={lang.nativeName}
              selected={language === lang.code}
              onPress={() => void pickLanguage(lang.code as LanguageCode)}
            />
          </Animated.View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          label={isAuthenticated ? app.done : app.continueBtn}
          onPress={() => void handlePrimaryAction()}
          fullWidth
          size="lg"
        />
        {!isAuthenticated ? (
          <Body style={[styles.footerText, { color: c.textTertiary }]}>
            {APP.name} · {APP.tagline}
          </Body>
        ) : null}
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
  const c = useAppColors();

  return (
    <Pressable
      style={[
        styles.option,
        {
          backgroundColor: c.surface,
          borderColor: selected ? c.primary : c.border,
        },
        selected && { backgroundColor: `${c.primary}12` },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Body style={styles.flag}>{flag}</Body>
      <View style={styles.optionText}>
        <Body style={[styles.optionName, { color: c.textPrimary }]}>{name}</Body>
        <Subtitle>{nativeName}</Subtitle>
      </View>
      {selected ? <Body style={[styles.check, { color: c.primary }]}>✓</Body> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: layout.screenPadding, marginBottom: spacing.xl },
  list: { paddingHorizontal: layout.screenPadding, gap: spacing.sm, paddingBottom: spacing.xxl },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: spacing.md,
    minHeight: layout.minTouchTarget + 16,
  },
  flag: { fontSize: 28 },
  optionText: { flex: 1 },
  optionName: { fontFamily: 'Poppins_600SemiBold' },
  check: { fontSize: 20, fontFamily: 'Poppins_700Bold' },
  footer: { paddingHorizontal: layout.screenPadding, gap: spacing.md },
  footerText: { textAlign: 'center' },
});
