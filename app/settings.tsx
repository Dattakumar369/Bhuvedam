import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Header } from '@/components/ui';
import { Body, Caption, Subtitle } from '@/components/ui/Typography';
import { APP } from '@/constants/app';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppColors } from '@/hooks/useAppColors';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { useWeatherStore } from '@/store/weatherStore';
import { useAlertStore } from '@/store/alertStore';
import { notificationsSupported } from '@/services/alerts/localNotifications';
import { layout, spacing } from '@/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const c = useAppColors();
  const { app } = useTranslation();
  const isDark = useThemeStore((s) => s.isDark);
  const setMode = useThemeStore((s) => s.setMode);
  const language = useLanguageStore((s) => s.language);
  const location = useWeatherStore((s) => s.location);
  const notificationsEnabled = useAlertStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useAlertStore((s) => s.setNotificationsEnabled);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title={app.settingsTitle} showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
      >
        <Caption style={styles.sectionLabel}>{app.appearance}</Caption>
        <Card variant="elevated" style={styles.card}>
          <SettingRow
            icon="theme-light-dark"
            label={app.darkMode}
            description={app.darkModeDesc}
            trailing={
              <Switch
                value={isDark}
                onValueChange={(val) => void setMode(val ? 'dark' : 'light')}
                trackColor={{ false: c.border, true: c.primaryLight }}
                thumbColor={c.white}
              />
            }
          />
        </Card>

        <Caption style={styles.sectionLabel}>{app.preferences}</Caption>
        <Card variant="elevated" style={styles.card}>
          {notificationsSupported ? (
            <>
              <SettingRow
                icon="bell-outline"
                label={app.farmAlerts}
                description={app.farmAlertsDesc}
                trailing={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={(val) => void setNotificationsEnabled(val)}
                    trackColor={{ false: c.border, true: c.primaryLight }}
                    thumbColor={c.white}
                  />
                }
              />
              <View style={[styles.divider, { backgroundColor: c.border }]} />
            </>
          ) : null}
          <SettingRow
            icon="translate"
            label={app.language}
            description={app.languageCurrent(language)}
            onPress={() => router.push('/language')}
          />
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <SettingRow
            icon="map-marker-outline"
            label={app.location}
            description={location?.label ?? app.locationDetecting}
          />
        </Card>

        <Caption style={styles.sectionLabel}>{app.about}</Caption>
        <Card variant="elevated" style={styles.card}>
          <SettingRow icon="information-outline" label={app.appVersion} description={APP.version} />
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <SettingRow
            icon="email-outline"
            label={app.support}
            description={APP.supportEmail}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  description,
  trailing,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  description?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
}) {
  const c = useAppColors();

  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={[styles.iconBox, { backgroundColor: `${c.primary}12` }]}>
        <MaterialCommunityIcons name={icon} size={20} color={c.primary} />
      </View>
      <View style={styles.rowContent}>
        <Body style={styles.rowLabel}>{label}</Body>
        {description ? <Subtitle style={styles.rowDesc}>{description}</Subtitle> : null}
      </View>
      {trailing ?? (
        onPress ? (
          <MaterialCommunityIcons name="chevron-right" size={20} color={c.textTertiary} />
        ) : null
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: layout.screenPadding, gap: spacing.sm },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    letterSpacing: 1,
    fontFamily: 'Poppins_600SemiBold',
  },
  card: { padding: 0, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: { flex: 1 },
  rowLabel: { fontFamily: 'Poppins_500Medium' },
  rowDesc: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginHorizontal: spacing.md },
});
