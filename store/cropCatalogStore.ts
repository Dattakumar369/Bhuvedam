import { create } from 'zustand';

import { CROP_CATEGORIES, CROP_CATEGORY_TELUGU, CROPS, type CropCategory, type CropInfo } from '@/constants/crops';
import { getUserErrorMessage } from '@/constants/i18n/userErrorMessages';
import { DEFAULT_LANGUAGE, type LanguageCode } from '@/constants/languages';
import { fetchCropsFromBackend, searchCropsLocal } from '@/services/crops/cropService';

interface CropCatalogState {
  crops: CropInfo[];
  loading: boolean;
  error: string | null;
  source: 'local' | 'neon';
  lastFetched: string | null;
  language: LanguageCode;
  hydrate: (language?: LanguageCode) => Promise<void>;
  setLanguage: (language: LanguageCode) => void;
  search: (query: string) => CropInfo[];
  cropsGrouped: (query: string) => Map<CropCategory, CropInfo[]>;
}

export const useCropCatalogStore = create<CropCatalogState>((set, get) => ({
  crops: CROPS,
  loading: false,
  error: null,
  source: 'local',
  lastFetched: null,
  language: DEFAULT_LANGUAGE,

  setLanguage: (language) => {
    set({ language });
    void get().hydrate(language);
  },

  hydrate: async (language) => {
    const lang = language ?? get().language;
    set({ loading: true, error: null, language: lang });
    try {
      const rows = await fetchCropsFromBackend(undefined, lang);
      set({
        crops: rows.length ? rows : CROPS,
        loading: false,
        source: rows.length > CROPS.length ? 'neon' : 'local',
        lastFetched: new Date().toISOString(),
      });
    } catch {
      set({
        loading: false,
        error: getUserErrorMessage('CROPS_LOAD_FAILED', lang),
      });
    }
  },

  search: (query) => searchCropsLocal(get().crops, query),

  cropsGrouped: (query) => {
    const filtered = searchCropsLocal(get().crops, query);
    const groups = new Map<CropCategory, CropInfo[]>();
    for (const cat of CROP_CATEGORIES) {
      const items = filtered.filter((c) => c.category === cat);
      if (items.length) groups.set(cat, items);
    }
    return groups;
  },
}));

export { CROP_CATEGORY_TELUGU };
