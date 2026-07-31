import { sql } from 'drizzle-orm';

import { db } from '../../db';
import { soils } from '../../db/schema';
import { fetchJson, geoKey, sleep } from '../utils';

const SOILGRIDS_URL = 'https://rest.isric.org/soilgrids/v2.0/properties/query';

type SoilLayer = {
  name?: string;
  depths?: { label?: string; values?: { mean?: number | null } }[];
};

type SoilResponse = {
  properties?: { layers?: SoilLayer[] };
};

const PROPERTY_MAP = {
  phh2o: 'ph',
  nitrogen: 'nitrogenGkg',
  ocd: 'organicCarbonGkg',
  clay: 'clayPercent',
  sand: 'sandPercent',
  silt: 'siltPercent',
  cec: 'cecCmol',
  bdod: 'bulkDensity',
} as const;

function scaleValue(prop: string, raw?: number | null): number | null {
  if (raw == null) return null;
  if (prop === 'phh2o') return Math.round((raw / 10) * 100) / 100;
  if (['clay', 'sand', 'silt', 'nitrogen', 'ocd', 'cec', 'bdod'].includes(prop)) {
    return Math.round((raw / 10) * 100) / 100;
  }
  return raw;
}

function parseLayers(layers: SoilLayer[] | undefined): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const layer of layers ?? []) {
    const prop = layer.name;
    if (!prop || !(prop in PROPERTY_MAP)) continue;
    const mean = layer.depths?.[0]?.values?.mean;
    const scaled = scaleValue(prop, mean);
    out[PROPERTY_MAP[prop as keyof typeof PROPERTY_MAP]] = scaled?.toString() ?? null;
  }
  return out;
}

/** Fetch one property at a time — more reliable when bulk query fails */
async function fetchSingleProperty(lat: number, lon: number, property: string): Promise<SoilLayer | null> {
  const url = `${SOILGRIDS_URL}?lat=${lat}&lon=${lon}&property=${property}&depth=0-5cm&value=mean`;
  try {
    const json = await fetchJson<SoilResponse>(url);
    return json.properties?.layers?.[0] ?? null;
  } catch {
    return null;
  }
}

/** Fetch & cache soil data for a coordinate from SoilGrids */
export async function syncSoilAtPoint(lat: number, lon: number): Promise<boolean> {
  const key = geoKey(lat, lon);
  const layers: SoilLayer[] = [];

  // SoilGrids fair use: max 5 calls/min — fetch key properties sequentially
  for (const prop of ['phh2o', 'clay', 'sand', 'nitrogen', 'ocd'] as const) {
    const layer = await fetchSingleProperty(lat, lon, prop);
    if (layer) layers.push({ ...layer, name: prop });
    await sleep(13000);
  }

  const parsed = parseLayers(layers);
  const hasData = Object.values(parsed).some((v) => v != null);
  if (!hasData) {
    console.warn(`SoilGrids: no data for ${lat}, ${lon} (API may be down or urban area)`);
    return false;
  }

  await db
    .insert(soils)
    .values({
      geoKey: key,
      latitude: String(lat),
      longitude: String(lon),
      depthCm: '0-5cm',
      ph: parsed.ph ?? null,
      nitrogenGkg: parsed.nitrogenGkg ?? null,
      organicCarbonGkg: parsed.organicCarbonGkg ?? null,
      clayPercent: parsed.clayPercent ?? null,
      sandPercent: parsed.sandPercent ?? null,
      siltPercent: parsed.siltPercent ?? null,
      cecCmol: parsed.cecCmol ?? null,
      bulkDensity: parsed.bulkDensity ?? null,
      source: 'soilgrids',
      rawData: { layers },
      fetchedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [soils.geoKey, soils.depthCm],
      set: {
        ph: sql`excluded.ph`,
        nitrogenGkg: sql`excluded.nitrogen_gkg`,
        organicCarbonGkg: sql`excluded.organic_carbon_gkg`,
        clayPercent: sql`excluded.clay_percent`,
        sandPercent: sql`excluded.sand_percent`,
        fetchedAt: new Date(),
      },
    });

  return true;
}

/** Sync soil for key agricultural regions (1 point per run to respect rate limits) */
export async function syncGlobalSoilGrid(options?: { maxPoints?: number }): Promise<{
  fetched: number;
  upserted: number;
}> {
  const points: [number, number, string][] = [
    [17.38, 78.48, 'Hyderabad'],
    [28.61, 77.21, 'Delhi'],
    [19.08, 72.88, 'Mumbai'],
    [13.08, 80.27, 'Chennai'],
    [22.57, 88.36, 'Kolkata'],
    [15.87, 74.5, 'Belgaum'],
  ];

  const maxPoints = options?.maxPoints ?? 1;
  let upserted = 0;

  for (const [lat, lon, label] of points.slice(0, maxPoints)) {
    console.log(`SoilGrids: syncing ${label} (${lat}, ${lon})…`);
    if (await syncSoilAtPoint(lat, lon)) upserted++;
  }

  return { fetched: Math.min(maxPoints, points.length), upserted };
}
