import { create } from 'zustand';

import { CROPS } from '@/constants/crops';
import { getSoilTypeLabel } from '@/constants/soilTypes';
import { findVarietyByQuery, getCuratedVariety } from '@/constants/cropVarieties';
import { fetchSoilAtLocation, type FarmerSoilProfile } from '@/services/agData/soilService';
import { syncFarmerProfileToDatabase, shouldSyncFarmerToDatabase } from '@/services/farmers/farmerSyncService';
import type { FarmerServerProfile } from '@/services/farmers/farmerSyncService';
import { sowingMonthLabel } from '@/constants/sowingMonths';
import type { FarmerCropPlanting } from '@/types/farmerCrop';
import { farmLocationIsComplete, plantingIsComplete, totalAreaFromPlantings } from '@/types/farmerCrop';
import type { AreaMeasureMode, FieldMeasurement } from '@/types/fieldMeasure';
import { useMandiStore } from '@/store/mandiStore';
import { useUserStore } from '@/store/userStore';
import { STORAGE_KEYS } from '@/constants/app';
import { secureStorage } from '@/utils/storage';
import { getUserScoped, setUserScoped } from '@/utils/userScopedStorage';
import { formatAreaLabel } from '@/utils/geoArea';
import {
  extractFarmerKnowledge,
  formatLearnedFactsForAI,
  mergeLearnedFacts,
  type FarmerLearnedFact,
} from '@/services/ai/farmerKnowledge';

export type { FarmerLearnedFact };

export interface FarmerContext {
  crops: string[];
  cropPlantings: FarmerCropPlanting[];
  varieties: string[];
  notes: string[];
  learnedFacts: FarmerLearnedFact[];
  farmSize?: string;
  areaAcres?: number;
  areaCents?: number;
  areaSource?: AreaMeasureMode;
  tapeLengthM?: number;
  tapeWidthM?: number;
  district?: string;
  mandal?: string;
  village?: string;
  state?: string;
  soilType?: string;
  setupComplete: boolean;
  soilProfile?: FarmerSoilProfile | null;
  soilLoading: boolean;
  fieldMeasurement?: FieldMeasurement | null;
  updatedAt: string;
  syncError?: string | null;
}

const CROP_ALIASES: Record<string, string[]> = {
  wheat: ['wheat', 'గోధుమ', 'गेहूं', 'gōdhuma', 'godhuma', 'gothum'],
  rice: ['rice', 'వరి', 'चावल', 'paddy', 'nel', 'vari', 'bhatt'],
  cotton: ['cotton', 'పత్తి', 'कपास', 'patti', 'kapas'],
  tomato: ['tomato', 'టమాట', 'टमाटर', 'tamata'],
  chickpea: ['chickpea', 'శనగ', 'चना', 'chana', 'senaga'],
  mustard: ['mustard', 'ఆవాల', 'सरसों', 'avalu'],
  maize: ['maize', 'corn', 'మొక్కజొన్న', 'मक्का', 'mokkajonna'],
  soybean: ['soybean', 'సోయా', 'सोयाबीन'],
  groundnut: ['groundnut', 'peanut', 'వేరుశనగ', 'मूंगफली', 'verusenaga'],
  sugarcane: ['sugarcane', 'చెరకు', 'गन्ना', 'cheraku'],
};

interface FarmerContextState extends FarmerContext {
  hydrate: () => Promise<void>;
  rememberCrop: (cropId: string) => Promise<void>;
  removeCrop: (cropId: string) => Promise<void>;
  toggleCrop: (cropId: string) => Promise<void>;
  rememberNote: (note: string) => Promise<void>;
  setFarmSize: (size: string) => Promise<void>;
  setVillage: (village: string) => Promise<void>;
  setSoilType: (soilType: string) => Promise<void>;
  saveFarmSetup: (input: {
    crops: string[];
    cropPlantings?: FarmerCropPlanting[];
    district?: string;
    mandal?: string;
    village?: string;
    state?: string;
    soilType?: string;
  }) => Promise<void>;
  setFieldMeasurement: (measurement: FieldMeasurement | null) => Promise<void>;
  fetchSoilFromLocation: (lat: number, lon: number) => Promise<void>;
  learnFromUserMessage: (message: string) => Promise<void>;
  getSummary: () => string;
  getLearnedFactsSummary: () => string;
  needsSetup: () => boolean;
  clearSyncError: () => void;
  reset: () => Promise<void>;
  clearMemory: () => Promise<void>;
  applyFromServer: (profile: FarmerServerProfile) => Promise<void>;
}

