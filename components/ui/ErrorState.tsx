import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Body, Title } from '@/components/ui/Typography';
import { getUserErrorMessage } from '@/constants/i18n/userErrorMessages';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, radius, spacing } from '@/theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { language } = useTranslation();
  const displayMessage = message ?? getUserErrorMessage('DEFAULT', language);
  const title = getUserErrorMessage('OOPS_TITLE', language);
  const retryLabel = getUserErrorMessage('TRY_AGAIN', language);

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.error} />
      </View>
      <Title style={styles.title}>{title}</Title>
      <Body style={styles.message}>{displayMessage}</Body>
      {onRetry ? (
        <Button label={retryLabel} onPress={onRetry} variant="outline" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: `${colors.error}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { color: colors.error },
  message: { textAlign: 'center', color: colors.textSecondary, marginBottom: spacing.md },
});
