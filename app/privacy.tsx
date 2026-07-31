import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/ui';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { APP } from '@/constants/app';
import { getPrivacyPolicyExtra } from '@/constants/trustPolicy';
import { colors, layout, spacing } from '@/theme';

const PRIVACY_CONTENT = `
# Privacy Policy

**Last updated:** January 2026

## Introduction

${APP.name} ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.

## Information We Collect

- **Personal Information:** Name, phone number, and language preference
- **Location Data:** Farm location for weather and crop recommendations
- **Usage Data:** App interactions, AI chat history, and feature usage
- **Device Information:** Device type, operating system, and app version

## How We Use Your Information

We use collected information to:

1. Provide personalized weather and farming recommendations
2. Enable AI-powered agricultural assistance
3. Improve our services and user experience
4. Send important service-related communications

## Data Security

We implement industry-standard security measures including encryption, secure storage, and access controls to protect your personal information.

## Data Sharing

We do **not** sell your personal information. We do **not** share one farmer's profile, location, or chat with another farmer.

We may share limited data with trusted service providers (e.g. AI, weather APIs) only to operate **your** features, subject to confidentiality agreements. They must not use your data to identify or serve other users.

${getPrivacyPolicyExtra()}

## Your Rights

You have the right to access, update, or delete your personal information. Contact us at **${APP.supportEmail}** to exercise these rights.

## Contact Us

For privacy-related questions, reach us at **${APP.supportEmail}**.
`;

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Header title="Privacy Policy" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
      >
        <MarkdownRenderer content={PRIVACY_CONTENT} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: layout.screenPadding },
});
