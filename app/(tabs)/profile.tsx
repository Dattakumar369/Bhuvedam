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
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { formatPhone } from '@/utils/format';
import { colors, layout, radius, spacing } from '@/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
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
                <View style={[styles.iconBox, { backgroundColor: `${colors.accent}18` }]}>
                  <MaterialCommunityIcons name="theme-light-dark" size={20} color={colors.accent} />
                </View>
                <Body>{app.darkMode}</Body>
              </View>
              <Switch
                value={isDark}
                onValueChange={(val) => void setMode(val ? 'dark' : 'light')}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={colors.white}
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
            style={styles.logoutButton}
            onPress={() => setShowLogoutDialog(true)}
            accessibilityRole="button"
            accessibilityLabel={app.logout}
          >
            <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
            <Body style={styles.logoutText}>{app.logout}</Body>
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
  return (
    <Pressable style={styles.menuRow} onPress={onPress} accessibilityRole="button">
      <View style={styles.menuLeft}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
        </View>
        <Body>{label}</Body>
      </View>
      <View style={styles.menuRight}>
        {value ? <Caption style={styles.menuValue}>{value}</Caption> : null}
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  profileHeader: { alignItems: 'center', marginTop: spacing.lg },
  name: { color: colors.white, marginTop: spacing.md },
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
  menuValue: { color: colors.textTertiary },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: `${colors.error}10`,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.error}30`,
  },
  logoutText: { color: colors.error, fontFamily: 'Poppins_600SemiBold' },
});
