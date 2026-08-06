/** Free geo APIs — Nominatim + public OSRM need no key; Geoapify free tier optional. */

export const GEO_USER_AGENT = 'BhuvedamApp/1.0 (farmer mobile app)';

export const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
export const OSRM_BASE = 'https://router.project-osrm.org';
export const GEOAPIFY_BASE = 'https://api.geoapify.com/v1';

/** Nominatim usage policy: max 1 request per second. */
export const NOMINATIM_MIN_INTERVAL_MS = 1100;

export const OSRM_MAX_WAYPOINTS = 80;

export function getGeoapifyApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY?.trim();
  return key || null;
}

export function isGeoapifyConfigured(): boolean {
  return getGeoapifyApiKey() != null;
}
