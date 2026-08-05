import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Redirect, Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppColors } from '@/hooks/useAppColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserStore } from '@/store/userStore';
import { layout, spacing } from '@/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const c = useAppColors();
  const { app } = useTranslation();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const token = useUserStore((s) => s.token);

  if (!isAuthenticated || !token) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textTertiary,
        tabBarStyle: [
          styles.tabBar,
          {
            height: layout.tabBarHeight + insets.bottom,
            paddingBottom: insets.bottom + spacing.xs,
            backgroundColor: c.surface,
            borderTopColor: c.border,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: app.tabHome,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="crop"
        options={{
          title: app.tabCrop,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="sprout" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: app.tabAi,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="robot-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: app.tabProfile,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    paddingTop: spacing.xs,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  tabLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    marginTop: 2,
  },
});
