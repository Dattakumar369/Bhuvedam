import type { ApiResponse } from '@/types/api';
import type { MandiRateRecord } from '@/types/mandi';

import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

function unwrap<T>(body: { data?: T } & Partial<ApiResponse<T>>): T {
  if (body.data !== undefined) return body.data;
  throw new Error('Invalid API response');
}

export interface DbCrop {
  id: string;
  name: string;
  nameTe?: string | null;
  season?: string | null;
  category?: string | null;
  source: string;
  regionScope?: string | null;
}

export interface DbVariety {
  id: string;
  cropId: string;
  name: string;
  nameTe?: string | null;
  source: string;
  country?: string | null;
  isCurated: boolean;
}

export interface DbSoil {
  ph?: string | null;
  nitrogenGkg?: string | null;
  organicCarbonGkg?: string | null;
  clayPercent?: string | null;
  sandPercent?: string | null;
  siltPercent?: string | null;
  textureClass?: string | null;
  source: string;
}

export interface DbAgrochemical {
  id: string;
  type: string;
  name: string;
  nameTe?: string | null;
  dose?: string | null;
  timing?: string | null;
  npk?: string | null;
  source: string;
}

function mapMandiRow(row: Record<string, unknown>): MandiRateRecord {
  return {
    id: String(row.id),
    commodity: String(row.commodity),
    cropId: String(row.cropId),
    varietyId: row.varietyId ? String(row.varietyId) : undefined,
    varietyName: row.varietyName ? String(row.varietyName) : undefined,
    market: String(row.market),
    district: String(row.district),
    state: String(row.state),
    date: String(row.priceDate ?? row.date),
    minPrice: Number(row.minPrice),
    maxPrice: Number(row.maxPrice),
    modalPrice: Number(row.modalPrice),
    unit: String(row.unit ?? 'Quintal'),
    isLive: Boolean(row.isLive ?? true),
  };
}

/** Live agricultural data from Neon via Bhuvedam API — no static constants */
export const agDataRepository = {
  async getCrops(search?: string): Promise<DbCrop[]> {
    const response = await apiClient.get(ENDPOINTS.crops.list, {
      params: search ? { search } : undefined,
    });
    return unwrap<DbCrop[]>(response.data);
  },

  async getVarieties(cropId: string): Promise<DbVariety[]> {
    const response = await apiClient.get(ENDPOINTS.crops.varieties(cropId));
    return unwrap<DbVariety[]>(response.data);
  },

  async getMandiPrices(cropId?: string, state?: string): Promise<MandiRateRecord[]> {
    const response = await apiClient.get(ENDPOINTS.mandi.prices, {
      params: { cropId, state, limit: 500 },
    });
    return unwrap<Record<string, unknown>[]>(response.data).map(mapMandiRow);
  },

  async getFertilizers(cropId?: string): Promise<DbAgrochemical[]> {
    const response = await apiClient.get(ENDPOINTS.crops.fertilizers(), {
      params: cropId ? { cropId } : undefined,
    });
    return unwrap<DbAgrochemical[]>(response.data);
  },

  async getSoil(lat: number, lon: number): Promise<DbSoil | null> {
    const response = await apiClient.get(ENDPOINTS.soils.query, {
      params: { lat, lon },
    });
    return unwrap<DbSoil | null>(response.data);
  },

  async triggerSync(): Promise<void> {
    await apiClient.post(ENDPOINTS.sync.trigger);
  },
};
