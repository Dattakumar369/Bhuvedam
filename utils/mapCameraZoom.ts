import type { RefObject } from 'react';
import type MapView from 'react-native-maps';
import type { Region } from 'react-native-maps';

import {
  FIELD_DEFAULT_ZOOM,
  FIELD_DELTA_MIN,
  FIELD_MAP_MAX_ZOOM,
  FIELD_MAP_MIN_ZOOM,
  FIELD_ULTRA_DELTA,
  FIELD_ULTRA_ZOOM,
  clampRegionDelta,
  regionAt,
} from '@/constants/mapViewConfig';

type ZoomStep = 'in' | 'out' | 'ultra';

/** Step zoom using Google camera levels — keeps native tile quality at max zoom 21. */
export async function stepMapZoom(
  mapRef: RefObject<MapView | null>,
  step: ZoomStep,
  regionFallback?: Region,
): Promise<void> {
  const map = mapRef.current;
  if (!map) return;

  try {
    const camera = await map.getCamera();
    const current = camera.zoom ?? FIELD_DEFAULT_ZOOM;
    const next =
      step === 'ultra'
        ? FIELD_ULTRA_ZOOM
        : step === 'in'
          ? Math.min(current + 1, FIELD_MAP_MAX_ZOOM)
          : Math.max(current - 1, FIELD_MAP_MIN_ZOOM);

    map.animateCamera({ ...camera, zoom: next, pitch: 0 }, { duration: 280 });
    return;
  } catch {
    // Region fallback when getCamera unavailable
  }

  if (!regionFallback) return;
  const factor = step === 'ultra' ? 0.12 : step === 'in' ? 0.42 : 1.85;
  const delta = clampRegionDelta(regionFallback.latitudeDelta * factor, FIELD_DELTA_MIN);
  map.animateToRegion(
    {
      latitude: regionFallback.latitude,
      longitude: regionFallback.longitude,
      latitudeDelta: delta,
      longitudeDelta: delta,
    },
    280,
  );
}

/** Center map at high-quality native zoom (not blurry stretched region). */
export function centerMapAtZoom(
  mapRef: RefObject<MapView | null>,
  latitude: number,
  longitude: number,
  zoom = FIELD_DEFAULT_ZOOM,
): void {
  const map = mapRef.current;
  if (!map) return;

  try {
    map.animateCamera(
      {
        center: { latitude, longitude },
        zoom,
        pitch: 0,
        heading: 0,
      },
      { duration: 450 },
    );
    return;
  } catch {
    const delta = zoom >= FIELD_ULTRA_ZOOM - 0.5 ? FIELD_ULTRA_DELTA : FIELD_ULTRA_DELTA * 2.5;
    map.animateToRegion(regionAt(latitude, longitude, delta), 450);
  }
}
