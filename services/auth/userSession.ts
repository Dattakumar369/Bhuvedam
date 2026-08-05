import { STORAGE_KEYS } from '@/constants/app';
import { fetchFarmerProfileFromDatabase } from '@/services/farmers/farmerSyncService';
import { imageSessionCache } from '@/services/media/imageSessionCache';
import { notificationsSupported } from '@/services/alerts/localNotifications';
import { registerForPushNotifications } from '@/services/notifications/pushService';
import { useAIStore } from '@/store/aiStore';
import { useAlertStore } from '@/store/alertStore';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import { useUserStore } from '@/store/userStore';
import type { User } from '@/types/user';
import { logger } from '@/utils/logger';
import { appCache, secureStorage } from '@/utils/storage';
import { migrateLegacyStorageForUser } from '@/utils/userScopedStorage';

/** Clear in-memory stores only — each account's data stays on disk under scoped keys. */
export async function clearLocalSessionStores(): Promise<void> {
  imageSessionCache.clear();
  appCache.clear();
  await useFarmerContextStore.getState().clearMemory();
  await useAIStore.getState().clearMemory();
  await useAlertStore.getState().clearMemory();
}

/** Load this user's farm profile from the server into local stores. */
export async function loadFarmerProfileForUser(user: User): Promise<void> {
  const profile = await fetchFarmerProfileFromDatabase();
  if (!profile) {
    await useFarmerContextStore.getState().clearMemory();
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

/** Reload chats/alerts/farm from disk for this user only. */
export async function hydrateUserScopedStores(userId: string): Promise<void> {
  await migrateLegacyStorageForUser(userId);
  await secureStorage.set(STORAGE_KEYS.lastUserId, userId);
  await useFarmerContextStore.getState().hydrate();
  await useAIStore.getState().hydrate();
  await useAlertStore.getState().hydrate();
}

/** After login — switch in-memory state to this account; never delete other accounts' saved data. */
export async function activateUserSession(user: User): Promise<void> {
  const storedUserId = await secureStorage.get(STORAGE_KEYS.lastUserId);
  const accountChanged = Boolean(storedUserId && storedUserId !== user.id);

  if (accountChanged) {
    logger.auth.info('Account switch — loading new account (keeping saved data per user)', {
      previousUserId: storedUserId,
      userId: user.id,
    });
    await clearLocalSessionStores();
  }

  await secureStorage.set(STORAGE_KEYS.lastUserId, user.id);
  await migrateLegacyStorageForUser(user.id);
  await loadFarmerProfileForUser(user);
  await hydrateUserScopedStores(user.id);
}

/** On cold start — if another account was active in memory, clear RAM only. */
export async function ensureStorageMatchesUser(userId: string | undefined): Promise<void> {
  if (!userId) return;

  const storedUserId = await secureStorage.get(STORAGE_KEYS.lastUserId);

  if (storedUserId && storedUserId !== userId) {
    logger.auth.warn('Active account changed — clearing in-memory cache only', {
      storedUserId,
      userId,
    });
    await clearLocalSessionStores();
  }

  await secureStorage.set(STORAGE_KEYS.lastUserId, userId);
  await migrateLegacyStorageForUser(userId);
}

/** Startup for logged-in user: server profile + this user's local chats/alerts/farm. */
export async function bootstrapAuthenticatedSession(user: User): Promise<void> {
  await ensureStorageMatchesUser(user.id);
  await loadFarmerProfileForUser(user);
  await hydrateUserScopedStores(user.id);

  if (notificationsSupported && useAlertStore.getState().notificationsEnabled) {
    void registerForPushNotifications();
  }
}

export async function isStorageOwnedByUser(userId: string): Promise<boolean> {
  const lastUserId = await secureStorage.get(STORAGE_KEYS.lastUserId);
  return lastUserId === userId;
}
