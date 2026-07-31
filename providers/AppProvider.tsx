import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useEffect, type ReactNode } from 'react';

import { useThemeStore } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { useLanguageStore } from '@/store/languageStore';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import { useMandiStore } from '@/store/mandiStore';
import { useWeatherStore } from '@/store/weatherStore';
import { useAlertStore } from '@/store/alertStore';
import {
  bootstrapAuthenticatedSession,
  clearLocalSessionStores,
} from '@/services/auth/userSession';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAppUpdates } from '@/hooks/useAppUpdates';
import { getAppColors } from '@/theme/colorPalettes';
import { darkTheme, lightTheme } from '@/theme';
import { API_CONFIG } from '@/constants/app';
import { logger } from '@/utils/logger';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const hydrateUser = useUserStore((s) => s.hydrate);
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const hydrateLanguage = useLanguageStore((s) => s.hydrate);
  const setFarmSize = useFarmerContextStore((s) => s.setFarmSize);
  const fetchSoilFromLocation = useFarmerContextStore((s) => s.fetchSoilFromLocation);
  const fetchWeather = useWeatherStore((s) => s.fetchWeather);
  const fetchMandiRates = useMandiStore((s) => s.fetchRates);
  const refreshAlerts = useAlertStore((s) => s.refreshAlerts);
  const isDark = useThemeStore((s) => s.isDark);

  usePushNotifications();
  useAppUpdates();

  useEffect(() => {
    logger.app.info('App config', {
      apiUrl: API_CONFIG.baseUrl,
      useBackendData: API_CONFIG.useBackendData,
    });

    void hydrateUser().then(async () => {
      await Promise.all([hydrateTheme(), hydrateLanguage()]);

      const user = useUserStore.getState().user;
      const isAuthenticated = useUserStore.getState().isAuthenticated;

      if (isAuthenticated && user) {
        await bootstrapAuthenticatedSession(user);
      } else {
        await clearLocalSessionStores();
      }

      if (!isAuthenticated) return;

      const refreshedFarmer = useFarmerContextStore.getState();
      if (user?.farmSize && !refreshedFarmer.farmSize) {
        void setFarmSize(user.farmSize);
      }
      await fetchWeather();
      const location = useWeatherStore.getState().location;
      if (location && !refreshedFarmer.soilProfile) {
        void fetchSoilFromLocation(location.latitude, location.longitude);
      }
      void fetchMandiRates().then(() => refreshAlerts({ force: true }));
    });
  }, [
    hydrateUser,
    hydrateTheme,
    hydrateLanguage,
    setFarmSize,
    fetchSoilFromLocation,
    fetchWeather,
    fetchMandiRates,
    refreshAlerts,
  ]);

  useEffect(() => {
    if (!fontsLoaded) return;
    void SplashScreen.hideAsync().catch(() => {
      // No native splash registered (e.g. Expo Go) — custom AppSplash still shows.
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const appColors = getAppColors(isDark);

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: appColors.background }]}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <PaperProvider theme={isDark ? darkTheme : lightTheme}>{children}</PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
