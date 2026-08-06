/** Map OSM / Geoapify address fields to Indian admin labels. */

export interface ParsedIndianAddress {
  village: string;
  mandal: string;
  district: string;
  state: string;
  label: string;
}

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  for (const v of values) {
    const t = v?.trim();
    if (t) return t;
  }
  return '';
}

/** Nominatim `address` object (OpenStreetMap tags). */
export function parseNominatimAddress(
  address: Record<string, string> | undefined,
  displayName?: string,
): ParsedIndianAddress {
  if (!address) {
    const label = displayName?.trim() || '';
    return { village: '', mandal: '', district: '', state: '', label };
  }

  const village = firstNonEmpty(
    address.village,
    address.hamlet,
    address.locality,
    address.neighbourhood,
    address.suburb,
    address.town,
    address.city,
  );
  const mandal = firstNonEmpty(
    address.county,
    address.municipality,
    address.city_district,
    address.state_district,
  );
  const district = firstNonEmpty(address.state_district, address.district, address.region);
  const state = firstNonEmpty(address.state);

  const parts = [village, mandal, district, state].filter(Boolean);
  const label = parts.join(', ') || displayName?.trim() || '';

  return { village, mandal, district, state, label };
}

/** Geoapify Geocoding API `properties` object. */
export function parseGeoapifyProperties(
  props: Record<string, string | number | undefined> | undefined,
): ParsedIndianAddress {
  if (!props) {
    return { village: '', mandal: '', district: '', state: '', label: '' };
  }

  const str = (key: string) => {
    const v = props[key];
    return typeof v === 'string' ? v.trim() : '';
  };

  const village = firstNonEmpty(
    str('suburb'),
    str('village'),
    str('locality'),
    str('neighbourhood'),
    str('city'),
    str('town'),
  );
  const mandal = firstNonEmpty(str('county'), str('district'), str('municipality'));
  const district = firstNonEmpty(str('state_district'), str('region'));
  const state = firstNonEmpty(str('state'));

  const label =
    str('formatted') ||
    [village, mandal, district, state].filter(Boolean).join(', ') ||
    str('name');

  return { village, mandal, district, state, label };
}
