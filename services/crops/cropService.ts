import { API_CONFIG } from '@/constants/app';
import type { LanguageCode } from '@/constants/languages';
import { CROPS, type CropCategory, type CropInfo, type CropSeason } from '@/constants/crops';
import { cropMatchesQuery } from '@/constants/cropSearchAliases';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';

export interface DbCropRow {
  id: string;
  name: string;
  nameTe: string | null;
  displayName?: string;
  displayTips?: string[] | null;
  displaySeasonLabel?: string | null;
  displaySowingPeriod?: string | null;
  displayHarvestPeriod?: string | null;
  displayWaterNeeds?: string | null;
  displaySoilType?: string | null;
  season: CropSeason | null;
  seasonLabel: string | null;
  category: string | null;
  sowingPeriod: string | null;
  harvestPeriod: string | null;
  waterNeeds: string | null;
  soilType: string | null;
  tips: string[] | null;
  icon: string | null;
  color: string | null;
  searchAliases?: string[] | null;
  description?: string | null;
}

const VALID_ICONS = new Set([
  'barley',
  'grain',
  'flower',
  'seed',
  'fruit-cherries',
  'grass',
  'corn',
  'leaf',
]);

function mapDbCrop(row: DbCropRow): CropInfo {
  const icon = VALID_ICONS.has(row.icon ?? '') ? (row.icon as CropInfo['icon']) : 'leaf';
  const farmerName = row.displayName ?? row.nameTe ?? row.name;
  const tips = row.displayTips?.length ? row.displayTips : row.tips ?? [];

  return {
    id: row.id,
    name: row.name,
    nameTe: farmerName,
    category: (row.category as CropCategory) ?? 'other',
    season: row.season ?? 'year-round',
    seasonLabel: row.displaySeasonLabel ?? row.seasonLabel ?? '',
    icon,
    color: row.color ?? '#66BB6A',
    sowingPeriod: row.displaySowingPeriod ?? row.sowingPeriod ?? '',
    harvestPeriod: row.displayHarvestPeriod ?? row.harvestPeriod ?? '',
    waterNeeds: row.displayWaterNeeds ?? row.waterNeeds ?? '',
    soilType: row.displaySoilType ?? row.soilType ?? '',
    tips,
  };
}

function mergeCrops(local: CropInfo[], remote: CropInfo[]): CropInfo[] {
  const byId = new Map<string, CropInfo>();
  for (const c of local) byId.set(c.id, c);
  for (const c of remote) {
    const existing = byId.get(c.id);
    byId.set(
      c.id,
      existing
        ? {
            ...existing,
            ...c,
            nameTe: c.nameTe || existing.nameTe,
            tips: c.tips.length ? c.tips : existing.tips,
          }
        : c,
    );
  }
  return [...byId.values()].sort((a, b) => a.nameTe.localeCompare(b.nameTe, 'te'));
}

export async function fetchCropsFromBackend(
  search?: string,
  language: LanguageCode = 'te',
): Promise<CropInfo[]> {
  if (!API_CONFIG.useBackendData) return CROPS;

  try {
    const response = await apiClient.get<{ data: DbCropRow[]; totalInDb?: number }>(
      ENDPOINTS.crops.list,
      {
        params: {
          search: search?.trim() || undefined,
          lang: language,
          localize: 'names',
          limit: 2000,
        },
        timeout: language === 'te' || language === 'en' ? 12000 : 25000,
      },
    );
    const mapped = (response.data.data ?? []).map(mapDbCrop);
    if (mapped.length) return mergeCrops(CROPS, mapped);
    return CROPS;
  } catch {
    return CROPS;
  }
}

export async function fetchCropByIdFromBackend(
  cropId: string,
  language: LanguageCode = 'te',
): Promise<CropInfo | null> {
  if (!API_CONFIG.useBackendData) {
    return CROPS.find((c) => c.id === cropId) ?? null;
  }

  try {
    const response = await apiClient.get<{ data: DbCropRow }>(ENDPOINTS.crops.detail(cropId), {
      params: { lang: language, localize: 'full' },
      timeout: language === 'te' || language === 'en' ? 15000 : 35000,
    });
    return mapDbCrop(response.data.data);
  } catch {
    return CROPS.find((c) => c.id === cropId) ?? null;
  }
}

/** Search locally — English, Telugu, or romanized */
export function searchCropsLocal(crops: CropInfo[], query: string): CropInfo[] {
  const q = query.trim();
  if (!q) return crops;
  return crops.filter((c) => cropMatchesQuery(c, q));
}
