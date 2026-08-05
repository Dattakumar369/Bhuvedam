import { normalizeMandiCropId } from '@/constants/mandiCommodities';
import type { DailyPricePoint, MandiAnalytics, MandiRateRecord } from '@/types/mandi';

function dateOnly(value: string): string {
  return value.slice(0, 10);
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function trendFromChange(changePercent: number): MandiAnalytics['trend'] {
  if (changePercent > 0.5) return 'up';
  if (changePercent < -0.5) return 'down';
  return 'stable';
}

export function normalizeMandiRates(rates: MandiRateRecord[]): MandiRateRecord[] {
  return rates.map((rate) => ({
    ...rate,
    cropId: normalizeMandiCropId(rate.cropId, rate.commodity),
  }));
}

/** Build variety analytics + history stats from stored daily mandi rows. */
export function buildAnalyticsFromRateHistory(rates: MandiRateRecord[]): MandiAnalytics[] {
  const normalized = normalizeMandiRates(rates);
  const groups = new Map<string, MandiRateRecord[]>();

  for (const rate of normalized) {
    const varietyKey = (rate.varietyName ?? rate.variety ?? 'generic').toLowerCase().trim();
    const key = `${rate.cropId}:${varietyKey}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(rate);
    groups.set(key, bucket);
  }

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  const analytics: MandiAnalytics[] = [];

  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => dateOnly(a.date).localeCompare(dateOnly(b.date)));
    const latest = sorted[sorted.length - 1]!;

    const dailyMap = new Map<string, DailyPricePoint>();
    for (const row of sorted) {
      const day = dateOnly(row.date);
      const existing = dailyMap.get(day);
      if (!existing) {
        dailyMap.set(day, {
          date: day,
          modalPrice: row.modalPrice,
          minPrice: row.minPrice,
          maxPrice: row.maxPrice,
        });
        continue;
      }
      existing.modalPrice = Math.round((existing.modalPrice + row.modalPrice) / 2);
      existing.minPrice = Math.min(existing.minPrice, row.minPrice);
      existing.maxPrice = Math.max(existing.maxPrice, row.maxPrice);
    }

    const dailySeries = [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date));
    if (!dailySeries.length) continue;

    const currentModal = dailySeries[dailySeries.length - 1]!.modalPrice;
    const previousModal =
      dailySeries.length >= 2 ? dailySeries[dailySeries.length - 2]!.modalPrice : currentModal;
    const changeAmount = currentModal - previousModal;
    const changePercent = previousModal ? (changeAmount / previousModal) * 100 : 0;

    const last7 = dailySeries.slice(-7);
    const last30 = dailySeries.slice(-30);
    const priceOn = (day: string) => dailySeries.find((point) => point.date === day)?.modalPrice ?? null;
    const pricesSince = (from: Date) =>
      dailySeries
        .filter((point) => new Date(point.date) >= from)
        .map((point) => point.modalPrice);

    analytics.push({
      cropId: latest.cropId,
      varietyId: latest.varietyId,
      varietyName: latest.varietyName ?? latest.variety,
      commodity: latest.commodity,
      currentModal,
      previousModal,
      changeAmount,
      changePercent,
      trend: trendFromChange(changePercent),
      avg7d: average(last7.map((point) => point.modalPrice)) ?? currentModal,
      avg30d: average(last30.map((point) => point.modalPrice)) ?? currentModal,
      high30d: last30.length ? Math.max(...last30.map((point) => point.modalPrice)) : latest.maxPrice,
      low30d: last30.length ? Math.min(...last30.map((point) => point.modalPrice)) : latest.minPrice,
      dailySeries: dailySeries.slice(-30),
      unit: latest.unit,
      market: latest.market,
      state: latest.state,
      updatedAt: new Date().toISOString(),
      isLive: latest.isLive ?? true,
      priceToday: priceOn(todayStr) ?? currentModal,
      priceYesterday: priceOn(yesterdayStr),
      priceLastMonth: average(pricesSince(monthAgo)),
      priceLastYear: average(pricesSince(yearAgo)),
    });
  }

  return analytics.sort((a, b) => (a.varietyName ?? '').localeCompare(b.varietyName ?? ''));
}
