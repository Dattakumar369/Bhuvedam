import { API_CONFIG } from '@/constants/app';
import type { VarietyEntry } from '@/constants/cropVarieties';
import { buildVarietyList } from '@/constants/cropVarieties';
import { DEFAULT_MANDI_STATE } from '@/constants/mandiCommodities';
import { agDataRepository } from '@/services/api/agDataRepository';
import {
  analyticsKey,
  buildForecastForAnalytics,
  fetchMandiRatesBundle,
} from '@/services/mandi/mandiService';
import { buildAnalyticsFromRateHistory, normalizeMandiRates } from '@/services/mandi/mandiHistoryAnalytics';
import type { MandiAnalytics, MandiRateRecord, MandiRatesBundle } from '@/types/mandi';

export function isBackendDataEnabled(): boolean {
  return API_CONFIG.useBackendData;
}

export async function fetchLiveVarieties(cropId: string): Promise<VarietyEntry[]> {
  const rows = await agDataRepository.getVarieties(cropId);
  return rows.map((v) => ({
    id: v.id,
    cropId: v.cropId,
    name: v.name,
    nameTe: v.nameTe ?? v.name,
    isCurated: v.isCurated,
    agmarknetName: v.name,
  }));
}

export async function fetchLiveSoil(lat: number, lon: number) {
  return agDataRepository.getSoil(lat, lon);
}

/** Pull mandi + varieties from Neon (synced from Agmarknet) */
export async function fetchMandiBundleFromBackend(cropIds: string[]): Promise<{
  rates: MandiRateRecord[];
  analytics: MandiAnalytics[];
  varietyLists: Record<string, VarietyEntry[]>;
  source: MandiRatesBundle['source'];
  fetchedAt: string;
}> {
  let analytics: MandiAnalytics[] = [];
  let rates: MandiRateRecord[] = [];

  try {
    analytics = await agDataRepository.getMandiAnalytics(DEFAULT_MANDI_STATE);
  } catch {
    analytics = [];
  }

  if (!analytics.length) {
    rates = normalizeMandiRates(await agDataRepository.getMandiPrices(undefined, DEFAULT_MANDI_STATE));
    analytics = buildAnalyticsFromRateHistory(rates);
  } else {
    rates = normalizeMandiRates(await agDataRepository.getMandiPrices(undefined, DEFAULT_MANDI_STATE));
  }

  const varietyLists: Record<string, VarietyEntry[]> = {};
  for (const cropId of cropIds) {
    const discovered = analytics
      .filter((item) => item.cropId === cropId)
      .map((item) => item.varietyName)
      .filter((name): name is string => Boolean(name?.trim()));
    try {
      const apiVarieties = await fetchLiveVarieties(cropId);
      varietyLists[cropId] = buildVarietyList(cropId, [
        ...discovered,
        ...apiVarieties.map((v) => v.name),
      ]);
    } catch {
      varietyLists[cropId] = buildVarietyList(cropId, discovered);
    }
  }

  return {
    rates,
    analytics,
    varietyLists,
    source: analytics.length ? 'live' : 'cached',
    fetchedAt: new Date().toISOString(),
  };
}

/** Pull mandi + varieties from Neon; fall back to direct Agmarknet if backend unreachable */
export async function fetchAgDataBundle(cropIds: string[]) {
  if (!isBackendDataEnabled()) {
    return fetchMandiRatesBundle(cropIds);
  }

  try {
    const backend = await fetchMandiBundleFromBackend(cropIds);
    if (backend.analytics.length) return backend;
  } catch {
    // Backend down or localhost unreachable on device — use Agmarknet directly
  }

  return fetchMandiRatesBundle(cropIds);
}

export function buildForecastsFromAnalytics(
  analytics: MandiAnalytics[],
  forecastMonths: number,
): Record<string, ReturnType<typeof buildForecastForAnalytics>> {
  const forecasts: Record<string, ReturnType<typeof buildForecastForAnalytics>> = {};
  for (const item of analytics) {
    const key = analyticsKey(item.cropId, item.varietyId, item.varietyName);
    forecasts[key] = buildForecastForAnalytics(item, forecastMonths);
  }
  return forecasts;
}
