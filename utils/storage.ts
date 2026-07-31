import * as SecureStore from 'expo-secure-store';

/** In-memory cache — works in Expo Go without native modules. */
const memoryCache = new Map<string, string>();

export const secureStorage = {
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

export const appCache = {
  get<T>(key: string): T | null {
    const value = memoryCache.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    memoryCache.set(key, JSON.stringify(value));
  },
  remove(key: string): void {
    memoryCache.delete(key);
  },
  clear(): void {
    memoryCache.clear();
  },
};
