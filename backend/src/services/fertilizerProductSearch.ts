import { and, eq, ilike, or, sql } from 'drizzle-orm';

import { db } from '../db';
import { fertilizerProducts } from '../db/schema/fertilizerProducts';

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

  return rows;
}

export async function getFertilizerProductById(id: string) {
  return db.query.fertilizerProducts.findFirst({
    where: eq(fertilizerProducts.id, id),
  });
}
