import { create } from 'zustand';

import { API_CONFIG } from '@/constants/app';
import { resolveApiError } from '@/services/api/userFacingError';
import type { VarietyEntry } from '@/constants/cropVarieties';
import { buildVarietyList } from '@/constants/cropVarieties';
import { MANDI_CROPS } from '@/constants/mandiCommodities';
import {
  buildForecastsFromAnalytics,
  fetchAgDataBundle,
} from '@/services/agData/liveAgDataService';
import {
  analyticsKey,
  buildForecastForAnalytics,
  fetchMandiRatesBundle,
} from '@/services/mandi/mandiService';
import type { MandiAnalytics, MandiRateRecord, PriceForecast } from '@/types/mandi';

interface MandiState {
  rates: MandiRateRecord[];
  analytics: MandiAnalytics[];
  varietyLists: Record<string, VarietyEntry[]>;
  forecasts: Record<string, PriceForecast>;
  selectedCropId: string;
  selectedVarietyId: string | null;
  forecastMonths: number;
  source: 'live' | 'cached' | 'estimated';
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
  setSelectedCrop: (cropId: string) => void;
  setSelectedVariety: (varietyId: string | null) => void;
  setForecastMonths: (months: number) => void;
  fetchRates: (force?: boolean) => Promise<void>;
  refreshRates: () => Promise<void>;
  getVarietyList: (cropId: string) => VarietyEntry[];
  getAnalyticsForCrop: (cropId: string) => MandiAnalytics[];
  getSelectedAnalytics: () => MandiAnalytics | undefined;
  getSelectedForecast: () => PriceForecast | undefined;
}

function pickDefaultVariety(list: VarietyEntry[], analytics: MandiAnalytics[]): string | null {
  if (!list.length) return analytics[0]?.varietyId ?? null;
  const withLiveRate = analytics.find((a) => a.varietyId && list.some((v) => v.id === a.varietyId));
  return withLiveRate?.varietyId ?? list[0]?.id ?? analytics[0]?.varietyId ?? null;
}

export const useMandiStore = create<MandiState>((set, get) => ({
  rates: [],
  analytics: [],
  varietyLists: {},
  forecasts: {},
  selectedCropId: MANDI_CROPS[0]?.id ?? 'rice',
  selectedVarietyId: null,
  forecastMonths: 3,
  source: 'estimated',
  isLoading: false,
  error: null,
  lastFetched: null,

  setSelectedCrop: (cropId) => {
    const list = get().getVarietyList(cropId);
    const cropAnalytics = get().getAnalyticsForCrop(cropId);
    const varietyId = pickDefaultVariety(list, cropAnalytics);
    set({ selectedCropId: cropId, selectedVarietyId: varietyId });
    const analytics = cropAnalytics.find(
      (a) => a.varietyId === varietyId || a.varietyName === list.find((v) => v.id === varietyId)?.name,
    );
    const forecast = analytics ? buildForecastForAnalytics(analytics, get().forecastMonths) : undefined;
    if (analytics && forecast) {
      set((s) => ({
        forecasts: {
          ...s.forecasts,
          [analyticsKey(analytics.cropId, analytics.varietyId, analytics.varietyName)]: forecast,
        },
      }));
    }
  },

  setSelectedVariety: (varietyId) => {
    set({ selectedVarietyId: varietyId });
    const { selectedCropId, forecastMonths } = get();
    const list = get().getVarietyList(selectedCropId);
    const entry = list.find((v) => v.id === varietyId);
    const analytics = get()
      .getAnalyticsForCrop(selectedCropId)
      .find(
        (a) =>
          a.varietyId === varietyId ||
          (entry?.agmarknetName && a.varietyName?.toLowerCase() === entry.agmarknetName.toLowerCase()),
      );
    const forecast = analytics ? buildForecastForAnalytics(analytics, forecastMonths) : undefined;
    if (analytics && forecast) {
      set((s) => ({
        forecasts: {
          ...s.forecasts,
          [analyticsKey(analytics.cropId, analytics.varietyId, analytics.varietyName)]: forecast,
        },
      }));
    }
  },

  setForecastMonths: (months) => {
    set({ forecastMonths: months });
    const analytics = get().getSelectedAnalytics();
    const forecast = analytics ? buildForecastForAnalytics(analytics, months) : undefined;
    if (analytics && forecast) {
      set((s) => ({
        forecasts: {
          ...s.forecasts,
          [analyticsKey(analytics.cropId, analytics.varietyId, analytics.varietyName)]: forecast,
        },
      }));
    }
  },

  fetchRates: async (force = false) => {
    if (!force && get().rates.length) return;

    set({ isLoading: true, error: null });

    try {
      const cropIds = MANDI_CROPS.map((c) => c.id);
      const bundle = API_CONFIG.useBackendData
        ? await fetchAgDataBundle(cropIds)
        : await fetchMandiRatesBundle(cropIds);
      const forecasts = buildForecastsFromAnalytics(bundle.analytics, get().forecastMonths);

      const { selectedCropId } = get();
      const list = bundle.varietyLists[selectedCropId] ?? buildVarietyList(selectedCropId);
      const cropAnalytics = bundle.analytics.filter((a) => a.cropId === selectedCropId);
      const selectedVarietyId = pickDefaultVariety(list, cropAnalytics);

      set({
        rates: bundle.rates,
        analytics: bundle.analytics,
        varietyLists: bundle.varietyLists,
        forecasts,
        selectedVarietyId,
        source: bundle.source,
        isLoading: false,
        lastFetched: bundle.fetchedAt,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: resolveApiError(error, 'MANDI_LOAD_FAILED'),
      });
    }
  },

  refreshRates: async () => {
    await get().fetchRates(true);
  },

  getVarietyList: (cropId) => {
    return get().varietyLists[cropId] ?? buildVarietyList(cropId);
  },

  getAnalyticsForCrop: (cropId) => get().analytics.filter((a) => a.cropId === cropId),

  getSelectedAnalytics: () => {
    const { analytics, selectedCropId, selectedVarietyId } = get();
    const cropAnalytics = analytics.filter((a) => a.cropId === selectedCropId);
    if (selectedVarietyId) {
      const list = get().getVarietyList(selectedCropId);
      const entry = list.find((v) => v.id === selectedVarietyId);
      return (
        cropAnalytics.find(
          (a) =>
            a.varietyId === selectedVarietyId ||
            (entry?.agmarknetName &&
              a.varietyName?.toLowerCase() === entry.agmarknetName.toLowerCase()),
        ) ?? cropAnalytics[0]
      );
    }
    return cropAnalytics[0];
  },

  getSelectedForecast: () => {
    const analytics = get().getSelectedAnalytics();
    if (!analytics) return undefined;
    return get().forecasts[analyticsKey(analytics.cropId, analytics.varietyId, analytics.varietyName)];
  },
}));
