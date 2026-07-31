import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/ui';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { APP } from '@/constants/app';
import { getTermsLegalExtra } from '@/constants/trustPolicy';
import { colors, layout, spacing } from '@/theme';

const TERMS_CONTENT = `
# Terms of Service

**Last updated:** January 2026

## Acceptance of Terms

By accessing or using ${APP.name}, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.

## Description of Service

${APP.name} provides AI-powered agricultural assistance, weather intelligence, and farming recommendations. The service is intended for informational purposes and should not replace professional agricultural advice.

## User Responsibilities

- Provide accurate information when using the app
- Use the service for **lawful farming purposes only**
- Do not attempt to reverse engineer or disrupt the service
- Keep your account credentials secure
- Do not ask the AI to help with illegal pesticides, fraud, or evading government rules

${getTermsLegalExtra(APP.name)}

## Disclaimer

The information provided by ${APP.name} is for general guidance only. We do not guarantee specific crop yields, weather accuracy, or farming outcomes. Always consult local agricultural experts for critical decisions.

## Limitation of Liability

${APP.name} shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.

## Changes to Terms

We reserve the right to modify these terms at any time. Continued use of the app constitutes acceptance of updated terms.

## Contact

Questions about these terms? Contact us at **${APP.supportEmail}**.
`;

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Header title="Terms of Service" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
      >
        <MarkdownRenderer content={TERMS_CONTENT} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.screenPadding },
});
