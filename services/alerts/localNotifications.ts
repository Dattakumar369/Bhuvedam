import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { FarmAlert } from '@/types/alerts';

/** Push/local scheduling is limited in Expo Go SDK 53+ — in-app alerts still work */
export const notificationsSupported = Constants.appOwnership !== 'expo';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null = null;
let handlerConfigured = false;
let permissionGranted: boolean | null = null;

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!notificationsSupported) return null;

  if (!notificationsModule) {
    try {
      notificationsModule = await import('expo-notifications');
    } catch {
      return null;
    }
  }

  if (!handlerConfigured && notificationsModule) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerConfigured = true;
  }

  return notificationsModule;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported) return false;
  if (permissionGranted !== null) return permissionGranted;

  const Notifications = await loadNotifications();
  if (!Notifications) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') {
    permissionGranted = true;
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  permissionGranted = status === 'granted';
  return permissionGranted;
}

export async function showLocalFarmAlert(alert: FarmAlert): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  const ok = await ensureNotificationPermission();
  if (!ok) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('farm-alerts', {
      name: 'Farm Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: alert.title,
      body: alert.body,
      data: { alertId: alert.id, type: alert.type },
      sound: alert.severity === 'urgent',
    },
    trigger: null,
  });
}

export async function scheduleDailyAlertCheck(hour = 7, minute = 0): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  const ok = await ensureNotificationPermission();
  if (!ok) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Bhuvedam — మీ పొలం update',
      body: 'Weather & mandi rates check cheyandi',
      data: { type: 'daily_check' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}
