import { create } from 'zustand';

import { DEFAULT_LANGUAGE, LANGUAGES, type LanguageCode } from '@/constants/languages';
import { STORAGE_KEYS } from '@/constants/app';
import { secureStorage } from '@/utils/storage';
import { useCropCatalogStore } from '@/store/cropCatalogStore';

function isValidLanguage(code: string | null | undefined): code is LanguageCode {
  return LANGUAGES.some((l) => l.code === code);
}

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
    useCropCatalogStore.getState().setLanguage(language);
  },

  hydrate: async () => {
    const stored = await secureStorage.get(STORAGE_KEYS.language);
    const language = isValidLanguage(stored) ? stored : DEFAULT_LANGUAGE;
    set({ language });
    useCropCatalogStore.getState().setLanguage(language);
  },
}));
