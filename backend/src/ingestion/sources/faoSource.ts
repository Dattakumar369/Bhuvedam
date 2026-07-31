import { sql } from 'drizzle-orm';

import { db } from '../../db';
import { crops } from '../../db/schema';
import { buildCropSearchAliases } from '../../services/cropSearch';
import { fetchJson, sleep, slugId } from '../utils';

type FaoItemRow = {
  'Item Code'?: string;
  'Item Code (FAO)'?: string;
  Item?: string;
  'Item Description'?: string;
  Domain?: string;
};

type FaoResponse = { data?: FaoItemRow[] };

const FAO_BASES = [
  'https://faostatservices.fao.org/api/v1',
  'https://fenixservices.fao.org/faostat/api/v1',
];

async function fetchFaoItems(datasource: string): Promise<FaoItemRow[]> {
  let lastError: Error | null = null;

  for (const base of FAO_BASES) {
    const url = `${base}/en/definitions/types/item?datasource=${datasource}`;
    try {
      const json = await fetchJson<FaoResponse>(url);
      if (json.data?.length) return json.data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      await sleep(1500);
    }
  }

  throw lastError ?? new Error(`FAO ${datasource} returned no data`);
}

/** GBIF — fallback when FAO is down; search known crop species */
async function fetchGbifCropSpecies(limit: number): Promise<FaoItemRow[]> {
  const terms = [
    'Oryza sativa',
    'Triticum aestivum',
    'Zea mays',
    'Gossypium',
    'Solanum lycopersicum',
    'Glycine max',
    'Saccharum',
    'Cicer arietinum',
    'Arachis hypogaea',
    'Brassica',
    'Helianthus annuus',
    'Hordeum vulgare',
    'Sorghum bicolor',
    'Pennisetum glaucum',
    'Cocos nucifera',
  ];

  const rows: FaoItemRow[] = [];
  const seen = new Set<string>();

  for (const term of terms) {
    if (rows.length >= limit) break;
    const url = `https://api.gbif.org/v1/species/search?q=${encodeURIComponent(term)}&rank=SPECIES&limit=20`;
    try {
      const json = await fetchJson<{
        results?: { key?: number; scientificName?: string; canonicalName?: string }[];
      }>(url);
      for (const r of json.results ?? []) {
        const name = r.canonicalName ?? r.scientificName;
        if (!name || seen.has(name)) continue;
        seen.add(name);
        rows.push({
          'Item Code': String(r.key ?? name),
          Item: name,
          Domain: 'crop',
          'Item Description': `GBIF — ${term}`,
        });
      }
      await sleep(200);
    } catch {
      /* skip term */
    }
  }

  return rows;
}

async function resolveCropRows(limit: number): Promise<{ rows: FaoItemRow[]; source: string }> {
  try {
    const rows = await fetchFaoItems('QCL');
    return { rows, source: 'fao' };
  } catch (faoErr) {
    console.warn('FAO unavailable, falling back to GBIF Plantae catalog:', (faoErr as Error).message);
    const rows = await fetchGbifCropSpecies(limit);
    return { rows, source: 'gbif' };
  }
}

/** Sync global crop catalog from FAO FAOSTAT QCL (GBIF fallback) */
export async function syncFaoCrops(limit = 500): Promise<{ fetched: number; upserted: number }> {
  const { rows, source } = await resolveCropRows(limit);
  let upserted = 0;

  for (const row of rows.slice(0, limit)) {
    const externalId = String(row['Item Code'] ?? row['Item Code (FAO)'] ?? '');
    const name = row.Item?.trim();
    if (!externalId || !name) continue;

    const description = row['Item Description']?.trim() ?? '';
    const id = slugId(name, source === 'gbif' ? 'gbif' : 'fao');
    const aliases = buildCropSearchAliases(id, name, null);

    await db
      .insert(crops)
      .values({
        id,
        name,
        description: description || undefined,
        category: row.Domain ?? 'crop',
        searchAliases: aliases,
        metadata: { faoDescription: description, domain: row.Domain },
        source,
        externalId,
        regionScope: 'global',
        lastSyncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: crops.id,
        set: {
          name: sql`excluded.name`,
          description: sql`COALESCE(excluded.description, ${crops.description})`,
          category: sql`COALESCE(excluded.category, ${crops.category})`,
          metadata: sql`COALESCE(${crops.metadata}, '{}'::jsonb) || excluded.metadata`,
          externalId: sql`excluded.external_id`,
          source: sql`excluded.source`,
          lastSyncedAt: new Date(),
        },
        setWhere: sql`${crops.source} != 'bhuvedam'`,
      });
    upserted++;
    if (upserted % 50 === 0) await sleep(100);
  }

  return { fetched: rows.length, upserted };
}

/** Sync fertilizer/nutrient items from FAO RFN domain */
export async function syncFaoFertilizers(limit = 200): Promise<{ fetched: number; upserted: number }> {
  let rows: FaoItemRow[] = [];
  try {
    rows = await fetchFaoItems('RFN');
  } catch {
    console.warn('FAO RFN unavailable — skipping fertilizer sync this run');
    return { fetched: 0, upserted: 0 };
  }

  const { agrochemicals } = await import('../../db/schema');
  let upserted = 0;

  for (const row of rows.slice(0, limit)) {
    const name = row.Item?.trim();
    const externalId = String(row['Item Code'] ?? '');
    if (!name || !externalId) continue;

    await db
      .insert(agrochemicals)
      .values({
        type: 'fertilizer',
        name,
        source: 'fao',
        externalId,
        country: 'global',
        metadata: { description: row['Item Description'] ?? '' },
        lastSyncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [agrochemicals.source, agrochemicals.externalId],
        set: { name: sql`excluded.name`, lastSyncedAt: new Date() },
      });

    upserted++;
  }

  return { fetched: rows.length, upserted };
}
