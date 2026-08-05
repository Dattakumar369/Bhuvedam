import { CROPS } from '@/constants/crops';
import {
  buildVarietyList,
  getCuratedVariety,
  matchCuratedByAgmarknetName,
} from '@/constants/cropVarieties';
import type { VarietyEntry } from '@/constants/cropVarieties';
import { CROP_TO_MANDI_COMMODITY, MANDI_BASELINE_PRICES, SEASONAL_PRICE_INDEX } from '@/constants/mandiCommodities';
import {
  extractDiscoveredVarietyNames,
  fetchLiveMandiRates,
  generateFallbackRates,
  generateHistoricalSeriesForCurated,
  generateHistoricalSeriesForVariety,
} from '@/services/mandi/dataGovMandiService';
import type {
  DailyPricePoint,
  MandiAnalytics,
  MandiRateRecord,
  MandiRatesBundle,
  PriceForecast,
} from '@/types/mandi';

const DEFAULT_CROP_IDS = Object.keys(CROP_TO_MANDI_COMMODITY);

function analyticsKey(cropId: string, varietyId?: string, varietyName?: string): string {
  return `${cropId}:${varietyId ?? varietyName ?? 'all'}`;
}

function computeTrendPercent(series: DailyPricePoint[]): number {
  if (series.length < 14) return 0;
  const recent = series.slice(-7);
  const prior = series.slice(-14, -7);
  const recentAvg = recent.reduce((s, p) => s + p.modalPrice, 0) / recent.length;
  const priorAvg = prior.reduce((s, p) => s + p.modalPrice, 0) / prior.length;
  if (!priorAvg) return 0;
  return ((recentAvg - priorAvg) / priorAvg) * 100;
}

function baselineForRate(rate: MandiRateRecord): number {
  if (rate.varietyId) {
    const curated = getCuratedVariety(rate.cropId, rate.varietyId);
    if (curated) return curated.referenceBaselineQtl;
  }
  const curated = rate.variety ? matchCuratedByAgmarknetName(rate.cropId, rate.variety) : undefined;
  if (curated) return curated.referenceBaselineQtl;
  return rate.modalPrice || MANDI_BASELINE_PRICES[rate.cropId] || 2000;
}

function buildSeriesForRate(rate: MandiRateRecord): DailyPricePoint[] {
  const curated = rate.varietyId ? getCuratedVariety(rate.cropId, rate.varietyId) : undefined;
  const series = curated
    ? generateHistoricalSeriesForCurated(curated, 90)
    : generateHistoricalSeriesForVariety(
        rate.cropId,
        baselineForRate(rate),
        rate.varietyId ?? rate.variety ?? rate.cropId,
        90,
      );

  if (series.length) {
    series[series.length - 1] = {
      date: rate.date,
      modalPrice: rate.modalPrice,
      minPrice: rate.minPrice,
      maxPrice: rate.maxPrice,
    };
  }
  return series;
}

function buildAnalytics(rate: MandiRateRecord, series: DailyPricePoint[]): MandiAnalytics {
  const current = series[series.length - 1]?.modalPrice ?? rate.modalPrice;
  const previous = series[series.length - 2]?.modalPrice ?? current;
  const changeAmount = current - previous;
  const changePercent = previous ? (changeAmount / previous) * 100 : 0;
  const last7 = series.slice(-7);
  const last30 = series.slice(-30);

  const avg7d = last7.reduce((s, p) => s + p.modalPrice, 0) / (last7.length || 1);
  const avg30d = last30.reduce((s, p) => s + p.modalPrice, 0) / (last30.length || 1);
  const curated = rate.varietyId ? getCuratedVariety(rate.cropId, rate.varietyId) : undefined;

  return {
    cropId: rate.cropId,
    varietyId: rate.varietyId,
    varietyName: rate.varietyName ?? rate.variety ?? curated?.name,
    commodity: rate.commodity,
    currentModal: current,
    previousModal: previous,
    changeAmount,
    changePercent,
    trend: changePercent > 0.5 ? 'up' : changePercent < -0.5 ? 'down' : 'stable',
    avg7d: Math.round(avg7d),
    avg30d: Math.round(avg30d),
    high30d: Math.max(...last30.map((p) => p.modalPrice)),
    low30d: Math.min(...last30.map((p) => p.modalPrice)),
    dailySeries: series.slice(-30),
    unit: rate.unit,
    market: rate.market,
    state: rate.state,
    updatedAt: new Date().toISOString(),
    isLive: rate.isLive ?? false,
    priceNote: curated?.priceNoteTe ?? curated?.priceNote,
    priceToday: current,
    priceYesterday: previous !== current ? previous : null,
    priceLastMonth: Math.round(avg30d),
    priceLastYear: null,
  };
}

