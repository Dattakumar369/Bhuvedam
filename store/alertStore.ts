import { create } from 'zustand';

import { ALERT_CHECK_COOLDOWN_MS } from '@/constants/alertConfig';
import { STORAGE_KEYS } from '@/constants/app';
import { buildCropCalendarAlerts } from '@/services/alerts/cropCalendarEngine';
import {
  buildMandiPriceAlerts,
  snapshotFromAnalytics,
} from '@/services/alerts/mandiAlertEngine';
import {
  ensureNotificationPermission,
  notificationsSupported,
  scheduleDailyAlertCheck,
  showLocalFarmAlert,
} from '@/services/alerts/localNotifications';
import { pushAlertToServer, registerForPushNotifications, unregisterPushToken } from '@/services/notifications/pushService';
import { fetchSyncStatus } from '@/services/alerts/syncStatusService';
import { buildWeatherAlerts } from '@/services/alerts/weatherAlertEngine';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import { useMandiStore } from '@/store/mandiStore';
import { useUserStore } from '@/store/userStore';
import { useWeatherStore } from '@/store/weatherStore';
import type { FarmAlert, MandiPriceSnapshot, SyncStatusSummary } from '@/types/alerts';
import { appCache, secureStorage } from '@/utils/storage';
import { getUserScoped, setUserScoped, userCacheKey } from '@/utils/userScopedStorage';

const MAX_STORED_ALERTS = 20;
const MAX_MANDI_SNAPSHOT = 80;

function activeUserId(): string | null {
  return useUserStore.getState().user?.id ?? null;
}

interface AlertState {
  alerts: FarmAlert[];
  syncStatus: SyncStatusSummary | null;
  lastChecked: string | null;
  notificationsEnabled: boolean;
  loading: boolean;
  refreshAlerts: (opts?: { force?: boolean; notify?: boolean }) => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  hydrate: () => Promise<void>;
  clearMemory: () => Promise<void>;
  reset: () => Promise<void>;
}

function compactAlerts(alerts: FarmAlert[]): FarmAlert[] {
  return alerts.slice(0, MAX_STORED_ALERTS).map((a) => ({
    ...a,
    body: a.body.slice(0, 180),
  }));
}

function persistAlerts(alerts: FarmAlert[]): void {
  const userId = activeUserId();
  if (!userId) return;
  const compact = compactAlerts(alerts);
  appCache.set(userCacheKey(STORAGE_KEYS.farmAlerts, userId), compact);
  void setUserScoped(userId, STORAGE_KEYS.farmAlerts, JSON.stringify(compact));
}

async function loadMandiSnapshot(): Promise<MandiPriceSnapshot[]> {
  const userId = activeUserId();
  if (!userId) return [];

  const cacheKey = userCacheKey(STORAGE_KEYS.mandiSnapshot, userId);
  const cached = appCache.get<MandiPriceSnapshot[]>(cacheKey);
  if (cached?.length) return cached;

  const raw = await getUserScoped(userId, STORAGE_KEYS.mandiSnapshot);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as MandiPriceSnapshot[];
    appCache.set(cacheKey, parsed);
    return parsed;
  } catch {
    return [];
  }
}

function saveMandiSnapshot(snapshot: MandiPriceSnapshot[]): void {
  const userId = activeUserId();
  if (!userId) return;
  const trimmed = snapshot.slice(0, MAX_MANDI_SNAPSHOT);
  appCache.set(userCacheKey(STORAGE_KEYS.mandiSnapshot, userId), trimmed);
  void setUserScoped(userId, STORAGE_KEYS.mandiSnapshot, JSON.stringify(trimmed));
}

