import { getGooglePlacesApiKey, isGooglePlacesConfigured } from '@/constants/mapsConfig';
import type { NearbyPlace, NearbyPlaceFilter } from '@/types/nearbyPlace';
import { haversineKm } from '@/utils/haversine';

interface GoogleNearbyResult {
  results?: Array<{
    place_id?: string;
    name?: string;
    vicinity?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
  }>;
  status?: string;
}

function keywordForFilter(filter: NearbyPlaceFilter): string {
  if (filter === 'mandi') return 'APMC agriculture market mandi';
  if (filter === 'shop') return 'fertilizer agriculture shop IFFCO dealer';
  return 'agriculture market fertilizer';
}

function placeTypeFromFilter(filter: NearbyPlaceFilter, name: string): string {
  if (filter === 'mandi') return 'mandi';
  const lower = name.toLowerCase();
  if (lower.includes('mandi') || lower.includes('apmc') || lower.includes('market yard')) {
    return 'mandi';
  }
  return 'fertilizer_shop';
}

export async function searchNearbyGooglePlaces(
  latitude: number,
  longitude: number,
  filter: NearbyPlaceFilter = 'all',
  radiusM = 25000,
): Promise<NearbyPlace[]> {
  const apiKey = getGooglePlacesApiKey();
  if (!isGooglePlacesConfigured()) return [];

  const params = new URLSearchParams({
    location: `${latitude},${longitude}`,
    radius: String(radiusM),
    keyword: keywordForFilter(filter),
    key: apiKey,
  });

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`,
    );
    if (!res.ok) return [];

    const data = (await res.json()) as GoogleNearbyResult;
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') return [];

    return (data.results ?? [])
      .map((item): NearbyPlace | null => {
        const lat = item.geometry?.location?.lat;
        const lng = item.geometry?.location?.lng;
        if (lat == null || lng == null || !item.name) return null;

        return {
          id: item.place_id ?? `${lat}-${lng}`,
          placeType: placeTypeFromFilter(filter, item.name),
          name: item.name,
          address: item.vicinity ?? null,
          latitude: lat,
          longitude: lng,
          distanceKm: Math.round(haversineKm(latitude, longitude, lat, lng) * 10) / 10,
          source: 'google',
        };
      })
      .filter((p): p is NearbyPlace => p != null);
  } catch {
    return [];
  }
}
