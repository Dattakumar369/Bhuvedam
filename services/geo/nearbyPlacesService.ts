import { API_CONFIG } from '@/constants/app';
import { isGooglePlacesConfigured } from '@/constants/mapsConfig';
import { searchNearbyGooglePlaces } from '@/services/geo/googlePlacesService';
import { findLocalCuratedPlaces } from '@/services/geo/localAgPlacesService';
import type { NearbyPlace, NearbyPlaceFilter } from '@/types/nearbyPlace';

const SEARCH_RADIUS_KM = 120;
const FETCH_TIMEOUT_MS = 8000;

interface DbNearbyResponse {
  data?: NearbyPlace[];
}

function placeKey(p: NearbyPlace): string {
  return `${p.name.toLowerCase()}|${p.latitude.toFixed(4)}|${p.longitude.toFixed(4)}`;
}

function mergePlaces(existing: NearbyPlace[], incoming: NearbyPlace[]): NearbyPlace[] {
  const seen = new Set(existing.map(placeKey));
  const merged = [...existing];
  for (const place of incoming) {
    const key = placeKey(place);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(place);
  }
  return merged;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function fetchFromBackend(
  latitude: number,
  longitude: number,
  filter: NearbyPlaceFilter,
): Promise<NearbyPlace[]> {
  if (!API_CONFIG.useBackendData) return [];

  try {
    const params = new URLSearchParams({
      lat: String(latitude),
      lng: String(longitude),
      type: filter,
      radiusKm: String(SEARCH_RADIUS_KM),
      limit: '30',
    });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(`${API_CONFIG.baseUrl}/api/places/nearby?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const json = (await res.json()) as DbNearbyResponse;
    return json.data ?? [];
  } catch {
    return [];
  }
}

/** Google Places when key configured; backend DB; always includes local curated fallback. */
export async function fetchNearbyPlaces(
  latitude: number,
  longitude: number,
  filter: NearbyPlaceFilter = 'all',
): Promise<NearbyPlace[]> {
  // Always start with offline curated pins so hung network never blanks the screen.
  let results = findLocalCuratedPlaces(latitude, longitude, filter, SEARCH_RADIUS_KM, 30);

  const remoteJobs: Promise<NearbyPlace[]>[] = [];

  if (isGooglePlacesConfigured()) {
    remoteJobs.push(
      withTimeout(
        searchNearbyGooglePlaces(latitude, longitude, filter, SEARCH_RADIUS_KM * 1000).catch(
          () => [] as NearbyPlace[],
        ),
        FETCH_TIMEOUT_MS,
        [],
      ),
    );
  }

  remoteJobs.push(fetchFromBackend(latitude, longitude, filter));

  const remoteBatches = await Promise.all(remoteJobs);
  for (const batch of remoteBatches) {
    results = mergePlaces(results, batch);
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 30);
}