const MAX_NOTES = 12;

function defaultContext(): FarmerContext {
  return {
    crops: [],
    cropPlantings: [],
    varieties: [],
    notes: [],
    learnedFacts: [],
    setupComplete: false,
    soilProfile: null,
    soilLoading: false,
    fieldMeasurement: null,
    updatedAt: new Date().toISOString(),
  };
}

async function persist(state: FarmerContext): Promise<boolean> {
  const userId = useUserStore.getState().user?.id;
  const lastUserId = await secureStorage.get(STORAGE_KEYS.lastUserId);
  if (!userId || !lastUserId || userId !== lastUserId) {
    return false;
  }

  await setUserScoped(userId, STORAGE_KEYS.farmerContext, JSON.stringify(state));
  const synced = await syncFarmerProfileToDatabase().catch(() => false);
  if (!synced && shouldSyncFarmerToDatabase()) {
    useFarmerContextStore.setState({ syncError: 'sync_failed' });
  } else if (synced) {
    useFarmerContextStore.setState({ syncError: null });
  }
  return synced;
}

function detectCropsInText(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();

  for (const [cropId, aliases] of Object.entries(CROP_ALIASES)) {
    if (aliases.some((alias) => lower.includes(alias.toLowerCase()))) {
      found.add(cropId);
    }
  }

  for (const crop of CROPS) {
    if (lower.includes(crop.name.toLowerCase()) || lower.includes(crop.id)) {
      found.add(crop.id);
    }
  }

  return [...found];
}

