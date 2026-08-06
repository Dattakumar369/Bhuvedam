import { and, eq } from 'drizzle-orm';

import { db } from '../db';
import { agPlaces, type AgPlaceRow } from '../db/schema/agPlaces';
import { CURATED_AG_PLACES } from '../ingestion/data/curatedAgPlaces';

export type NearbyPlaceType = 'mandi' | 'shop' | 'all';

export interface NearbyPlaceResult {
  id: string;
  placeType: string;
  name: string;
  district: string;
  state: string;
  address: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  distanceKm: number;
  source: 'database';
}

function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Haversine distance in km. */
export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function matchesType(placeType: string, filter: NearbyPlaceType): boolean {
  if (filter === 'all') return true;
  if (filter === 'mandi') return placeType === 'mandi';
  return placeType === 'fertilizer_shop' || placeType === 'seed_shop' || placeType === 'dealer';
}

function rowToNearby(row: AgPlaceRow, fromLat: number, fromLon: number): NearbyPlaceResult {
  const lat = toNumber(row.latitude);
  const lon = toNumber(row.longitude);
  return {
    id: row.id,
    placeType: row.placeType,
    name: row.name,
    district: row.district,
    state: row.state,
    address: row.address,
    latitude: lat,
    longitude: lon,
    phone: row.phone,
    distanceKm: Math.round(distanceKm(fromLat, fromLon, lat, lon) * 10) / 10,
    source: 'database',
  };
}

export async function seedCuratedAgPlaces(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  for (const place of CURATED_AG_PLACES) {
    const existing = await db
      .select({ id: agPlaces.id })
      .from(agPlaces)
      .where(and(eq(agPlaces.name, place.name), eq(agPlaces.district, place.district)))
      .limit(1);

    if (existing.length) {
      skipped++;
      continue;
    }

    await db.insert(agPlaces).values({
      placeType: place.placeType,
      name: place.name,
      district: place.district,
      state: place.state,
      address: place.address ?? null,
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      phone: place.phone ?? null,
      source: 'curated',
    });
    inserted++;
  }

  return { inserted, skipped };
}

export async function findNearbyAgPlacesFromDb(
  latitude: number,
  longitude: number,
  type: NearbyPlaceType = 'all',
  radiusKm = 50,
  limit = 20,
): Promise<NearbyPlaceResult[]> {
  const rows = await db.select().from(agPlaces).where(eq(agPlaces.active, true));

  return rows
    .filter((row) => matchesType(row.placeType, type))
    .map((row) => rowToNearby(row, latitude, longitude))
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
