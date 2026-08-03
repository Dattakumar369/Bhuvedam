import { API_CONFIG } from '@/constants/app';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  loadCachedAgProducts,
  saveAgProductsCache,
} from '@/services/catalog/productCache';
import type { AgCatalogFilters, AgCatalogProduct, AgCatalogType } from '@/types/agCatalogProduct';

const PRODUCT_TIMEOUT_MS = 20000;

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

interface BulkAgRow {
  id: string;
  name: string;
  nameTe?: string | null;
  type: string;
  subType?: string | null;
  brand?: string | null;
  activeIngredient?: string | null;
  npkRatio?: string | null;
  dosage: string;
  crops: string[];
  targetPest?: string | null;
  targetDisease?: string | null;
  applicationMethod?: string | null;
  precautions?: string | null;
  description?: string | null;
  price?: string | null;
  image?: string | null;
  source: string;
  sourceUrl?: string | null;
}

function mapCanonicalRow(row: CanonicalRow, type: AgCatalogType): AgCatalogProduct {
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

function mapBulkRow(row: BulkAgRow, type: AgCatalogType): AgCatalogProduct {
  return {
    id: row.id,
    name: row.name,
    nameTe: row.nameTe,
    type,
    subType: row.subType,
    brand: row.brand ?? undefined,
    activeIngredient: row.activeIngredient,
    npk: row.npkRatio,
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

function applyClientFilters(products: AgCatalogProduct[], filters: AgCatalogFilters): AgCatalogProduct[] {
  let out = products;

  if (filters.crop) {
    out = out.filter((p) => p.crops.includes(filters.crop!));
  }

  if (filters.brand && filters.brand !== 'all') {
    const brand = filters.brand.toLowerCase();
    out = out.filter((p) => p.brand?.toLowerCase().includes(brand));
  }

  if (filters.target && filters.target !== 'all') {
    const target = filters.target.toLowerCase();
    out = out.filter((p) => {
      const blob = `${p.targetPest ?? ''} ${p.targetDisease ?? ''} ${p.name}`.toLowerCase();
      return blob.includes(target);
    });
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    out = out.filter((p) => {
      const blob = `${p.name} ${p.activeIngredient ?? ''} ${p.brand ?? ''} ${p.targetPest ?? ''}`.toLowerCase();
      return blob.includes(q);
    });
  }

  return out.slice(0, filters.limit ?? 200);
}

async function fetchBulkProducts(
  type: AgCatalogType,
  filters: AgCatalogFilters,
): Promise<AgCatalogProduct[]> {
  const response = await apiClient.get<{ data: BulkAgRow[] }>(ENDPOINTS.agProducts.list, {
    params: {
      type,
      search: filters.search?.trim() || undefined,
      crop: filters.crop || undefined,
      limit: filters.limit ?? 200,
    },
    timeout: PRODUCT_TIMEOUT_MS,
  });
  return (response.data.data ?? []).map((r) => mapBulkRow(r, type));
}

async function fetchCanonicalProducts(
  type: AgCatalogType,
  filters: AgCatalogFilters,
): Promise<AgCatalogProduct[]> {
  const response = await apiClient.get<{ data: CanonicalRow[] }>(ENDPOINTS.agProducts.canonical, {
    params: {
      type,
      search: filters.search?.trim() || undefined,
      crop: filters.crop || undefined,
      target: filters.target || undefined,
      limit: filters.limit ?? 100,
    },
    timeout: PRODUCT_TIMEOUT_MS,
  });
  return (response.data.data ?? []).map((r) => mapCanonicalRow(r, type));
}

export async function fetchAgCatalogProducts(
  type: AgCatalogType,
  filters: AgCatalogFilters = {},
): Promise<{ products: AgCatalogProduct[]; source: 'reference' | 'offline' }> {
  if (type === 'fertilizer') {
    return { products: [], source: 'offline' };
  }

  if (API_CONFIG.useBackendData) {
    try {
      let products = await fetchBulkProducts(type, filters);
      if (!products.length) {
        products = await fetchCanonicalProducts(type, filters);
      }
      if (products.length) {
        void saveAgProductsCache(type, products);
        return {
          products: applyClientFilters(products, filters),
          source: 'reference',
        };
      }
    } catch {
      /* try cache below */
    }
  }

  const cached = await loadCachedAgProducts(type);
  if (cached.length) {
    return {
      products: applyClientFilters(cached, filters),
      source: 'offline',
    };
  }

  return { products: [], source: 'offline' };
}

export async function fetchAgCatalogProductById(id: string): Promise<AgCatalogProduct | null> {
  if (!API_CONFIG.useBackendData) {
    const cached =
      (await loadCachedAgProducts('pesticide')).find((p) => p.id === id) ??
      (await loadCachedAgProducts('fungicide')).find((p) => p.id === id);
    return cached ?? null;
  }

  try {
    const response = await apiClient.get<{ data: BulkAgRow }>(ENDPOINTS.agProducts.detail(id), {
      timeout: PRODUCT_TIMEOUT_MS,
    });
    const row = response.data.data;
    if (row) return mapBulkRow(row, row.type as AgCatalogType);
  } catch {
    /* fall through */
  }

  try {
    const response = await apiClient.get<{ data: CanonicalRow }>(
      ENDPOINTS.agProducts.canonicalDetail(id),
      { timeout: PRODUCT_TIMEOUT_MS },
    );
    const row = response.data.data;
    if (!row) return null;
    return mapCanonicalRow(row, row.type as AgCatalogType);
  } catch {
    const cached =
      (await loadCachedAgProducts('pesticide')).find((p) => p.id === id) ??
      (await loadCachedAgProducts('fungicide')).find((p) => p.id === id);
    return cached ?? null;
  }
}
