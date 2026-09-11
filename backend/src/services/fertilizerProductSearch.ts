import { and, eq, ilike, or, sql } from 'drizzle-orm';

import { db } from '../db';
import { fertilizerProducts } from '../db/schema/fertilizerProducts';
import {
  FERTILIZER_PRICE_SOURCE,
  resolveOfficialMrp,
} from '../ingestion/data/officialFertilizerMrps';
import { enrichProductsWithImages, enrichProductImageAsync } from './productImageResolver';
import { mergeManufacturerSourceUrl } from '../data/manufacturerProductPages';

export interface FertilizerProductQuery {
  search?: string;
  brand?: string;
  category?: string;
  crop?: string;
  source?: string;
  limit?: number;
}

type FertilizerRow = typeof fertilizerProducts.$inferSelect;

function applyOfficialMrpOverlay<T extends FertilizerRow>(row: T) {
  const official = resolveOfficialMrp({
    id: row.id,
    name: row.name,
    npk: row.npk,
  });
  const baseMeta = (row.metadata ?? {}) as Record<string, unknown>;

  if (!official) {
    const hasPrice = Boolean(row.mrp || row.price);
    return {
      ...row,
      mrp: row.mrp ?? row.price ?? null,
      price: row.price ?? row.mrp ?? null,
      priceSourceLabel: hasPrice
        ? (typeof baseMeta.priceSourceLabel === 'string'
            ? baseMeta.priceSourceLabel
            : FERTILIZER_PRICE_SOURCE.label)
        : null,
      priceNote: hasPrice
        ? (typeof baseMeta.priceNote === 'string' ? baseMeta.priceNote : FERTILIZER_PRICE_SOURCE.note)
        : null,
      metadata: baseMeta,
    };
  }

  return {
    ...row,
    mrp: official.mrp,
    price: official.mrp,
    packSize: row.packSize || official.packSize,
    isSubsidized: official.isSubsidized || row.isSubsidized,
    priceSourceLabel: FERTILIZER_PRICE_SOURCE.label,
    priceNote: FERTILIZER_PRICE_SOURCE.note,
    metadata: {
      ...baseMeta,
      priceSource: FERTILIZER_PRICE_SOURCE.id,
      priceSourceLabel: FERTILIZER_PRICE_SOURCE.label,
      priceNote: FERTILIZER_PRICE_SOURCE.note,
      officialGrade: official.grade,
    },
  };
}

export async function searchFertilizerProducts(query: FertilizerProductQuery) {
  const limit = Math.min(query.limit ?? 100, 500);
  const conditions = [];

  if (query.brand) {
    conditions.push(ilike(fertilizerProducts.brand, query.brand));
  }
  if (query.category) {
    conditions.push(eq(fertilizerProducts.category, query.category));
  }
  if (query.source) {
    conditions.push(eq(fertilizerProducts.source, query.source));
  }
  if (query.search?.trim()) {
    const pattern = `%${query.search.trim()}%`;
    conditions.push(
      or(
        ilike(fertilizerProducts.name, pattern),
        ilike(fertilizerProducts.brand, pattern),
        ilike(fertilizerProducts.npk, pattern),
        ilike(fertilizerProducts.nutrient, pattern),
      ),
    );
  }
  if (query.crop?.trim()) {
    const cropId = query.crop.trim().toLowerCase();
    conditions.push(sql`${fertilizerProducts.crops} @> ${JSON.stringify([cropId])}::jsonb`);
  }

  const rows = conditions.length
    ? await db
        .select()
        .from(fertilizerProducts)
        .where(and(...conditions))
        .limit(limit)
    : await db.select().from(fertilizerProducts).limit(limit);

  return enrichProductsWithImages(
    rows.map((r) => {
      const withMrp = applyOfficialMrpOverlay(r);
      return {
        ...withMrp,
        type: 'fertilizer' as const,
        category: withMrp.category,
        sourceUrl: mergeManufacturerSourceUrl(withMrp.id, withMrp.sourceUrl) ?? withMrp.sourceUrl,
      };
    }),
  );
}

export async function getFertilizerProductById(id: string) {
  const [row] = await db
    .select()
    .from(fertilizerProducts)
    .where(eq(fertilizerProducts.id, id))
    .limit(1);
  if (!row) return null;
  const withMrp = applyOfficialMrpOverlay(row);
  return enrichProductImageAsync({
    ...withMrp,
    type: 'fertilizer',
    category: withMrp.category,
    sourceUrl: mergeManufacturerSourceUrl(withMrp.id, withMrp.sourceUrl) ?? withMrp.sourceUrl,
  });
}
