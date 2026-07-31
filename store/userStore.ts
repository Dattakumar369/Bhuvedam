import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants/app';
import { activateUserSession, ensureStorageMatchesUser, resetUserScopedData } from '@/services/auth/userSession';
import { setAuthToken } from '@/services/api/client';
import { userRepository } from '@/services/api/repositories';
import type { User } from '@/types/user';
import { secureStorage } from '@/utils/storage';

/** Old demo login names — cleared on hydrate so AI does not say "Rajesh" etc. */
const LEGACY_DEMO_NAMES = new Set(['rajesh kumar', 'rajesh', 'demo farmer', 'farmer']);

function sanitizeLegacyUser(user: User | null): User | null {
  if (!user?.name) return user;
  const normalized = user.name.trim().toLowerCase();
  if (!LEGACY_DEMO_NAMES.has(normalized)) return user;
  return {
    ...user,
    name: undefined,
    location: undefined,
    farmSize: undefined,
  };
}

interface UserState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingComplete: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => Promise<void>;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setOnboardingComplete: (value: boolean) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  onboardingComplete: false,

  setUser: (user) => set({ user }),

  setToken: async (token) => {
    await secureStorage.set(STORAGE_KEYS.authToken, token);
    setAuthToken(token);
    set({ token, isAuthenticated: true });
  },

  login: async (user, token) => {
    await secureStorage.set(STORAGE_KEYS.authToken, token);
    setAuthToken(token);
    set({ user, token, isAuthenticated: true, isLoading: false });

    await activateUserSession(user);

    const updatedUser = get().user ?? user;
    await secureStorage.set(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  logout: async () => {
    try {
      await userRepository.logout();
    } catch {
      // Clear local session even if server call fails
    }
    await resetUserScopedData();
    await secureStorage.remove(STORAGE_KEYS.authToken);
    await secureStorage.remove(STORAGE_KEYS.user);
    setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const [token, userJson, onboarding] = await Promise.all([
        secureStorage.get(STORAGE_KEYS.authToken),
        secureStorage.get(STORAGE_KEYS.user),
        secureStorage.get(STORAGE_KEYS.onboardingComplete),
      ]);

      if (token) setAuthToken(token);

      const rawUser = userJson ? (JSON.parse(userJson) as User) : null;
      const parsedUser = sanitizeLegacyUser(rawUser);
      if (rawUser && parsedUser && rawUser.name !== parsedUser.name) {
        await secureStorage.set(STORAGE_KEYS.user, JSON.stringify(parsedUser));
      }

      if (parsedUser?.id) {
        await ensureStorageMatchesUser(parsedUser.id);
      }

      set({
        token,
        user: parsedUser,
        isAuthenticated: !!token,
        onboardingComplete: onboarding === 'true',
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setOnboardingComplete: async (value) => {
    await secureStorage.set(STORAGE_KEYS.onboardingComplete, String(value));
    set({ onboardingComplete: value });
  },
}));