export function estimateFuturePrice(
  cropId: string,
  monthsAhead: number,
  currentPrice: number,
  series: DailyPricePoint[],
  varietyId?: string,
  varietyName?: string,
): PriceForecast {
  const today = new Date();
  const target = new Date(today);
  target.setMonth(target.getMonth() + monthsAhead);

  const seasonal = SEASONAL_PRICE_INDEX[cropId] ?? SEASONAL_PRICE_INDEX.rice;
  const seasonalFactor = (seasonal[target.getMonth()] ?? 1) / (seasonal[today.getMonth()] ?? 1);
  const trendPercent = computeTrendPercent(series);
  const trendMultiplier = 1 + (trendPercent / 100 / 4) * monthsAhead;
  const estimated = Math.round(currentPrice * seasonalFactor * trendMultiplier);
  const volatility = cropId === 'tomato' ? 0.15 : 0.08;

  const crop = CROPS.find((c) => c.id === cropId);
  const curated = varietyId ? getCuratedVariety(cropId, varietyId) : undefined;

  const factors: string[] = [
    varietyName
      ? `${varietyName} — variety-specific mandi rate`
      : `Seasonal pattern for ${target.toLocaleString('en-IN', { month: 'long' })}`,
    `Recent ${trendPercent >= 0 ? 'upward' : 'downward'} trend (${Math.abs(trendPercent).toFixed(1)}%)`,
  ];
  if (curated) factors.push(curated.priceNote);
  if (crop) factors.push(`Harvest: ${curated?.harvestWindow ?? crop.harvestPeriod}`);

  return {
    cropId,
    varietyId,
    varietyName: varietyName ?? curated?.name,
    commodity: CROP_TO_MANDI_COMMODITY[cropId] ?? cropId,
    currentPrice,
    estimatedPrice: estimated,
    estimatedLow: Math.round(estimated * (1 - volatility)),
    estimatedHigh: Math.round(estimated * (1 + volatility)),
    targetDate: target.toISOString().slice(0, 10),
    monthsAhead,
    confidence: series.length >= 60 ? 'high' : series.length >= 30 ? 'medium' : 'low',
    trendPercent: Math.round(trendPercent * 10) / 10,
    seasonalFactor: Math.round(seasonalFactor * 100) / 100,
    unit: 'Rs./Quintal',
    factors,
  };
}

export function getDefaultForecastMonths(cropId: string, varietyId?: string): number {
  const curated = varietyId ? getCuratedVariety(cropId, varietyId) : undefined;
  if (curated) {
    const days = parseInt(curated.duration, 10);
    if (days >= 130) return 5;
    if (days >= 115) return 4;
  }
  return cropId === 'rice' ? 4 : 3;
}

export interface MandiRatesBundleExtended extends MandiRatesBundle {
  varietyLists: Record<string, VarietyEntry[]>;
}

export async function fetchMandiRatesBundle(
  cropIds: string[] = DEFAULT_CROP_IDS,
  state?: string,
): Promise<MandiRatesBundleExtended> {
  let rates: MandiRateRecord[] = [];
  let source: MandiRatesBundle['source'] = 'estimated';

  try {
    rates = await fetchLiveMandiRates(state, cropIds);
    if (rates.length) source = 'live';
  } catch {
    rates = [];
  }

  if (!rates.length) {
    rates = generateFallbackRates(cropIds, state);
    source = 'estimated';
  }

  const analytics = rates.map((rate) => buildAnalytics(rate, buildSeriesForRate(rate)));

  const varietyLists: Record<string, VarietyEntry[]> = {};
  for (const cropId of cropIds) {
    const discovered = extractDiscoveredVarietyNames(rates, cropId);
    varietyLists[cropId] = buildVarietyList(cropId, discovered);
  }

  return {
    rates,
    analytics,
    varietyLists,
    source,
    fetchedAt: new Date().toISOString(),
  };
}

export function buildForecastForAnalytics(
  analytics: MandiAnalytics,
  monthsAhead?: number,
): PriceForecast {
  const months = monthsAhead ?? getDefaultForecastMonths(analytics.cropId, analytics.varietyId);
  return estimateFuturePrice(
    analytics.cropId,
    months,
    analytics.currentModal,
    analytics.dailySeries,
    analytics.varietyId,
    analytics.varietyName,
  );
}

export { analyticsKey };
