import { STORAGE_KEYS } from '@/constants/app';
import { fetchFarmerProfileFromDatabase } from '@/services/farmers/farmerSyncService';
import { imageSessionCache } from '@/services/media/imageSessionCache';
import { useAIStore } from '@/store/aiStore';
import { useAlertStore } from '@/store/alertStore';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import { useUserStore } from '@/store/userStore';
import type { User } from '@/types/user';
import { logger } from '@/utils/logger';
import { appCache, secureStorage } from '@/utils/storage';

async function hasOrphanedScopedData(): Promise<boolean> {
  const [farmer, chats, alerts, mandi] = await Promise.all([
    secureStorage.get(STORAGE_KEYS.farmerContext),
    secureStorage.get(STORAGE_KEYS.conversations),
    secureStorage.get(STORAGE_KEYS.farmAlerts),
    secureStorage.get(STORAGE_KEYS.mandiSnapshot),
  ]);
  return Boolean(farmer || chats || alerts || mandi);
}

/** Wipe per-user cached data so a new login does not inherit the previous account. */
export async function resetUserScopedData(): Promise<void> {
  await Promise.all([
    secureStorage.remove(STORAGE_KEYS.farmerContext),
    secureStorage.remove(STORAGE_KEYS.conversations),
    secureStorage.remove(STORAGE_KEYS.farmAlerts),
    secureStorage.remove(STORAGE_KEYS.mandiSnapshot),
    secureStorage.remove(STORAGE_KEYS.lastUserId),
    secureStorage.remove(STORAGE_KEYS.pushToken),
  ]);
  appCache.remove(STORAGE_KEYS.farmAlerts);
  appCache.remove(STORAGE_KEYS.mandiSnapshot);
  imageSessionCache.clear();

  await useFarmerContextStore.getState().reset();
  await useAIStore.getState().reset();
  await useAlertStore.getState().reset();
}

/** Clear in-memory stores when logged out — do not show another user's data on login screen. */
export async function clearLocalSessionStores(): Promise<void> {
  await useFarmerContextStore.getState().reset();
  await useAIStore.getState().reset();
  await useAlertStore.getState().reset();
}

/** Load this user's farm profile from the server into local stores. */
export async function loadFarmerProfileForUser(user: User): Promise<void> {
  const profile = await fetchFarmerProfileFromDatabase();
  if (!profile) {
    await useFarmerContextStore.getState().reset();
    return;
  }

  await useFarmerContextStore.getState().applyFromServer(profile);

  const current = useUserStore.getState().user ?? user;
  const nextUser: User = {
    ...current,
    name: profile.name ?? current.name,
    location: profile.location ?? current.location,
    farmSize: profile.farmSize ?? current.farmSize,
  };
  useUserStore.getState().setUser(nextUser);
  await secureStorage.set(STORAGE_KEYS.user, JSON.stringify(nextUser));
}

/** Reload chats/alerts from disk — only after lastUserId matches. */
export async function hydrateUserScopedStores(userId: string): Promise<void> {
  const lastUserId = await secureStorage.get(STORAGE_KEYS.lastUserId);
  if (lastUserId !== userId) return;
  await useAIStore.getState().hydrate();
  await useAlertStore.getState().hydrate();
}

/** Call after auth token is set — clears stale cache when account changes, then pulls server data. */
export async function activateUserSession(user: User): Promise<void> {
  const storedUserId = await secureStorage.get(STORAGE_KEYS.lastUserId);
  const orphaned = !storedUserId && (await hasOrphanedScopedData());
  const accountChanged = !storedUserId || storedUserId !== user.id || orphaned;

  if (accountChanged) {
    logger.auth.info('Account switch — clearing local cache', {
      previousUserId: storedUserId ?? 'none',
      userId: user.id,
      orphaned,
    });
    await resetUserScopedData();
  }

  await secureStorage.set(STORAGE_KEYS.lastUserId, user.id);
  await loadFarmerProfileForUser(user);

  if (!accountChanged) {
    await hydrateUserScopedStores(user.id);
  }
}

/** On cold start — discard local farm/chat cache if it belongs to another user. */
export async function ensureStorageMatchesUser(userId: string | undefined): Promise<void> {
  if (!userId) return;

  const storedUserId = await secureStorage.get(STORAGE_KEYS.lastUserId);
  const orphaned = !storedUserId && (await hasOrphanedScopedData());

  if ((storedUserId && storedUserId !== userId) || orphaned) {
    logger.auth.warn('Storage user mismatch — clearing scoped cache', {
      storedUserId: storedUserId ?? 'none',
      userId,
      orphaned,
    });
    await resetUserScopedData();
  }

  await secureStorage.set(STORAGE_KEYS.lastUserId, userId);
}

/** Startup for logged-in user: server profile first, then local chats/alerts for same user. */
export async function bootstrapAuthenticatedSession(user: User): Promise<void> {
  await ensureStorageMatchesUser(user.id);
  await loadFarmerProfileForUser(user);
  await hydrateUserScopedStores(user.id);
}

export async function isStorageOwnedByUser(userId: string): Promise<boolean> {
  const lastUserId = await secureStorage.get(STORAGE_KEYS.lastUserId);
  return lastUserId === userId;
}
