import { and, desc, eq, gte } from 'drizzle-orm';

import { db } from '../db';
import { mandiPrices } from '../db/schema';
import { normalizeMandiCropId } from './mandiCropMapping';

export interface MandiAnalyticsRow {
  cropId: string;
  varietyId?: string | null;
  varietyName?: string | null;
  commodity: string;
  currentModal: number;
  previousModal: number;
  changeAmount: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  avg7d: number;
  avg30d: number;
  high30d: number;
  low30d: number;
  dailySeries: Array<{ date: string; modalPrice: number; minPrice: number; maxPrice: number }>;
  unit: string;
  market: string;
  state: string;
  updatedAt: string;
  isLive: boolean;
  priceToday: number | null;
  priceYesterday: number | null;
  priceLastMonth: number | null;
  priceLastYear: number | null;
}

type DbMandiRow = typeof mandiPrices.$inferSelect;

function dateOnly(value: string | Date): string {
  const text = typeof value === 'string' ? value : value.toISOString();
  return text.slice(0, 10);
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function num(value: string | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function dbRowToRate(row: DbMandiRow) {
  return {
    cropId: normalizeMandiCropId(row.cropId, row.commodity),
    varietyId: row.varietyId ?? undefined,
    varietyName: row.varietyName ?? undefined,
    commodity: row.commodity,
    market: row.market,
    district: row.district,
    state: row.state,
    date: dateOnly(row.priceDate),
    minPrice: num(row.minPrice),
    maxPrice: num(row.maxPrice),
    modalPrice: num(row.modalPrice),
    unit: row.unit,
    isLive: row.isLive,
  };
}

export function buildAnalyticsFromDbRows(rows: DbMandiRow[]): MandiAnalyticsRow[] {
  const groups = new Map<string, ReturnType<typeof dbRowToRate>[]>();

  for (const row of rows) {
    const mapped = dbRowToRate(row);
    const varietyKey = (mapped.varietyName ?? 'generic').toLowerCase().trim();
    const key = `${mapped.cropId}:${varietyKey}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(mapped);
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

  const analytics: MandiAnalyticsRow[] = [];

  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1]!;

    const dailyMap = new Map<string, { date: string; modalPrice: number; minPrice: number; maxPrice: number }>();
    for (const row of sorted) {
      const day = row.date;
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
      varietyName: latest.varietyName,
      commodity: latest.commodity,
      currentModal,
      previousModal,
      changeAmount,
      changePercent,
      trend: changePercent > 0.5 ? 'up' : changePercent < -0.5 ? 'down' : 'stable',
      avg7d: average(last7.map((point) => point.modalPrice)) ?? currentModal,
      avg30d: average(last30.map((point) => point.modalPrice)) ?? currentModal,
      high30d: last30.length ? Math.max(...last30.map((point) => point.modalPrice)) : latest.maxPrice,
      low30d: last30.length ? Math.min(...last30.map((point) => point.modalPrice)) : latest.minPrice,
      dailySeries: dailySeries.slice(-30),
      unit: latest.unit,
      market: latest.market,
      state: latest.state,
      updatedAt: new Date().toISOString(),
      isLive: latest.isLive,
      priceToday: priceOn(todayStr) ?? currentModal,
      priceYesterday: priceOn(yesterdayStr),
      priceLastMonth: average(pricesSince(monthAgo)),
      priceLastYear: average(pricesSince(yearAgo)),
    });
  }

  return analytics.sort((a, b) => (a.varietyName ?? '').localeCompare(b.varietyName ?? ''));
}

export async function fetchMandiAnalyticsFromDb(options?: {
  state?: string;
  cropId?: string;
  historyDays?: number;
}): Promise<MandiAnalyticsRow[]> {
  const state = options?.state ?? 'Andhra Pradesh';
  const historyDays = options?.historyDays ?? 400;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - historyDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const rows = await db
    .select()
    .from(mandiPrices)
    .where(and(eq(mandiPrices.state, state), gte(mandiPrices.priceDate, cutoffStr)))
    .orderBy(desc(mandiPrices.priceDate))
    .limit(10000);

  let analytics = buildAnalyticsFromDbRows(rows);
  if (options?.cropId) {
    analytics = analytics.filter((item) => item.cropId === options.cropId);
  }
  return analytics;
}
