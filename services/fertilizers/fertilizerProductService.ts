import { API_CONFIG } from '@/constants/app';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  loadCachedFertilizers,
  saveFertilizersCache,
} from '@/services/catalog/productCache';
import type { FertilizerProduct, FertilizerProductFilters } from '@/types/fertilizerProduct';

const PRODUCT_TIMEOUT_MS = 20000;

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

function applyClientFilters(
  products: FertilizerProduct[],
  filters: FertilizerProductFilters,
): FertilizerProduct[] {
  let out = products;

  if (filters.brand && filters.brand !== 'all') {
    out = out.filter((p) => p.brand.toLowerCase() === filters.brand!.toLowerCase());
  }
  if (filters.category && filters.category !== 'all') {
    out = out.filter((p) => p.category === filters.category);
  }
  if (filters.crop) {
    out = out.filter((p) => p.crops.includes(filters.crop!));
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    out = out.filter((p) => {
      const blob = `${p.name} ${p.brand} ${p.npk ?? ''} ${p.category}`.toLowerCase();
      return blob.includes(q);
    });
  }

  return out.slice(0, filters.limit ?? 200);
}

export async function fetchFertilizerProducts(
  filters: FertilizerProductFilters = {},
): Promise<{ products: FertilizerProduct[]; source: 'catalog' | 'offline' }> {
  if (API_CONFIG.useBackendData) {
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
          timeout: PRODUCT_TIMEOUT_MS,
        },
      );

      const products = (response.data.data ?? []).map(mapDbRow);
      if (products.length) {
        void saveFertilizersCache(products);
        return { products, source: 'catalog' };
      }
    } catch {
      /* try cache below */
    }
  }

  const cached = await loadCachedFertilizers();
  if (cached.length) {
    return {
      products: applyClientFilters(cached, filters),
      source: 'offline',
    };
  }

  return { products: [], source: 'offline' };
}

export async function fetchFertilizerProductById(id: string): Promise<FertilizerProduct | null> {
  if (API_CONFIG.useBackendData) {
    try {
      const response = await apiClient.get<{ data: DbFertilizerProductRow }>(
        ENDPOINTS.fertilizerProducts.detail(id),
        { timeout: PRODUCT_TIMEOUT_MS },
      );
      if (response.data.data) return mapDbRow(response.data.data);
    } catch {
      /* fall through */
    }
  }

  const cached = await loadCachedFertilizers();
  return cached.find((p) => p.id === id) ?? null;
}
