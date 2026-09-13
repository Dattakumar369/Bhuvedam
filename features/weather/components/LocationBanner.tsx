import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Body, Caption } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';

interface LocationBannerProps {
  error?: string | null;
  onRetry: () => void;
}

export function LocationBanner({ error, onRetry }: LocationBannerProps) {
  const isPermissionError = error?.toLowerCase().includes('permission');

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons
          name={isPermissionError ? 'map-marker-off' : 'cloud-alert'}
          size={28}
          color={colors.warning}
        />
      </View>
      <Body style={styles.title}>
        {isPermissionError ? 'Location access needed' : 'Unable to load weather'}
      </Body>
      <Caption style={styles.message}>
        {isPermissionError
          ? 'Enable location to get real-time weather for your farm area.'
          : (error ?? 'Check your internet connection and try again.')}
      </Caption>
      <View style={styles.actions}>
        <Button label="Try Again" onPress={onRetry} size="sm" />
        {isPermissionError ? (
          <Pressable onPress={() => void Linking.openSettings()} style={styles.settingsLink}>
            <Caption style={styles.settingsText}>Open Settings</Caption>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

interface LiveLocationBadgeProps {
  location: string;
  lastUpdated?: string | null;
}

export function LiveLocationBadge({ location, lastUpdated }: LiveLocationBadgeProps) {
  return (
    <View style={styles.badge}>
      <MaterialCommunityIcons name="crosshairs-gps" size={14} color={colors.primary} />
      <Caption style={styles.badgeText} numberOfLines={1}>
        {location}
      </Caption>
      {lastUpdated ? (
        <Caption style={styles.updatedText}>
          ·{' '}
          {new Date(lastUpdated).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Caption>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xl,
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.warning}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: { fontFamily: 'Poppins_600SemiBold', textAlign: 'center' },
  message: { textAlign: 'center', color: colors.textSecondary, lineHeight: 20 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  settingsLink: { padding: spacing.sm },
  settingsText: { color: colors.primary, fontFamily: 'Poppins_600SemiBold' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  badgeText: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
  },
  updatedText: { color: colors.textTertiary, fontSize: 10 },
});
