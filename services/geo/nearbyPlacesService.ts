import { API_CONFIG } from '@/constants/app';
import { isGooglePlacesConfigured } from '@/constants/mapsConfig';
import { searchNearbyGooglePlaces } from '@/services/geo/googlePlacesService';
import { findLocalCuratedPlaces } from '@/services/geo/localAgPlacesService';
import type { NearbyPlace, NearbyPlaceFilter } from '@/types/nearbyPlace';

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
      radiusKm: '50',
      limit: '20',
    });
    const res = await fetch(`${API_CONFIG.baseUrl}/api/places/nearby?${params.toString()}`);
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
  let results: NearbyPlace[] = [];

  if (isGooglePlacesConfigured()) {
    try {
      const google = await searchNearbyGooglePlaces(latitude, longitude, filter);
      results = mergePlaces(results, google);
    } catch {
      // Google REST may fail on device — fall through to DB/local
    }
  }

  const backend = await fetchFromBackend(latitude, longitude, filter);
  results = mergePlaces(results, backend);

  const local = findLocalCuratedPlaces(latitude, longitude, filter);
  results = mergePlaces(results, local);

  return results.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 20);
}
