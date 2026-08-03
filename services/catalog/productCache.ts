import { STORAGE_KEYS } from '@/constants/app';
import type { AgCatalogProduct, AgCatalogType } from '@/types/agCatalogProduct';
import type { FertilizerProduct } from '@/types/fertilizerProduct';
import { appCache } from '@/utils/storage';
import { secureStorage } from '@/utils/storage';

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CACHED = 120;

type CacheEnvelope<T> = { savedAt: number; items: T[] };

function agCacheKey(type: AgCatalogType): string {
  if (type === 'pesticide') return STORAGE_KEYS.productCachePesticides;
  if (type === 'fungicide') return STORAGE_KEYS.productCacheFungicides;
  return STORAGE_KEYS.productCacheFertilizers;
}

function isFresh(savedAt: number): boolean {
  return Date.now() - savedAt < CACHE_TTL_MS;
}

async function readDisk<T>(key: string): Promise<T[] | null> {
  try {
    const raw = await secureStorage.get(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed.items?.length || !isFresh(parsed.savedAt)) return null;
    return parsed.items;
  } catch {
    return null;
  }
}

async function writeDisk<T>(key: string, items: T[]): Promise<void> {
  const slim = items.slice(0, MAX_CACHED);
  const payload: CacheEnvelope<T> = { savedAt: Date.now(), items: slim };
  try {
    await secureStorage.set(key, JSON.stringify(payload));
  } catch {
    /* SecureStore size limits — memory cache still helps this session */
  }
  appCache.set(key, payload);
}

export async function loadCachedAgProducts(type: AgCatalogType): Promise<AgCatalogProduct[]> {
  const key = agCacheKey(type);
  const mem = appCache.get<CacheEnvelope<AgCatalogProduct>>(key);
  if (mem?.items?.length && isFresh(mem.savedAt)) return mem.items;

  const disk = await readDisk<AgCatalogProduct>(key);
  if (disk?.length) {
    appCache.set(key, { savedAt: Date.now(), items: disk });
    return disk;
  }
  return [];
}

export async function saveAgProductsCache(
  type: AgCatalogType,
  products: AgCatalogProduct[],
): Promise<void> {
  if (!products.length) return;
  await writeDisk(agCacheKey(type), products);
}

export async function loadCachedFertilizers(): Promise<FertilizerProduct[]> {
  const key = STORAGE_KEYS.productCacheFertilizers;
  const mem = appCache.get<CacheEnvelope<FertilizerProduct>>(key);
  if (mem?.items?.length && isFresh(mem.savedAt)) return mem.items;

  const disk = await readDisk<FertilizerProduct>(key);
  if (disk?.length) {
    appCache.set(key, { savedAt: Date.now(), items: disk });
    return disk;
  }
  return [];
}

export async function saveFertilizersCache(products: FertilizerProduct[]): Promise<void> {
  if (!products.length) return;
  await writeDisk(STORAGE_KEYS.productCacheFertilizers, products);
}
