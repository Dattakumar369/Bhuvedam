import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppProvider } from '@/providers/AppProvider';
import { colors } from '@/theme';

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Expo Go / some dev builds may not register a native splash screen.
});

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
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
        <Stack.Screen name="crop-guide" />
      </Stack>
    </AppProvider>
  );
}
