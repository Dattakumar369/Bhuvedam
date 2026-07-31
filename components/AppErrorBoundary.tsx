import type { ErrorBoundaryProps } from 'expo-router';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { ErrorState } from '@/components/ui/ErrorState';
import { getUserErrorMessage } from '@/constants/i18n/userErrorMessages';
import { useLanguageStore } from '@/store/languageStore';
import { colors } from '@/theme';
import { logger } from '@/utils/logger';

/** Replaces Expo Router's default black screen that shows raw `Error: ...` text */
export function AppErrorBoundary({ retry }: ErrorBoundaryProps) {
  const language = useLanguageStore.getState().language ?? 'te';
  const message = getUserErrorMessage('DEFAULT', language);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ErrorState
          message={message}
          onRetry={() => {
            void retry();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

/** Log crash details for developers only — never shown in UI */
export function logRouteError(error: Error): void {
  if (__DEV__) {
    logger.app.error('Screen crashed', {
      message: error.message,
      stack: error.stack,
    });
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, justifyContent: 'center' },
});
