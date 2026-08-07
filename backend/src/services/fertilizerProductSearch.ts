import { and, eq, ilike, or, sql } from 'drizzle-orm';

import { db } from '../db';
import { fertilizerProducts } from '../db/schema/fertilizerProducts';
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
    rows.map((r) => ({
      ...r,
      type: 'fertilizer',
      category: r.category,
      sourceUrl: mergeManufacturerSourceUrl(r.id, r.sourceUrl) ?? r.sourceUrl,
    })),
  );
}

export async function getFertilizerProductById(id: string) {
  const row = await db.query.fertilizerProducts.findFirst({
    where: eq(fertilizerProducts.id, id),
  });
  if (!row) return null;
  return enrichProductImageAsync({
    ...row,
    type: 'fertilizer',
    category: row.category,
    sourceUrl: mergeManufacturerSourceUrl(row.id, row.sourceUrl) ?? row.sourceUrl,
  });
}
