import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/ui';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { getTermsContent } from '@/constants/i18n/legalContent';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, layout, spacing } from '@/theme';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const { app, language } = useTranslation();
  const content = getTermsContent(language);

  return (
    <View style={styles.container}>
      <Header title={app.termsOfService} showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
      >
        <MarkdownRenderer content={content} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.screenPadding },
});
