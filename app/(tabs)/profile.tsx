import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppDialog, Avatar, Card, GradientHeader } from '@/components/ui';
import { Body, Caption, Subtitle, Title } from '@/components/ui/Typography';
import { LANGUAGES } from '@/constants/languages';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppColors } from '@/hooks/useAppColors';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { formatPhone } from '@/utils/format';
import { layout, radius, spacing } from '@/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const c = useAppColors();
  const { app } = useTranslation();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const language = useLanguageStore((s) => s.language);
  const isDark = useThemeStore((s) => s.isDark);
  const setMode = useThemeStore((s) => s.setMode);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const currentLanguage = LANGUAGES.find((l) => l.code === language);

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <GradientHeader title={app.profileTitle} subtitle={app.profileSubtitle}>
        <View style={styles.profileHeader}>
          <Avatar name={user?.name ?? app.farmerDefault} size={72} />
          <Title style={styles.name}>{user?.name ?? app.farmerDefault}</Title>
          <Subtitle style={styles.phone}>
            {user?.phone ? formatPhone(user.phone) : '+91 XXXXX XXXXX'}
          </Subtitle>
          {user?.location ? (
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color="rgba(255,255,255,0.8)" />
              <Caption style={styles.location}>{user.location}</Caption>
            </View>
          ) : null}
        </View>
      </GradientHeader>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Card variant="elevated" style={styles.section}>
            <MenuItem
              icon="translate"
              label={app.language}
              value={currentLanguage?.nativeName ?? 'English'}
              onPress={() => router.push('/language')}
            />
            <Divider />
            <View style={styles.menuRow}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: `${c.accent}18` }]}>
                  <MaterialCommunityIcons name="theme-light-dark" size={20} color={c.accent} />
                </View>
                <Body>{app.darkMode}</Body>
              </View>
              <Switch
                value={isDark}
                onValueChange={(val) => void setMode(val ? 'dark' : 'light')}
                trackColor={{ false: c.border, true: c.primaryLight }}
                thumbColor={c.white}
                accessibilityLabel="Toggle dark mode"
              />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Caption style={styles.sectionLabel}>{app.general}</Caption>
          <Card variant="elevated" style={styles.section}>
            <MenuItem icon="cog-outline" label={app.settingsTitle} onPress={() => router.push('/settings' as Href)} />
            <Divider />
            <MenuItem icon="lock-reset" label={app.changePassword} onPress={() => router.push('/change-password' as Href)} />
            <Divider />
            <MenuItem icon="information-outline" label={app.aboutApp} onPress={() => router.push('/about' as Href)} />
            <Divider />
            <MenuItem icon="shield-check-outline" label={app.privacyPolicy} onPress={() => router.push('/privacy' as Href)} />
            <Divider />
            <MenuItem icon="file-document-outline" label={app.termsOfService} onPress={() => router.push('/terms' as Href)} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Pressable
            style={[
              styles.logoutButton,
              { backgroundColor: `${c.error}10`, borderColor: `${c.error}30` },
            ]}
            onPress={() => setShowLogoutDialog(true)}
            accessibilityRole="button"
            accessibilityLabel={app.logout}
          >
            <MaterialCommunityIcons name="logout" size={20} color={c.error} />
            <Body style={[styles.logoutText, { color: c.error }]}>{app.logout}</Body>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <AppDialog
        visible={showLogoutDialog}
        title={app.logout}
        message={app.logoutConfirm}
        confirmLabel={app.logout}
        onConfirm={() => void handleLogout()}
        onCancel={() => setShowLogoutDialog(false)}
        destructive
      />
    </View>
  );
}

function MenuItem({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  const c = useAppColors();

  return (
    <Pressable style={styles.menuRow} onPress={onPress} accessibilityRole="button">
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: `${c.primary}12` }]}>
          <MaterialCommunityIcons name={icon} size={20} color={c.primary} />
        </View>
        <Body>{label}</Body>
      </View>
      <View style={styles.menuRight}>
        {value ? <Caption style={[styles.menuValue, { color: c.textTertiary }]}>{value}</Caption> : null}
        <MaterialCommunityIcons name="chevron-right" size={20} color={c.textTertiary} />
      </View>
    </Pressable>
  );
}

function Divider() {
  const c = useAppColors();
  return <View style={[styles.divider, { backgroundColor: c.border }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { alignItems: 'center', marginTop: spacing.lg },
  name: { color: '#FFFFFF', marginTop: spacing.md },
  phone: { color: 'rgba(255,255,255,0.85)' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  location: { color: 'rgba(255,255,255,0.8)' },
  content: {
    paddingHorizontal: layout.screenPadding,
    marginTop: -spacing.xl,
    gap: spacing.lg,
  },
  sectionLabel: {
    marginLeft: spacing.xs,
    marginBottom: spacing.sm,
    letterSpacing: 1,
    fontFamily: 'Poppins_600SemiBold',
  },
  section: { padding: 0, overflow: 'hidden' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    minHeight: 56,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  menuValue: {},
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, marginHorizontal: spacing.md },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  logoutText: { fontFamily: 'Poppins_600SemiBold' },
});
