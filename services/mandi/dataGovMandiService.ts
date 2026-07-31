import { matchCuratedByAgmarknetName } from '@/constants/cropVarieties';
import { varietyIdFromAgmarknetName } from '@/utils/slug';
import type { CropVariety } from '@/types/cropVariety';
import {
  CROP_MANDI_SEARCH_TERMS,
  CROP_TO_MANDI_COMMODITY,
  DEFAULT_MANDI_STATE,
  MANDI_BASELINE_PRICES,
  SEASONAL_PRICE_INDEX,
} from '@/constants/mandiCommodities';
import type { DailyPricePoint, MandiRateRecord } from '@/types/mandi';

/** Variety-wise Daily Market Prices — data.gov.in / Agmarknet */
const DATA_GOV_RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';
const DATA_GOV_BASE = 'https://api.data.gov.in/resource';
const PAGE_SIZE = 100;
const MAX_ROWS = 500;

type DataGovRecord = Record<string, string | undefined>;

type DataGovResponse = {
  records?: DataGovRecord[];
};

function field(row: DataGovRecord, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key] ?? row[key.toLowerCase()] ?? row[key.toUpperCase()];
    if (value) return value;
  }
  return undefined;
}

function parsePrice(value?: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function resolveVarietyId(cropId: string, agmarknetVariety?: string): string | undefined {
  if (!agmarknetVariety?.trim()) return undefined;
  const curated = matchCuratedByAgmarknetName(cropId, agmarknetVariety);
  return curated?.id ?? varietyIdFromAgmarknetName(agmarknetVariety);
}

function rowToRecord(
  row: DataGovRecord,
  cropId: string,
  fallbackCommodity: string,
  state: string,
): MandiRateRecord | null {
  const modal = parsePrice(field(row, 'modal_price', 'Modal_Price', 'modal price'));
  if (!modal) return null;

  const commodity = field(row, 'commodity', 'Commodity') ?? fallbackCommodity;
  const agmarknetVariety = field(row, 'variety', 'Variety');
  const market = field(row, 'market', 'Market') ?? 'APMC';
  const date = field(row, 'arrival_date', 'Arrival_Date', 'date') ?? new Date().toISOString().slice(0, 10);
  const varietyId = resolveVarietyId(cropId, agmarknetVariety);
  const curated = agmarknetVariety ? matchCuratedByAgmarknetName(cropId, agmarknetVariety) : undefined;

  return {
    id: `${cropId}-${varietyId ?? 'generic'}-${market}-${date}`,
    commodity,
    cropId,
    varietyId,
    varietyName: agmarknetVariety ?? curated?.name,
    market,
    district: field(row, 'district', 'District') ?? '',
    state: field(row, 'state', 'State') ?? state,
    variety: agmarknetVariety,
    date,
    minPrice: parsePrice(field(row, 'min_price', 'Min_Price')) || Math.round(modal * 0.96),
    maxPrice: parsePrice(field(row, 'max_price', 'Max_Price')) || Math.round(modal * 1.04),
    modalPrice: modal,
    unit: field(row, 'unit', 'Unit') ?? 'Rs./Quintal',
    isLive: true,
  };
}

async function fetchPage(
  apiKey: string,
  filters: Record<string, string>,
  offset: number,
): Promise<DataGovRecord[]> {
  const params = new URLSearchParams({
    'api-key': apiKey,
    format: 'json',
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });
  for (const [key, value] of Object.entries(filters)) {
    params.set(key, value);
  }

  const response = await fetch(`${DATA_GOV_BASE}/${DATA_GOV_RESOURCE_ID}?${params.toString()}`);
  if (!response.ok) return [];

  const json = (await response.json()) as DataGovResponse;
  return json.records ?? [];
}

/** Fetch ALL variety rows from Agmarknet for a commodity (paginated, up to 500) */
async function fetchAllVarietyRowsForCommodity(
  apiKey: string,
  commodity: string,
  state: string,
): Promise<DataGovRecord[]> {
  const all: DataGovRecord[] = [];

  for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
    const rows = await fetchPage(apiKey, {
      'filters[state]': state,
      'filters[commodity]': commodity,
    }, offset);
    if (!rows.length) break;
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
  }

  return all;
}

