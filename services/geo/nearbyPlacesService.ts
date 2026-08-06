import { API_CONFIG } from '@/constants/app';
import { isGooglePlacesConfigured } from '@/constants/mapsConfig';
import { searchNearbyGooglePlaces } from '@/services/geo/googlePlacesService';
import type { NearbyPlace, NearbyPlaceFilter } from '@/types/nearbyPlace';

interface DbNearbyResponse {
  data?: NearbyPlace[];
}

/** Google Places when key configured; otherwise Neon curated mandi/shops from backend. */
export async function fetchNearbyPlaces(
  latitude: number,
  longitude: number,
  filter: NearbyPlaceFilter = 'all',
): Promise<NearbyPlace[]> {
  if (isGooglePlacesConfigured()) {
    const google = await searchNearbyGooglePlaces(latitude, longitude, filter);
    if (google.length) return google;
  }

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
