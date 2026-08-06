import type { Region } from 'react-native-maps';

/** ~35–45 m view — good for placing field corners on satellite/hybrid. */
export const FIELD_CLOSE_DELTA = 0.00032;

/** Village / search result — still close enough to see fields & roads. */
export const FIELD_SEARCH_DELTA = 0.00055;

/** Default when no GPS yet (Andhra interior). */
export const FIELD_DEFAULT_REGION: Region = {
  latitude: 16.5062,
  longitude: 80.648,
  latitudeDelta: FIELD_CLOSE_DELTA,
  longitudeDelta: FIELD_CLOSE_DELTA,
};

/** Nearby mandi/shops overview — closer than before but still shows multiple pins. */
export const NEARBY_OVERVIEW_DELTA = 0.045;

export const FIELD_MAP_MIN_ZOOM = 15;
export const FIELD_MAP_MAX_ZOOM = 20;

export function regionAt(latitude: number, longitude: number, delta = FIELD_CLOSE_DELTA): Region {
  return { latitude, longitude, latitudeDelta: delta, longitudeDelta: delta };
}

export function clampRegionDelta(delta: number, min = FIELD_CLOSE_DELTA, max = 0.012): number {
  return Math.min(Math.max(delta, min), max);
}
