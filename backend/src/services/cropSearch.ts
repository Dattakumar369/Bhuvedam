import { eq, ilike, or, sql } from 'drizzle-orm';

import { db } from '../db';
import { crops } from '../db/schema';

/** English + Telugu + romanized aliases for farmer search */
export function buildCropSearchAliases(
  id: string,
  name: string,
  nameTe?: string | null,
  localizedNames?: Record<string, string> | null,
): string[] {
  const aliases = new Set<string>();
  const add = (v?: string | null) => {
    const t = v?.trim();
    if (t && t.length > 1) aliases.add(t.toLowerCase());
  };

  add(name);
  add(nameTe);
  add(id);
  for (const v of Object.values(localizedNames ?? {})) add(v);

  const extra: Record<string, string[]> = {
    rice: ['vari', 'vri', 'paddy', 'dhan', 'bhatt', 'వరి'],
    wheat: ['godhuma', 'godum', 'గోధుమ'],
    cotton: ['patti', 'patt', 'పత్తి'],
    maize: ['mokka jonna', 'corn', 'మొక్కజొన్న'],
    chilli: ['mirap', 'mirchi', 'మిరప'],
    groundnut: ['verusenaga', 'peanut', 'వేరుశనగ'],
    tomato: ['tamata', 'tamato', 'టమాట'],
    onion: ['ulli', 'ullipaya', 'ఉల్లి'],
    redgram: ['kandi', 'tur', 'arhar', 'కంది'],
    greengram: ['pesara', 'moong', 'పెసర'],
    blackgram: ['minumulu', 'urad', 'మినుమulos'],
    chickpea: ['senaga', 'chan', 'శనగ'],
    sugarcane: ['cheraku', 'chekka', 'చెరకు'],
    turmeric: ['pasupu', 'haldi', 'పసుపు'],
  };

  for (const a of extra[id] ?? []) add(a);

  return [...aliases];
}

export async function searchCropsDb(query?: string, limit = 500) {
  const q = query?.trim();
  if (!q) {
    return db.select().from(crops).orderBy(crops.name).limit(limit);
  }

  const pattern = `%${q}%`;
  const aliasMatch = sql`EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(COALESCE(${crops.searchAliases}, '[]'::jsonb)) AS alias
    WHERE alias ILIKE ${pattern}
  )`;
  const localizedMatch = sql`EXISTS (
    SELECT 1 FROM jsonb_each_text(COALESCE(${crops.localizedNames}, '{}'::jsonb)) AS loc(key, val)
    WHERE val ILIKE ${pattern}
  )`;

  return db
    .select()
    .from(crops)
    .where(
      or(
        ilike(crops.name, pattern),
        ilike(crops.nameTe, pattern),
        ilike(crops.id, pattern),
        ilike(crops.category, pattern),
        ilike(crops.description, pattern),
        aliasMatch,
        localizedMatch,
      ),
    )
    .orderBy(crops.name)
    .limit(limit);
}

export async function getCropByIdDb(cropId: string) {
  const [row] = await db.select().from(crops).where(eq(crops.id, cropId)).limit(1);
  return row ?? null;
}

export async function countCropsDb(): Promise<number> {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(crops);
  return row?.count ?? 0;
}
