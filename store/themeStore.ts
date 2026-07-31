import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants/app';
import { secureStorage } from '@/utils/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',
  isDark: false,

  setMode: async (mode) => {
    await secureStorage.set(STORAGE_KEYS.themeMode, mode);
    set({ mode, isDark: mode === 'dark' });
  },

  hydrate: async () => {
    const mode = (await secureStorage.get(STORAGE_KEYS.themeMode)) as ThemeMode | null;
    if (mode) {
      set({ mode, isDark: mode === 'dark' });
    }
  },
}));
