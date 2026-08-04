import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { router } from 'expo-router';

import { notificationsSupported } from '@/services/alerts/localNotifications';
import {
  registerForPushNotifications,
  triggerServerAlertCheck,
  unregisterPushToken,
} from '@/services/notifications/pushService';
import { useAlertStore } from '@/store/alertStore';
import { useUserStore } from '@/store/userStore';

/** Wire Expo push listeners + register token when logged in */
export function usePushNotifications(): void {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const token = useUserStore((s) => s.token);
  const notificationsEnabled = useAlertStore((s) => s.notificationsEnabled);
  const refreshAlerts = useAlertStore((s) => s.refreshAlerts);
  const registeredRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (!notificationsSupported || !isAuthenticated || !token || token === 'demo-auth-token') {
      registeredRef.current = false;
      return;
    }

    if (notificationsEnabled && !registeredRef.current) {
      registeredRef.current = true;
      void registerForPushNotifications();
    }

    if (!notificationsEnabled && registeredRef.current) {
      registeredRef.current = false;
      void unregisterPushToken();
    }
  }, [isAuthenticated, token, notificationsEnabled]);

  useEffect(() => {
    if (!notificationsSupported || !isAuthenticated || !notificationsEnabled) return;

    const onAppStateChange = (nextState: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      if (prev === 'active' && nextState.match(/inactive|background/)) {
        void triggerServerAlertCheck();
      }

      if (nextState === 'active' && prev.match(/inactive|background/)) {
        void refreshAlerts({ force: true, notify: true });
        void triggerServerAlertCheck();
      }
    };

    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => sub.remove();
  }, [isAuthenticated, notificationsEnabled, refreshAlerts]);

  useEffect(() => {
    if (!notificationsSupported) return;

    let received: { remove: () => void } | undefined;
    let response: { remove: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const Notifications = await import('expo-notifications');
      if (cancelled) return;

      received = Notifications.addNotificationReceivedListener(() => {
        void refreshAlerts({ force: true });
      });

      response = Notifications.addNotificationResponseReceivedListener((event) => {
        const data = event.notification.request.content.data as {
          alertId?: string;
          notificationId?: string;
        };
        if (data.alertId) useAlertStore.getState().markRead(String(data.alertId));
        void refreshAlerts({ force: true });
        router.push('/(tabs)');
      });
    })();

    return () => {
      cancelled = true;
      received?.remove();
      response?.remove();
    };
  }, [refreshAlerts]);
}
