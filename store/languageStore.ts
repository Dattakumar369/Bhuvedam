import { create } from 'zustand';

import { DEFAULT_LANGUAGE, type LanguageCode } from '@/constants/languages';
import { STORAGE_KEYS } from '@/constants/app';
import { secureStorage } from '@/utils/storage';

interface LanguageState {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: DEFAULT_LANGUAGE,

  setLanguage: async (language) => {
    await secureStorage.set(STORAGE_KEYS.language, language);
    set({ language });
  },

  hydrate: async () => {
    const stored = await secureStorage.get(STORAGE_KEYS.language);
    if (stored) {
      set({ language: stored as LanguageCode });
    }
  },
}));
