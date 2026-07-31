import { API_CONFIG } from '@/constants/app';
import { fetchLiveSoil } from '@/services/agData/liveAgDataService';
import type { DbSoil } from '@/services/api/agDataRepository';

export interface FarmerSoilProfile {
  ph?: number | null;
  textureClass?: string | null;
  organicCarbonGkg?: number | null;
  nitrogenGkg?: number | null;
  clayPercent?: number | null;
  sandPercent?: number | null;
  siltPercent?: number | null;
  source: string;
  fetchedAt: string;
  latitude: number;
  longitude: number;
}

function toNumber(value?: string | null): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function mapDbSoil(row: DbSoil, lat: number, lon: number): FarmerSoilProfile {
  return {
    ph: toNumber(row.ph),
    textureClass: row.textureClass ?? null,
    organicCarbonGkg: toNumber(row.organicCarbonGkg),
    nitrogenGkg: toNumber(row.nitrogenGkg),
    clayPercent: toNumber(row.clayPercent),
    sandPercent: toNumber(row.sandPercent),
    siltPercent: toNumber(row.siltPercent),
    source: row.source ?? 'soilgrids',
    fetchedAt: new Date().toISOString(),
    latitude: lat,
    longitude: lon,
  };
}

/** Fetch soil at GPS from Neon/SoilGrids via backend */
export async function fetchSoilAtLocation(lat: number, lon: number): Promise<FarmerSoilProfile | null> {
  if (!API_CONFIG.useBackendData) return null;

  try {
    const row = await fetchLiveSoil(lat, lon);
    if (!row) return null;
    return mapDbSoil(row, lat, lon);
  } catch {
    return null;
  }
}
