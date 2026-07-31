import { API_CONFIG } from '@/constants/app';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { AgCatalogFilters, AgCatalogProduct, AgCatalogType } from '@/types/agCatalogProduct';

interface CanonicalRow {
  id: string;
  name: string;
  nameTe?: string | null;
  type: 'pesticide' | 'fungicide';
  subType: string;
  brand?: string | null;
  activeIngredient: string;
  dosage: string;
  crops: string[];
  targetPest?: string | null;
  targetDisease?: string | null;
  applicationMethod: string;
  precautions: string;
  description: string;
  price?: string | null;
  image?: string | null;
  source: string;
  sourceUrl: string;
}

function mapRow(row: CanonicalRow, type: AgCatalogType): AgCatalogProduct {
  return {
    id: row.id,
    name: row.name,
    nameTe: row.nameTe,
    type,
    subType: row.subType,
    brand: row.brand ?? undefined,
    activeIngredient: row.activeIngredient,
    dosage: row.dosage,
    crops: row.crops ?? [],
    targetPest: row.targetPest,
    targetDisease: row.targetDisease,
    applicationMethod: row.applicationMethod,
    precautions: row.precautions,
    description: row.description,
    price: row.price,
    image: row.image,
    source: row.source,
    sourceUrl: row.sourceUrl,
  };
}

export async function fetchAgCatalogProducts(
  type: AgCatalogType,
  filters: AgCatalogFilters = {},
): Promise<{ products: AgCatalogProduct[]; source: 'reference' | 'offline' }> {
  if (type === 'fertilizer' || !API_CONFIG.useBackendData) {
    return { products: [], source: 'offline' };
  }

  try {
    const response = await apiClient.get<{ data: CanonicalRow[] }>(
      ENDPOINTS.agProducts.canonical,
      {
        params: {
          type,
          search: filters.search?.trim() || undefined,
          crop: filters.crop || undefined,
          target: filters.target || undefined,
          limit: filters.limit ?? 100,
        },
        timeout: 10000,
      },
    );

    return {
      products: (response.data.data ?? []).map((r) => mapRow(r, type)),
      source: 'reference',
    };
  } catch {
    return { products: [], source: 'offline' };
  }
}

export async function fetchAgCatalogProductById(id: string): Promise<AgCatalogProduct | null> {
  if (!API_CONFIG.useBackendData) return null;

  try {
    const response = await apiClient.get<{ data: CanonicalRow }>(
      ENDPOINTS.agProducts.canonicalDetail(id),
      { timeout: 8000 },
    );
    const row = response.data.data;
    if (!row) return null;
    const type = row.type as AgCatalogType;
    return mapRow(row, type);
  } catch {
    return null;
  }
}
