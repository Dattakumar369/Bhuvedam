import { STORAGE_KEYS } from '@/constants/app';
import { chunkedSecureStorage } from '@/utils/chunkedSecureStorage';
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

type StorageReader = {
  get(key: string): Promise<string | null>;
};

const conversationReaders: StorageReader[] = [chunkedSecureStorage, secureStorage];

function parseConversations(raw: string): Conversation[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Conversation[];
  } catch {
    return [];
  }
}

function conversationScore(conversations: Conversation[]): number {
  return conversations.reduce((sum, conv) => sum + (conv.messages?.length ?? 0), 0);
}

function parseConversationCount(raw: string): number {
  return parseConversations(raw).length;
}

/** One-time copy from legacy shared keys into the current user's scoped keys. */
export async function migrateLegacyStorageForUser(userId: string): Promise<void> {
  if (migratedUsers.has(userId)) return;
  migratedUsers.add(userId);

  for (const baseKey of SCOPED_BASE_KEYS) {
    if (baseKey === STORAGE_KEYS.conversations) continue;

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
): Promise<{ key: string; raw: string; score: number } | null> {
  let bestRaw: string | null = null;
  let bestScore = 0;

  for (const reader of conversationReaders) {
    const raw = await reader.get(key);
    if (!raw) continue;
    const conversations = parseConversations(raw);
    if (!conversations.length) continue;
    const score = conversationScore(conversations);
    if (score > bestScore) {
      bestScore = score;
      bestRaw = raw;
    }
  }

  if (!bestRaw || bestScore <= 0) return null;
  return { key, raw: bestRaw, score: bestScore };
}

function buildConversationKeys(userId: string, phone?: string): Set<string> {
  const keys = new Set<string>([
    userScopedKey(STORAGE_KEYS.conversations, userId),
    STORAGE_KEYS.conversations,
  ]);

  if (phone) {
    keys.add(userScopedKey(STORAGE_KEYS.conversations, normalizePhoneForStorage(phone)));
  }

  return keys;
}

async function appendConversationKeys(keys: Set<string>): Promise<void> {
  const lastUserId = await secureStorage.get(STORAGE_KEYS.lastUserId);
  if (lastUserId) {
    keys.add(userScopedKey(STORAGE_KEYS.conversations, lastUserId));
  }

  const ownerUserId = await secureStorage.get(STORAGE_KEYS.conversationsOwner);
  if (ownerUserId) {
    keys.add(userScopedKey(STORAGE_KEYS.conversations, ownerUserId));
  }
}

/** Load conversations — chunked + legacy SecureStore keys; picks richest backup. */
export async function loadConversationsForUser(
  userId: string,
  phone?: string,
): Promise<string | null> {
  await migrateLegacyStorageForUser(userId);

  const keysToTry = buildConversationKeys(userId, phone);
  await appendConversationKeys(keysToTry);

  const candidates: { key: string; raw: string; score: number }[] = [];
  for (const key of keysToTry) {
    const candidate = await readConversationCandidate(key);
    if (candidate) candidates.push(candidate);
  }

  if (!candidates.length) return null;

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  await persistConversationsForUser(userId, phone, parseConversations(best.raw));
  return best.raw;
}

/** Write chat backup using chunked storage (scoped + legacy + phone keys). */
export async function persistConversationsForUser(
  userId: string,
  phone: string | undefined,
  conversations: Conversation[],
): Promise<void> {
  if (!conversations.length) return;

  const json = JSON.stringify(conversations);
  const keys = buildConversationKeys(userId, phone);

  for (const key of keys) {
    await chunkedSecureStorage.set(key, json);
  }

  await secureStorage.set(STORAGE_KEYS.conversationsOwner, userId);
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
