import { GEO_USER_AGENT, NOMINATIM_BASE } from '@/services/geo/geoConfig';
import { parseNominatimAddress } from '@/services/geo/parseIndianAddress';
import { waitForNominatimSlot } from '@/services/geo/geoRateLimit';
import type { Coordinates, PlaceSearchResult, ReverseGeocodeResult } from '@/types/location';

interface NominatimReverseResponse {
  display_name?: string;
  address?: Record<string, string>;
  lat?: string;
  lon?: string;
}

interface NominatimSearchResult {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: Record<string, string>;
}

export async function searchPlacesNominatim(
  query: string,
  options?: { limit?: number; countryCode?: string },
): Promise<PlaceSearchResult[]> {
  const text = query.trim();
  if (text.length < 2) return [];

  await waitForNominatimSlot();

  const params = new URLSearchParams({
    q: text,
    format: 'json',
    addressdetails: '1',
    limit: String(options?.limit ?? 6),
  });

  const country = options?.countryCode ?? 'in';
  params.set('countrycodes', country);

  const url = `${NOMINATIM_BASE}/search?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': GEO_USER_AGENT,
      },
    });
    if (!res.ok) return [];

    const rows = (await res.json()) as NominatimSearchResult[];

    return rows
      .map((row): PlaceSearchResult | null => {
        const lat = row.lat != null ? Number(row.lat) : NaN;
        const lon = row.lon != null ? Number(row.lon) : NaN;
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

        const parsed = parseNominatimAddress(row.address, row.display_name);
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

export async function reverseGeocodeNominatim(
  coords: Coordinates,
): Promise<ReverseGeocodeResult | null> {
  await waitForNominatimSlot();

  const params = new URLSearchParams({
    format: 'json',
    lat: String(coords.latitude),
    lon: String(coords.longitude),
    zoom: '16',
    addressdetails: '1',
  });

  const url = `${NOMINATIM_BASE}/reverse?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': GEO_USER_AGENT,
      },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as NominatimReverseResponse;
    const parsed = parseNominatimAddress(data.address, data.display_name);

    if (!parsed.label && !parsed.village) return null;

    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      label: parsed.label,
      city: parsed.village || parsed.mandal || parsed.label,
      village: parsed.village || undefined,
      mandal: parsed.mandal || undefined,
      district: parsed.district || undefined,
      state: parsed.state || undefined,
      country: data.address?.country,
      source: 'nominatim',
    };
  } catch {
    return null;
  }
}
