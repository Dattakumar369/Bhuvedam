import { API_CONFIG } from '@/constants/app';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { FertilizerProduct, FertilizerProductFilters } from '@/types/fertilizerProduct';

interface DbFertilizerProductRow {
  id: string;
  name: string;
  nameTe?: string | null;
  brand: string;
  category: string;
  type?: string | null;
  npk?: string | null;
  npkRatio?: string | null;
  nutrient?: string | null;
  dosage?: string | null;
  benefits?: string | null;
  crops: string[];
  seasons?: string[];
  application?: string[];
  applicationMethod?: string | null;
  precautions?: string | null;
  mrp?: string | null;
  price?: string | null;
  packSize?: string | null;
  image?: string | null;
  source: string;
  sourceUrl?: string | null;
  isSubsidized?: boolean;
}

function mapDbRow(row: DbFertilizerProductRow): FertilizerProduct {
  return {
    id: row.id,
    name: row.name,
    nameTe: row.nameTe,
    brand: row.brand,
    category: row.category || row.type || 'Fertilizer',
    npk: row.npk ?? row.npkRatio,
    nutrient: row.nutrient,
    dosage: row.dosage,
    benefits: row.benefits,
    crops: row.crops ?? [],
    seasons: row.seasons,
    application: row.application,
    applicationMethod: row.applicationMethod,
    precautions: row.precautions,
    mrp: row.mrp ?? row.price,
    packSize: row.packSize,
    image: row.image,
    source: row.source,
    sourceUrl: row.sourceUrl,
    isSubsidized: row.isSubsidized ?? true,
  };
}

export async function fetchFertilizerProducts(
  filters: FertilizerProductFilters = {},
): Promise<{ products: FertilizerProduct[]; source: 'catalog' | 'offline' }> {
  if (!API_CONFIG.useBackendData) {
    return { products: [], source: 'offline' };
  }

  try {
    const response = await apiClient.get<{ data: DbFertilizerProductRow[] }>(
      ENDPOINTS.fertilizerProducts.list,
      {
        params: {
          search: filters.search?.trim() || undefined,
          brand: filters.brand && filters.brand !== 'all' ? filters.brand : undefined,
          category: filters.category && filters.category !== 'all' ? filters.category : undefined,
          crop: filters.crop || undefined,
          limit: filters.limit ?? 200,
        },
        timeout: 8000,
      },
    );

    const products = (response.data.data ?? []).map(mapDbRow);
    return { products, source: 'catalog' };
  } catch {
    return { products: [], source: 'offline' };
  }
}

export async function fetchFertilizerProductById(id: string): Promise<FertilizerProduct | null> {
  if (!API_CONFIG.useBackendData) return null;

  try {
    const response = await apiClient.get<{ data: DbFertilizerProductRow }>(
      ENDPOINTS.fertilizerProducts.detail(id),
      { timeout: 8000 },
    );
    if (response.data.data) return mapDbRow(response.data.data);
    return null;
  } catch {
    return null;
  }
}
