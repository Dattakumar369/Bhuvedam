import type { Region } from 'react-native-maps';

/** ~2–3 m view — ultra close for exact corner placement. */
export const FIELD_ULTRA_DELTA = 0.000022;

/** ~6–8 m default field view. */
export const FIELD_CLOSE_DELTA = 0.00006;

/** Village search landing — still fairly close. */
export const FIELD_SEARCH_DELTA = 0.00014;

/** Minimum region delta (ultra zoom floor). */
export const FIELD_DELTA_MIN = 0.000018;

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

/** Google Maps native zoom — 21 = max tile detail (no quality loss). */
export const FIELD_MAP_MIN_ZOOM = 14;
export const FIELD_MAP_MAX_ZOOM = 21;
export const FIELD_DEFAULT_ZOOM = 20;
export const FIELD_ULTRA_ZOOM = 21;

export const NEARBY_MAP_MAX_ZOOM = 21;
export const NEARBY_DEFAULT_ZOOM = 18;

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
