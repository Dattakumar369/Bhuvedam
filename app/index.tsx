import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { SplashScreen as AppSplash, SPLASH_MIN_DURATION_MS } from '@/features/auth/components/SplashScreen';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const [ready, setReady] = useState(false);
  const isLoading = useUserStore((s) => s.isLoading);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), SPLASH_MIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!ready || isLoading) {
    return <AppSplash />;
  }

  if (!onboardingComplete) {
    return <Redirect href="/language" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
