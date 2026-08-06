import type { Region } from 'react-native-maps';

/** ~0.8 m view — extreme close fallback when camera API unavailable. */
export const FIELD_ULTRA_DELTA = 0.000007;

/** ~3–4 m default field view. */
export const FIELD_CLOSE_DELTA = 0.000032;

/** Village search landing. */
export const FIELD_SEARCH_DELTA = 0.0001;

/** Minimum region delta (extreme zoom floor). */
export const FIELD_DELTA_MIN = 0.000004;

export const FIELD_DELTA_MAX = 0.012;

/** Default when no GPS yet (Andhra interior). */
export const FIELD_DEFAULT_REGION: Region = {
  latitude: 16.5062,
  longitude: 80.648,
  latitudeDelta: FIELD_CLOSE_DELTA,
  longitudeDelta: FIELD_CLOSE_DELTA,
};

/** Nearby mandi/shops overview. */
export const NEARBY_OVERVIEW_DELTA = 0.035;

/** Google camera zoom — 21 = last native tile; 22–24 = extra close (digital zoom). */
export const FIELD_MAP_MIN_ZOOM = 14;
export const FIELD_MAP_MAX_ZOOM = 24;
export const FIELD_DEFAULT_ZOOM = 22;
export const FIELD_ULTRA_ZOOM = 24;
export const FIELD_NATIVE_TILE_ZOOM = 21;

export const NEARBY_MAP_MAX_ZOOM = 24;
export const NEARBY_DEFAULT_ZOOM = 20;
export const NEARBY_ULTRA_ZOOM = 24;

export function regionAt(latitude: number, longitude: number, delta = FIELD_CLOSE_DELTA): Region {
  return { latitude, longitude, latitudeDelta: delta, longitudeDelta: delta };
}

export function clampRegionDelta(
  delta: number,
  min = FIELD_DELTA_MIN,
  max = FIELD_DELTA_MAX,
): number {
  return Math.min(Math.max(delta, min), max);
}

/** Approximate Google zoom from latitudeDelta (for region sync). */
export function zoomFromLatitudeDelta(latitudeDelta: number): number {
  return Math.round(Math.log2(360 / Math.max(latitudeDelta, FIELD_DELTA_MIN)));
}

/** Region delta fallback for a target camera zoom level. */
export function deltaFromZoom(zoom: number): number {
  const clamped = Math.min(Math.max(zoom, FIELD_MAP_MIN_ZOOM), FIELD_MAP_MAX_ZOOM);
  return clampRegionDelta(360 / 2 ** clamped);
}
