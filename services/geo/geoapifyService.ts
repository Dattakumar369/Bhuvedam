import { GEOAPIFY_BASE, getGeoapifyApiKey } from '@/services/geo/geoConfig';
import { parseGeoapifyProperties } from '@/services/geo/parseIndianAddress';
import type { Coordinates } from '@/types/location';
import type { PlaceSearchResult } from '@/types/location';

interface GeoapifyFeature {
  properties?: Record<string, string | number | undefined>;
  geometry?: { coordinates?: [number, number] };
}

interface GeoapifyAutocompleteResponse {
  features?: GeoapifyFeature[];
}

export async function searchPlacesGeoapify(
  query: string,
  options?: { bias?: Coordinates; limit?: number; countryCode?: string },
): Promise<PlaceSearchResult[]> {
  const apiKey = getGeoapifyApiKey();
  const text = query.trim();
  if (!apiKey || text.length < 2) return [];

  const params = new URLSearchParams({
    text,
    apiKey,
    limit: String(options?.limit ?? 6),
    lang: 'en',
  });

  const country = options?.countryCode ?? 'in';
  params.set('filter', `countrycode:${country}`);

  if (options?.bias) {
    params.set('bias', `proximity:${options.bias.longitude},${options.bias.latitude}`);
  }

  const url = `${GEOAPIFY_BASE}/geocode/autocomplete?${params.toString()}`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];

    const data = (await res.json()) as GeoapifyAutocompleteResponse;
    const features = data.features ?? [];

    return features
      .map((feature): PlaceSearchResult | null => {
        const props = feature.properties;
        const parsed = parseGeoapifyProperties(props);
        const coords = feature.geometry?.coordinates;
        if (!coords || coords.length < 2) return null;

        const [lon, lat] = coords;
        if (!parsed.label && !parsed.village) return null;

        return {
          label: parsed.label,
          village: parsed.village || undefined,
          mandal: parsed.mandal || undefined,
          district: parsed.district || undefined,
          state: parsed.state || undefined,
          latitude: lat,
          longitude: lon,
        };
      })
      .filter((r): r is PlaceSearchResult => r != null);
  } catch {
    return [];
  }
}