function dedupeByVariety(records: MandiRateRecord[]): MandiRateRecord[] {
  const map = new Map<string, MandiRateRecord>();

  for (const record of records) {
    const varietyKey = record.variety?.toLowerCase().trim() ?? record.varietyId ?? 'generic';
    const key = `${record.cropId}:${varietyKey}`;
    const existing = map.get(key);
    if (!existing || new Date(record.date) >= new Date(existing.date)) {
      map.set(key, record);
    }
  }

  return [...map.values()].sort((a, b) => (a.varietyName ?? '').localeCompare(b.varietyName ?? ''));
}

async function fetchAllLiveRatesForCrop(
  apiKey: string,
  cropId: string,
  state: string,
): Promise<MandiRateRecord[]> {
  const commodityTerms = CROP_MANDI_SEARCH_TERMS[cropId] ?? [CROP_TO_MANDI_COMMODITY[cropId]];
  const results: MandiRateRecord[] = [];

  for (const commodity of commodityTerms) {
    if (!commodity) continue;
    const rows = await fetchAllVarietyRowsForCommodity(apiKey, commodity, state);

    for (const row of rows) {
      const parsed = rowToRecord(row, cropId, commodity, state);
      if (parsed) results.push(parsed);
    }
    if (results.length) break;
  }

  return dedupeByVariety(results);
}

export async function fetchLiveMandiRates(
  state = DEFAULT_MANDI_STATE,
  cropIds?: string[],
): Promise<MandiRateRecord[]> {
  const apiKey = process.env.EXPO_PUBLIC_DATA_GOV_API_KEY;
  if (!apiKey) return [];

  const ids = cropIds?.length ? cropIds : Object.keys(CROP_MANDI_SEARCH_TERMS);
  const allRecords: MandiRateRecord[] = [];

  for (const cropId of ids) {
    const cropRates = await fetchAllLiveRatesForCrop(apiKey, cropId, state);
    allRecords.push(...cropRates);
  }

  return allRecords;
}

export function extractDiscoveredVarietyNames(records: MandiRateRecord[], cropId: string): string[] {
  const names = new Set<string>();
  for (const r of records) {
    if (r.cropId !== cropId) continue;
    const name = r.variety ?? r.varietyName;
    if (name?.trim()) names.add(name.trim());
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function generateHistoricalSeriesForVariety(
  cropId: string,
  baselineQtl: number,
  seed: string,
  days = 90,
): DailyPricePoint[] {
  const seasonal = SEASONAL_PRICE_INDEX[cropId] ?? SEASONAL_PRICE_INDEX.rice;
  const series: DailyPricePoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const monthIdx = d.getMonth();
    const seasonalFactor = seasonal[monthIdx] ?? 1;
    const noise = 1 + Math.sin(i * 0.5 + seed.length) * 0.025;
    const modal = Math.round(baselineQtl * seasonalFactor * noise);
    series.push({
      date: d.toISOString().slice(0, 10),
      modalPrice: modal,
      minPrice: Math.round(modal * 0.96),
      maxPrice: Math.round(modal * 1.04),
    });
  }

  return series;
}

/** Legacy helper for curated varieties with referenceBaselineQtl */
export function generateHistoricalSeriesForCurated(variety: CropVariety, days = 90): DailyPricePoint[] {
  return generateHistoricalSeriesForVariety(variety.cropId, variety.referenceBaselineQtl, variety.id, days);
}

export function generateFallbackRates(cropIds: string[], state = DEFAULT_MANDI_STATE): MandiRateRecord[] {
  const today = new Date().toISOString().slice(0, 10);
  return cropIds.map((cropId) => {
    const baseline = MANDI_BASELINE_PRICES[cropId] ?? 2000;
    const commodity = CROP_TO_MANDI_COMMODITY[cropId] ?? cropId;
    const point = generateHistoricalSeriesForVariety(cropId, baseline, cropId, 1)[0];
    return {
      id: `ref-${cropId}-generic-${today}`,
      commodity,
      cropId,
      varietyName: 'Mixed varieties (avg)',
      market: `${state.split(' ')[0]} APMC (reference avg)`,
      district: 'State average',
      state,
      date: today,
      minPrice: point.minPrice,
      maxPrice: point.maxPrice,
      modalPrice: point.modalPrice,
      unit: 'Rs./Quintal',
      isLive: false,
    };
  });
}

/** @deprecated */
export function generateHistoricalSeries(cropId: string, days = 90): DailyPricePoint[] {
  const baseline = MANDI_BASELINE_PRICES[cropId] ?? 2000;
  return generateHistoricalSeriesForVariety(cropId, baseline, cropId, days);
}
