import { isGeoapifyConfigured } from '@/services/geo/geoConfig';
import { searchPlacesNominatim } from '@/services/geo/nominatimService';
import { searchPlacesGeoapify } from '@/services/geo/geoapifyService';
import type { Coordinates, PlaceSearchResult } from '@/types/location';

export async function searchPlaces(
  query: string,
  options?: { bias?: Coordinates; limit?: number; countryCode?: string },
): Promise<PlaceSearchResult[]> {
  if (isGeoapifyConfigured()) {
    const geoapify = await searchPlacesGeoapify(query, options);
    if (geoapify.length) return geoapify;
  }
  return searchPlacesNominatim(query, options);
}
