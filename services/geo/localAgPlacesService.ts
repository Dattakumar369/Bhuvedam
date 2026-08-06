import { CURATED_AG_PLACES } from '@/constants/curatedAgPlaces';
import type { NearbyPlace, NearbyPlaceFilter } from '@/types/nearbyPlace';
import { haversineKm } from '@/utils/haversine';

function matchesFilter(placeType: string, filter: NearbyPlaceFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'mandi') return placeType === 'mandi';
  return placeType === 'fertilizer_shop' || placeType === 'seed_shop' || placeType === 'dealer';
}

/** Built-in AP/TG mandi & shop list — works offline without backend or Google key. */
export function findLocalCuratedPlaces(
  latitude: number,
  longitude: number,
  filter: NearbyPlaceFilter = 'all',
  radiusKm = 50,
  limit = 20,
): NearbyPlace[] {
  return CURATED_AG_PLACES.filter((p) => matchesFilter(p.placeType, filter))
    .map((p) => {
      const distanceKm = Math.round(haversineKm(latitude, longitude, p.latitude, p.longitude) * 10) / 10;
      return {
        id: `local-${p.name}-${p.latitude}`,
        placeType: p.placeType,
        name: p.name,
        district: p.district,
        state: p.state,
        address: p.address ?? null,
        latitude: p.latitude,
        longitude: p.longitude,
        phone: p.phone ?? null,
        distanceKm,
        source: 'database' as const,
      };
    })
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
