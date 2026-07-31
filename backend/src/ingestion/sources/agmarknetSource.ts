import { sql } from 'drizzle-orm';

import { getDataGovApiKey } from '../../config/env';
import { db } from '../../db';
import { cropVarieties, crops, mandiPrices } from '../../db/schema';
import { fetchJson, parseAgmarknetDate, slugId, sleep } from '../utils';

const DATA_GOV_RESOURCE = '35985678-0d79-46b4-9ed6-6f13308a1d24';
const PAGE_SIZE = 100;
const MAX_PAGES = 5;

type DataGovRow = Record<string, string | undefined>;
type DataGovResponse = { records?: DataGovRow[]; total?: number };

function field(row: DataGovRow, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k] ?? row[k.toLowerCase()] ?? row[k.toUpperCase()];
    if (v) return v;
  }
  return undefined;
}

function parsePrice(v?: string): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

async function resolveCropId(commodity: string): Promise<string> {
  const name = commodity.trim();
  const id = slugId(name.split('(')[0] ?? name, 'ag');
  await db
    .insert(crops)
    .values({
      id,
      name: name.split('(')[0]?.trim() || name,
      source: 'agmarknet',
      externalId: name,
      regionScope: 'India',
      lastSyncedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: crops.id,
      set: { lastSyncedAt: new Date() },
    });
  return id;
}

export async function syncAgmarknetMandi(options?: {
  apiKey?: string;
  state?: string;
}): Promise<{ fetched: number; upserted: number }> {
  const apiKey = options?.apiKey ?? getDataGovApiKey();
  if (!apiKey) {
    throw new Error(
      'DATA_GOV_API_KEY missing — add to backend/.env or EXPO_PUBLIC_DATA_GOV_API_KEY in root .env',
    );
  }

  const state = options?.state ?? 'Andhra Pradesh';
  let fetched = 0;
  let upserted = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * PAGE_SIZE;
    const url =
      `https://api.data.gov.in/resource/${DATA_GOV_RESOURCE}` +
      `?api-key=${apiKey}&format=json&limit=${PAGE_SIZE}&offset=${offset}` +
      `&filters[state]=${encodeURIComponent(state)}`;

    const json = await fetchJson<DataGovResponse>(url);
    const records = json.records ?? [];
    if (!records.length) break;
    fetched += records.length;

    for (const row of records) {
      const modal = parsePrice(field(row, 'modal_price', 'Modal_Price'));
      if (!modal) continue;

      const commodity = field(row, 'commodity', 'Commodity') ?? 'Unknown';
      const varietyName = field(row, 'variety', 'Variety');
      const cropId = await resolveCropId(commodity);
      const varietyId = varietyName ? slugId(varietyName, 'ag') : undefined;

      if (varietyName && varietyId) {
        await db
          .insert(cropVarieties)
          .values({
            id: varietyId,
            cropId,
            name: varietyName,
            agmarknetNames: [varietyName],
            source: 'agmarknet',
            externalId: varietyName,
            country: 'India',
            isCurated: false,
            lastSyncedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: cropVarieties.id,
            set: {
              name: sql`excluded.name`,
              lastSyncedAt: new Date(),
            },
          });
      }

      const market = field(row, 'market', 'Market') ?? 'APMC';
      const district = field(row, 'district', 'District') ?? '';
      const priceDate = parseAgmarknetDate(field(row, 'arrival_date', 'Arrival_Date'));

      await db
        .insert(mandiPrices)
        .values({
          cropId,
          varietyId,
          varietyName: varietyName ?? undefined,
          commodity,
          market,
          district,
          state: field(row, 'state', 'State') ?? state,
          priceDate,
          minPrice: String(parsePrice(field(row, 'min_price', 'Min_Price')) || modal * 0.96),
          maxPrice: String(parsePrice(field(row, 'max_price', 'Max_Price')) || modal * 1.04),
          modalPrice: String(modal),
          unit: field(row, 'unit', 'Unit') ?? 'Quintal',
          isLive: true,
          source: 'agmarknet',
          fetchedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [
            mandiPrices.cropId,
            mandiPrices.varietyName,
            mandiPrices.market,
            mandiPrices.district,
            mandiPrices.state,
            mandiPrices.priceDate,
          ],
          set: {
            modalPrice: sql`excluded.modal_price`,
            minPrice: sql`excluded.min_price`,
            maxPrice: sql`excluded.max_price`,
            fetchedAt: new Date(),
          },
        });

      upserted++;
    }

    await sleep(300);
    if (records.length < PAGE_SIZE) break;
  }

  return { fetched, upserted };
}
