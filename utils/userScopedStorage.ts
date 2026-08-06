import { STORAGE_KEYS } from '@/constants/app';
import { secureStorage } from '@/utils/storage';
import type { Conversation } from '@/types/ai';

/** Per-user secure storage key — each account keeps its own chats, farm profile, alerts. */
export function userScopedKey(baseKey: string, userId: string): string {
  return `${baseKey}__${userId}`;
}

/** Stable lookup when auth user id changed between app versions. */
export function normalizePhoneForStorage(phone: string): string {
  return phone.replace(/\D/g, '');
}

const SCOPED_BASE_KEYS = [
  STORAGE_KEYS.conversations,
  STORAGE_KEYS.farmerContext,
  STORAGE_KEYS.farmAlerts,
  STORAGE_KEYS.mandiSnapshot,
] as const;

const migratedUsers = new Set<string>();

function parseConversationCount(raw: string): number {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return 0;
    return parsed.length;
  } catch {
    return 0;
  }
}

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
    return parseConversationCount(raw) > 0;
  }
  return raw.trim().length > 2;
}

async function readConversationCandidate(
  key: string,
): Promise<{ key: string; raw: string; count: number } | null> {
  const raw = await secureStorage.get(key);
  if (!raw) return null;
  const count = parseConversationCount(raw);
  if (count <= 0) return null;
  return { key, raw, count };
}

/** Load conversations — tries scoped, phone, legacy, and orphaned owner keys; picks richest backup. */
export async function loadConversationsForUser(
  userId: string,
  phone?: string,
): Promise<string | null> {
  await migrateLegacyStorageForUser(userId);

  const keysToTry = new Set<string>([
    userScopedKey(STORAGE_KEYS.conversations, userId),
    STORAGE_KEYS.conversations,
  ]);

  if (phone) {
    keysToTry.add(userScopedKey(STORAGE_KEYS.conversations, normalizePhoneForStorage(phone)));
  }

  const lastUserId = await secureStorage.get(STORAGE_KEYS.lastUserId);
  if (lastUserId) {
    keysToTry.add(userScopedKey(STORAGE_KEYS.conversations, lastUserId));
  }

  const ownerUserId = await secureStorage.get(STORAGE_KEYS.conversationsOwner);
  if (ownerUserId) {
    keysToTry.add(userScopedKey(STORAGE_KEYS.conversations, ownerUserId));
  }

  const candidates: { key: string; raw: string; count: number }[] = [];
  for (const key of keysToTry) {
    const candidate = await readConversationCandidate(key);
    if (candidate) candidates.push(candidate);
  }

  if (!candidates.length) return null;

  candidates.sort((a, b) => b.count - a.count);
  const best = candidates[0];

  const scopedKey = userScopedKey(STORAGE_KEYS.conversations, userId);
  await secureStorage.set(scopedKey, best.raw);
  await secureStorage.set(STORAGE_KEYS.conversations, best.raw);
  await secureStorage.set(STORAGE_KEYS.conversationsOwner, userId);

  return best.raw;
}

/** Write chat backup to scoped, legacy, phone, and owner pointer keys. */
export async function persistConversationsForUser(
  userId: string,
  phone: string | undefined,
  conversations: Conversation[],
): Promise<void> {
  const json = JSON.stringify(conversations);
  await secureStorage.set(userScopedKey(STORAGE_KEYS.conversations, userId), json);
  await secureStorage.set(STORAGE_KEYS.conversations, json);
  await secureStorage.set(STORAGE_KEYS.conversationsOwner, userId);
  if (phone) {
    await secureStorage.set(
      userScopedKey(STORAGE_KEYS.conversations, normalizePhoneForStorage(phone)),
      json,
    );
  }
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