export const useFarmerContextStore = create<FarmerContextState>((set, get) => ({
  ...defaultContext(),

  hydrate: async () => {
    const userId = useUserStore.getState().user?.id;
    const isAuthenticated = useUserStore.getState().isAuthenticated;
    if (!isAuthenticated || !userId) {
      await get().clearMemory();
      return;
    }

    const lastUserId = await secureStorage.get(STORAGE_KEYS.lastUserId);
    if (lastUserId && lastUserId !== userId) {
      await get().clearMemory();
      return;
    }

    const raw = await getUserScoped(userId, STORAGE_KEYS.farmerContext);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<FarmerContext>;
      set({
        ...defaultContext(),
        ...parsed,
        cropPlantings: parsed.cropPlantings ?? [],
        learnedFacts: parsed.learnedFacts ?? [],
        setupComplete: Boolean(parsed.setupComplete),
        soilLoading: false,
      });
    } catch {
      // ignore corrupt storage
    }
  },

  needsSetup: () => {
    const { setupComplete, crops, cropPlantings, district, mandal, village, state } = get();
    const plantingsReady =
      crops.length > 0 &&
      cropPlantings.length >= crops.length &&
      cropPlantings.every(plantingIsComplete);
    const locationReady = farmLocationIsComplete({ district, mandal, village, state });
    return !setupComplete || !plantingsReady || !locationReady;
  },

  rememberCrop: async (cropId) => {
    const crops = get().crops.includes(cropId) ? get().crops : [...get().crops, cropId];
    const next = { ...get(), crops, updatedAt: new Date().toISOString() };
    set(next);
    await persist(next);
  },

  removeCrop: async (cropId) => {
    const crops = get().crops.filter((id) => id !== cropId);
    const next = { ...get(), crops, updatedAt: new Date().toISOString() };
    set(next);
    await persist(next);
  },

  toggleCrop: async (cropId) => {
    if (get().crops.includes(cropId)) {
      await get().removeCrop(cropId);
    } else {
      await get().rememberCrop(cropId);
    }
  },

  setVillage: async (village) => {
    const next = { ...get(), village: village.trim(), updatedAt: new Date().toISOString() };
    set(next);
    await persist(next);
  },

  setSoilType: async (soilType) => {
    const next = { ...get(), soilType, updatedAt: new Date().toISOString() };
    set(next);
    await persist(next);
  },

  saveFarmSetup: async ({
    crops,
    cropPlantings,
    district,
    mandal,
    village,
    state,
    soilType,
  }) => {
    const plantings = cropPlantings ?? get().cropPlantings;
    const fromPlantings = totalAreaFromPlantings(plantings);
    const sizeLabel = fromPlantings
      ? formatAreaLabel(fromPlantings.areaAcres, fromPlantings.areaCents)
      : get().farmSize ?? '';

    const next: FarmerContext = {
      ...get(),
      crops,
      cropPlantings: plantings,
      farmSize: sizeLabel,
      areaAcres: fromPlantings?.areaAcres ?? get().areaAcres,
      areaCents: fromPlantings?.areaCents ?? get().areaCents,
      district: district?.trim() || get().district,
      mandal: mandal?.trim() || get().mandal,
      village: village?.trim() || get().village,
      state: state?.trim() || get().state,
      soilType: soilType || get().soilType,
      setupComplete:
        crops.length > 0 &&
        plantings.length >= crops.length &&
        plantings.every(plantingIsComplete) &&
        farmLocationIsComplete({ district, mandal, village, state }),
      updatedAt: new Date().toISOString(),
    };
    set(next);
    await persist(next);
  },

  setFieldMeasurement: async (measurement) => {
    const next: FarmerContext = {
      ...get(),
      fieldMeasurement: measurement,
      updatedAt: new Date().toISOString(),
    };
    if (measurement) {
      next.areaSource = 'gps';
    }
    set(next);
    await persist(next);
  },

  fetchSoilFromLocation: async (lat, lon) => {
    if (get().soilLoading) return;
    set({ soilLoading: true });
    try {
      const soilProfile = await fetchSoilAtLocation(lat, lon);
      const next = {
        ...get(),
        soilProfile,
        soilLoading: false,
        updatedAt: new Date().toISOString(),
      };
      set(next);
      await persist(next);
    } catch {
      set({ soilLoading: false });
    }
  },

  rememberNote: async (note) => {
    const trimmed = note.trim().slice(0, 160);
    if (!trimmed) return;
    const notes = [trimmed, ...get().notes.filter((n) => n !== trimmed)].slice(0, MAX_NOTES);
    const next = { ...get(), notes, updatedAt: new Date().toISOString() };
    set(next);
    await persist(next);
  },

  setFarmSize: async (size) => {
    const next = { ...get(), farmSize: size, updatedAt: new Date().toISOString() };
    set(next);
    await persist(next);
  },

  learnFromUserMessage: async (message) => {
    const detected = detectCropsInText(message);
    let crops = get().crops;
    for (const cropId of detected) {
      if (!crops.includes(cropId)) crops = [...crops, cropId];
    }

    let varieties = get().varieties;
    for (const cropId of [...crops, ...detected]) {
      const match = findVarietyByQuery(cropId, message);
      if (match && !varieties.includes(`${cropId}:${match.id}`)) {
        varieties = [...varieties, `${cropId}:${match.id}`];
      }
    }

    const newFacts = extractFarmerKnowledge(message);
    const learnedFacts = mergeLearnedFacts(get().learnedFacts ?? [], newFacts);

    const isMemorable =
      detected.length > 0 ||
      /my crop|naa panta|నా పంట|meri fasal|my field|naa polam|acres|ఎకర|एकर/i.test(message);

    let notes = get().notes;
    if (isMemorable && message.length > 10) {
      notes = [message.trim().slice(0, 160), ...notes.filter((n) => n !== message.trim())].slice(
        0,
        MAX_NOTES,
      );
    }

    // Sync fact summaries into notes for backend + legacy summary
    for (const fact of newFacts) {
      if (!notes.includes(fact.text)) {
        notes = [fact.text, ...notes].slice(0, MAX_NOTES);
      }
    }

    const acreMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:acres?|ఎకర|एकर)/i);
    const farmSize = acreMatch ? `${acreMatch[1]} acres` : get().farmSize;

    const next: FarmerContext = {
      ...get(),
      crops,
      varieties,
      notes,
      learnedFacts,
      farmSize,
      updatedAt: new Date().toISOString(),
    };
    set(next);
    await persist(next);
  },

  getLearnedFactsSummary: () => formatLearnedFactsForAI(get().learnedFacts ?? []),

  getSummary: () => {
    const {
      crops,
      cropPlantings,
      varieties,
      notes,
      farmSize,
      areaAcres,
      areaCents,
      district,
      mandal,
      village,
      state,
      soilType,
      soilProfile,
      fieldMeasurement,
    } = get();
    const cropNames = crops
      .map((id) => CROPS.find((c) => c.id === id)?.name ?? id)
      .filter(Boolean);

    const varietyNames = varieties.map((key) => {
      const [cropId, varietyId] = key.split(':');
      if (!cropId || !varietyId) return key;
      const curated = getCuratedVariety(cropId, varietyId);
      if (curated) return `${curated.name} (${cropId})`;
      const fromList = useMandiStore.getState().getVarietyList(cropId).find((x) => x.id === varietyId);
      return fromList ? `${fromList.name} (${cropId})` : key;
    });

    const lines: string[] = [];
    if (cropNames.length) lines.push(`Crops farmer grows: ${cropNames.join(', ')}`);
    if (cropPlantings.length) {
      lines.push('Per-crop planting details:');
      for (const p of cropPlantings) {
        const name = CROPS.find((c) => c.id === p.cropId)?.name ?? p.cropId;
        const areaParts: string[] = [];
        if (p.areaAcres.trim()) areaParts.push(`${p.areaAcres.trim()} acres`);
        if (p.areaCents.trim()) areaParts.push(`${p.areaCents.trim()} cents`);
        const area = areaParts.length ? areaParts.join(', ') : 'area not specified';
        const month = p.sowingMonth ? sowingMonthLabel(p.sowingMonth) : 'unknown month';
        const year = p.sowingYear?.trim() || '';
        const variety = p.varietyName.trim() || 'variety not specified';
        lines.push(
          `  - ${name}: ${area}, variety "${variety}", sown ${month}${year ? ` ${year}` : ''}`,
        );
      }
    }
    if (varietyNames.length) lines.push(`Specific varieties (from chat): ${varietyNames.join(', ')}`);
    if (areaCents != null && areaAcres != null) {
      const src = get().areaSource;
      const srcLabel =
        src === 'patta' ? 'exact (patta)' : src === 'tape' ? 'exact (tape measure)' : src === 'gps' ? 'GPS estimate' : '';
      lines.push(`Farm size: ${areaCents} cents (${areaAcres} acres)${srcLabel ? ` — ${srcLabel}` : ''}`);
    } else if (farmSize) {
      lines.push(`Farm size: ${farmSize}`);
    }
    if (fieldMeasurement) {
      lines.push(
        `GPS field measurement (separate tool): ${fieldMeasurement.areaCents} cents (${fieldMeasurement.areaAcres} acres), ${fieldMeasurement.points.length} points`,
      );
    }
    const locationParts = [village, mandal, district, state].filter(Boolean);
    if (locationParts.length) {
      lines.push(`Farm location: ${locationParts.join(', ')} (village, mandal, district, state)`);
    }
    if (soilType) lines.push(`Farmer-reported soil type: ${getSoilTypeLabel(soilType)}`);
    if (soilProfile?.ph != null) {
      lines.push(
        `GPS soil (SoilGrids): pH ${soilProfile.ph}, texture ${soilProfile.textureClass ?? 'unknown'}, organic C ${soilProfile.organicCarbonGkg ?? '—'} g/kg`,
      );
    }
    if (notes.length) {
      lines.push('Recent farmer chat notes:');
      notes.slice(0, 6).forEach((n, i) => lines.push(`  ${i + 1}. ${n}`));
    }
    const learnedBlock = formatLearnedFactsForAI(get().learnedFacts ?? []);
    if (learnedBlock) {
      lines.push('', learnedBlock);
    }
    return lines.length ? lines.join('\n') : 'No saved farmer crop profile yet.';
  },

  clearSyncError: () => set({ syncError: null }),

  clearMemory: async () => {
    set(defaultContext());
  },

  reset: async () => {
    await get().clearMemory();
  },

  applyFromServer: async (profile) => {
    const next: FarmerContext = {
      ...defaultContext(),
      crops: profile.crops ?? [],
      cropPlantings: profile.cropPlantings ?? [],
      district: profile.district,
      mandal: profile.mandal,
      village: profile.village,
      state: profile.state,
      soilType: profile.soilType,
      farmSize: profile.farmSize,
      areaAcres: profile.areaAcres,
      notes: profile.notes ?? [],
      setupComplete: Boolean(profile.setupComplete),
      updatedAt: new Date().toISOString(),
      syncError: null,
    };
    set(next);
    const userId = useUserStore.getState().user?.id;
    if (userId) {
      await setUserScoped(userId, STORAGE_KEYS.farmerContext, JSON.stringify(next));
    }
  },
}));
