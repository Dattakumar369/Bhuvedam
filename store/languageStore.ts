import { create } from 'zustand';

import { DEFAULT_LANGUAGE, LANGUAGES, type LanguageCode } from '@/constants/languages';
import { STORAGE_KEYS } from '@/constants/app';
import {
  notificationsSupported,
  scheduleDailyAlertCheck,
} from '@/services/alerts/localNotifications';
import { useCropCatalogStore } from '@/store/cropCatalogStore';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import { useUserStore } from '@/store/userStore';
import { secureStorage } from '@/utils/storage';

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

    // Keep user profile + Neon in sync so server push uses the same language.
    const user = useUserStore.getState().user;
    if (user) {
      const updated = { ...user, language };
      useUserStore.getState().setUser(updated);
      await secureStorage.set(STORAGE_KEYS.user, JSON.stringify(updated));
      const context = useFarmerContextStore.getState();
      // Dynamic import avoids circular dependency with farmerSyncService.
      void import('@/services/farmers/farmerSyncService').then(
        ({ buildFarmerSyncPayload, syncFarmerProfileToDatabase }) =>
          syncFarmerProfileToDatabase(
            buildFarmerSyncPayload(context, { name: updated.name, language }),
          ),
      );
    }

    // Reschedule local morning reminder in the new language.
    if (notificationsSupported) {
      void scheduleDailyAlertCheck();
    }
  },

  hydrate: async () => {
    const stored = await secureStorage.get(STORAGE_KEYS.language);
    const language = isValidLanguage(stored) ? stored : DEFAULT_LANGUAGE;
    set({ language });
    useCropCatalogStore.getState().setLanguage(language);
  },
}));
