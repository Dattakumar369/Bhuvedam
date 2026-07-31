import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { ENDPOINTS } from '@/services/api/endpoints';
import { apiClient } from '@/services/api/client';
import { STORAGE_KEYS } from '@/constants/app';
import { secureStorage } from '@/utils/storage';
import type { FarmAlert } from '@/types/alerts';

import { ensureNotificationPermission, notificationsSupported } from '@/services/alerts/localNotifications';

function getExpoProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId
  );
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!notificationsSupported) return null;

  const ok = await ensureNotificationPermission();
  if (!ok) return null;

  const projectId = getExpoProjectId();
  if (!projectId) {
    console.warn('[push] EAS projectId missing — run: npx eas init');
    return null;
  }

  const Notifications = await import('expo-notifications');

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('farm-alerts', {
      name: 'Farm Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await secureStorage.set(STORAGE_KEYS.pushToken, token);

  try {
    await apiClient.post(ENDPOINTS.farmers.pushToken, {
      token,
      platform: Platform.OS,
    });
  } catch {
    /* offline — token saved locally, retry on next login */
  }

  return token;
}

export async function unregisterPushToken(): Promise<void> {
  const token = await secureStorage.get(STORAGE_KEYS.pushToken);
  if (!token) return;

  try {
    await apiClient.delete(ENDPOINTS.farmers.pushToken, { data: { token } });
  } catch {
    /* ignore */
  }
  await secureStorage.remove(STORAGE_KEYS.pushToken);
}

export async function pushAlertToServer(alert: FarmAlert): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.farmers.pushAlert, {
      type: alert.type,
      title: alert.title,
      body: alert.body,
      data: { alertId: alert.id, severity: alert.severity, ...alert.data },
    });
  } catch {
    /* fallback: local notification already shown */
  }
}

export async function fetchServerNotifications(limit = 30) {
  const res = await apiClient.get<{ data: Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
    data?: Record<string, unknown>;
  }> }>(ENDPOINTS.farmers.notifications, { params: { limit } });
  return res.data.data ?? [];
}

export async function markServerNotificationRead(id: string): Promise<void> {
  await apiClient.patch(ENDPOINTS.farmers.notificationRead(id));
}

export async function markAllServerNotificationsRead(): Promise<void> {
  await apiClient.post(ENDPOINTS.farmers.notificationsReadAll);
}
