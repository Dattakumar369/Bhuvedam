import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Body, Title } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.error} />
      </View>
      <Title style={styles.title}>Oops!</Title>
      <Body style={styles.message}>{message}</Body>
      {onRetry ? <Button label="Try Again" onPress={onRetry} variant="outline" /> : null}
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
