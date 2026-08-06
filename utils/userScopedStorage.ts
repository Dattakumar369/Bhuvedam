import { STORAGE_KEYS } from '@/constants/app';
import { secureStorage } from '@/utils/storage';

/** Per-user secure storage key — each account keeps its own chats, farm profile, alerts. */
export function userScopedKey(baseKey: string, userId: string): string {
  return `${baseKey}__${userId}`;
}

const SCOPED_BASE_KEYS = [
  STORAGE_KEYS.conversations,
  STORAGE_KEYS.farmerContext,
  STORAGE_KEYS.farmAlerts,
  STORAGE_KEYS.mandiSnapshot,
] as const;

const migratedUsers = new Set<string>();

/** One-time copy from legacy shared keys into the current user's scoped keys. */
export async function migrateLegacyStorageForUser(userId: string): Promise<void> {
  if (migratedUsers.has(userId)) return;
  migratedUsers.add(userId);

  for (const baseKey of SCOPED_BASE_KEYS) {
    const scoped = userScopedKey(baseKey, userId);
    const existing = await secureStorage.get(scoped);

    if (existing && hasStoredPayload(baseKey, existing)) {
      continue;
    }

    const legacy = await secureStorage.get(baseKey);
    if (legacy && hasStoredPayload(baseKey, legacy)) {
      await secureStorage.set(scoped, legacy);
    }
  }
}

function hasStoredPayload(baseKey: string, raw: string): boolean {
  if (baseKey === STORAGE_KEYS.conversations) {
    try {
      const parsed = JSON.parse(raw) as unknown[];
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  }
  return raw.trim().length > 2;
}

/** Load conversations — scoped first, then legacy unscoped backup. */
export async function loadConversationsForUser(userId: string): Promise<string | null> {
  await migrateLegacyStorageForUser(userId);

  const scoped = await secureStorage.get(userScopedKey(STORAGE_KEYS.conversations, userId));
  if (scoped && hasStoredPayload(STORAGE_KEYS.conversations, scoped)) {
    return scoped;
  }

  const legacy = await secureStorage.get(STORAGE_KEYS.conversations);
  if (legacy && hasStoredPayload(STORAGE_KEYS.conversations, legacy)) {
    await secureStorage.set(userScopedKey(STORAGE_KEYS.conversations, userId), legacy);
    return legacy;
  }

  return scoped ?? legacy;
}

export async function getUserScoped(userId: string, baseKey: string): Promise<string | null> {
  await migrateLegacyStorageForUser(userId);
  return secureStorage.get(userScopedKey(baseKey, userId));
}

export async function setUserScoped(
  userId: string,
  baseKey: string,
  value: string,
): Promise<void> {
  await secureStorage.set(userScopedKey(baseKey, userId), value);
}

export async function removeUserScoped(userId: string, baseKey: string): Promise<void> {
  await secureStorage.remove(userScopedKey(baseKey, userId));
}

/** In-memory cache keys scoped per user (alerts, mandi snapshot). */
export function userCacheKey(baseKey: string, userId: string): string {
  return userScopedKey(baseKey, userId);
}
