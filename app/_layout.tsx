import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { LogBox } from 'react-native';
import 'react-native-reanimated';

import { AppErrorBoundary, logRouteError } from '@/components/AppErrorBoundary';
import { AppProvider } from '@/providers/AppProvider';
import { useThemeStore } from '@/store/themeStore';
import { getAppColors } from '@/theme/colorPalettes';

// Stop Expo Go / dev client from showing technical error banners to users
LogBox.ignoreAllLogs(true);

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Expo Go / some dev builds may not register a native splash screen.
});

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  logRouteError(error);
  return <AppErrorBoundary error={error} retry={retry} />;
}

function RootNavigator() {
  const isDark = useThemeStore((s) => s.isDark);
  const backgroundColor = getAppColors(isDark).background;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="language" options={{ animation: 'fade' }} />
      <Stack.Screen name="login" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="forgot-password" options={{ presentation: 'card' }} />
      <Stack.Screen name="change-password" options={{ presentation: 'card' }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" options={{ presentation: 'card' }} />
      <Stack.Screen name="about" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="weather" />
      <Stack.Screen name="mandi-rates" />
      <Stack.Screen name="crop-protection" />
      <Stack.Screen name="measure-field" />
      <Stack.Screen name="pathakalu" />
      <Stack.Screen name="fertilizers/index" />
      <Stack.Screen name="fertilizers/[id]" />
      <Stack.Screen name="pesticides/index" />
      <Stack.Screen name="pesticides/[id]" />
      <Stack.Screen name="fungicides/index" />
      <Stack.Screen name="fungicides/[id]" />
      <Stack.Screen name="voice-assistant" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="nearby-places" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}