function mergeAlerts(existing: FarmAlert[], incoming: FarmAlert[]): FarmAlert[] {
  const byKey = new Map<string, FarmAlert>();
  for (const a of existing) {
    byKey.set(`${a.type}-${a.title}`, a);
  }
  for (const a of incoming) {
    const key = `${a.type}-${a.title}`;
    if (!byKey.has(key)) byKey.set(key, a);
  }
  return [...byKey.values()]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_STORED_ALERTS);
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  syncStatus: null,
  lastChecked: null,
  notificationsEnabled: false,
  loading: false,

  hydrate: async () => {
    const userId = useUserStore.getState().user?.id;
    const isAuthenticated = useUserStore.getState().isAuthenticated;
    if (!isAuthenticated || !userId) {
      await get().clearMemory();
      return;
    }

    const lastUserId = await secureStorage.get(STORAGE_KEYS.lastUserId);
    if (lastUserId && lastUserId !== userId) {
      await get().clearMemory();
      return;
    }

    const cacheKey = userCacheKey(STORAGE_KEYS.farmAlerts, userId);
    let alerts = appCache.get<FarmAlert[]>(cacheKey);
    if (!alerts?.length) {
      const raw = await getUserScoped(userId, STORAGE_KEYS.farmAlerts);
      if (raw) {
        try {
          alerts = JSON.parse(raw) as FarmAlert[];
          if (alerts.length) appCache.set(cacheKey, alerts);
        } catch {
          /* ignore */
        }
      }
    }
    if (alerts?.length) set({ alerts });

    const prefsRaw = await secureStorage.get(STORAGE_KEYS.alertPrefs);
    if (prefsRaw) {
      try {
        const prefs = JSON.parse(prefsRaw) as { notificationsEnabled?: boolean };
        if (typeof prefs.notificationsEnabled === 'boolean') {
          set({ notificationsEnabled: prefs.notificationsEnabled });
        }
      } catch {
        /* ignore */
      }
    } else if (notificationsSupported) {
      // First login — enable farm alerts by default for farmers
      await get().setNotificationsEnabled(true);
    }
  },

  clearMemory: async () => {
    set({
      alerts: [],
      syncStatus: null,
      lastChecked: null,
      loading: false,
    });
  },

  reset: async () => {
    await get().clearMemory();
  },

  setNotificationsEnabled: async (enabled) => {
    set({ notificationsEnabled: enabled });
    await secureStorage.set(STORAGE_KEYS.alertPrefs, JSON.stringify({ notificationsEnabled: enabled }));

    if (!notificationsSupported) return;

    if (!enabled) {
      await unregisterPushToken();
      return;
    }

    const ok = await ensureNotificationPermission();
    if (!ok) {
      set({ notificationsEnabled: false });
      await secureStorage.set(STORAGE_KEYS.alertPrefs, JSON.stringify({ notificationsEnabled: false }));
      return;
    }

    await scheduleDailyAlertCheck();
    await registerForPushNotifications();
  },

  markRead: (id) => {
    set((s) => {
      const alerts = s.alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
      persistAlerts(alerts);
      return { alerts };
    });
  },

  markAllRead: () => {
    set((s) => {
      const alerts = s.alerts.map((a) => ({ ...a, read: true }));
      persistAlerts(alerts);
      return { alerts };
    });
  },

  refreshAlerts: async (opts) => {
    const force = opts?.force ?? false;
    const notify = opts?.notify ?? false;
    const lastChecked = get().lastChecked;

    if (
      !force &&
      lastChecked &&
      Date.now() - new Date(lastChecked).getTime() < ALERT_CHECK_COOLDOWN_MS
    ) {
      return;
    }

    set({ loading: true });

    const farmerCrops = useFarmerContextStore.getState().crops;
    const weatherData = useWeatherStore.getState().data;
    const mandiAnalytics = useMandiStore.getState().analytics;
    const mandiLastFetched = useMandiStore.getState().lastFetched;

    const previousSnapshot = await loadMandiSnapshot();
    const syncStatus = await fetchSyncStatus();

    const incoming: FarmAlert[] = [
      ...buildWeatherAlerts(weatherData),
      ...buildCropCalendarAlerts(farmerCrops),
      ...buildMandiPriceAlerts(mandiAnalytics, previousSnapshot, farmerCrops),
    ];

    if (mandiAnalytics.length) {
      saveMandiSnapshot(snapshotFromAnalytics(mandiAnalytics));
    }

    const merged = mergeAlerts(get().alerts, incoming);
    const newUnread = merged.filter(
      (a) => !a.read && !get().alerts.some((old) => old.id === a.id),
    );

    set({
      alerts: merged,
      syncStatus: syncStatus ?? {
        mandiLastSync: mandiLastFetched,
        weatherLastSync: useWeatherStore.getState().lastFetched,
        sources: [],
      },
      lastChecked: new Date().toISOString(),
      loading: false,
    });

    persistAlerts(merged);

    if (get().notificationsEnabled && newUnread.length) {
      for (const alert of newUnread.slice(0, 2)) {
        if (notify && notificationsSupported) {
          await showLocalFarmAlert(alert);
        }
        void pushAlertToServer(alert);
      }
    }
  },
}));

export function getUnreadAlerts(alerts: FarmAlert[]): FarmAlert[] {
  return alerts.filter((a) => !a.read).slice(0, 5);
}
