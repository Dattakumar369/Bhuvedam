import { API_CONFIG } from '@/constants/app';
import type { VarietyEntry } from '@/constants/cropVarieties';
import { agDataRepository } from '@/services/api/agDataRepository';
import {
  analyticsKey,
  buildForecastForAnalytics,
  fetchMandiRatesBundle,
} from '@/services/mandi/mandiService';
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

function ratesToAnalytics(rates: MandiRateRecord[]): MandiAnalytics[] {
  return rates.map((rate) => ({
    cropId: rate.cropId,
    varietyId: rate.varietyId,
    varietyName: rate.varietyName ?? rate.variety,
    commodity: rate.commodity,
    currentModal: rate.modalPrice,
    previousModal: rate.modalPrice,
    changeAmount: 0,
    changePercent: 0,
    trend: 'stable' as const,
    avg7d: rate.modalPrice,
    avg30d: rate.modalPrice,
    high30d: rate.maxPrice,
    low30d: rate.minPrice,
    dailySeries: [
      {
        date: rate.date,
        modalPrice: rate.modalPrice,
        minPrice: rate.minPrice,
        maxPrice: rate.maxPrice,
      },
    ],
    unit: rate.unit,
    market: rate.market,
    state: rate.state,
    updatedAt: new Date().toISOString(),
    isLive: true,
  }));
}

/** Pull mandi + varieties from Neon (synced from Agmarknet) */
export async function fetchMandiBundleFromBackend(cropIds: string[]): Promise<{
  rates: MandiRateRecord[];
  analytics: MandiAnalytics[];
  varietyLists: Record<string, VarietyEntry[]>;
  source: MandiRatesBundle['source'];
  fetchedAt: string;
}> {
  const rates = await agDataRepository.getMandiPrices();
  const analytics = ratesToAnalytics(rates);
  const varietyLists: Record<string, VarietyEntry[]> = {};

  const uniqueCropIds = [...new Set([...cropIds, ...rates.map((r) => r.cropId)])];
  for (const cropId of uniqueCropIds) {
    try {
      varietyLists[cropId] = await fetchLiveVarieties(cropId);
    } catch {
      varietyLists[cropId] = [];
    }
  }

  return {
    rates,
    analytics,
    varietyLists,
    source: rates.length ? 'live' : 'cached',
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
    if (backend.rates.length) return backend;
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
