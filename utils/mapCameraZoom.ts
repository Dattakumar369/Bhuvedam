import type { RefObject } from 'react';
import type MapView from 'react-native-maps';
import type { Region } from 'react-native-maps';

import {
  FIELD_DEFAULT_ZOOM,
  FIELD_MAP_MAX_ZOOM,
  FIELD_MAP_MIN_ZOOM,
  FIELD_ULTRA_ZOOM,
  clampRegionDelta,
  deltaFromZoom,
  regionAt,
} from '@/constants/mapViewConfig';

type ZoomStep = 'in' | 'out' | 'ultra';

/** Step zoom via Google camera — up to level 24 (+3 beyond native tile max 21). */
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

    map.animateCamera({ ...camera, zoom: next, pitch: 0, altitude: 0 }, { duration: 260 });
    return;
  } catch {
    // Region fallback when getCamera unavailable
  }

  if (!regionFallback) return;
  const targetZoom =
    step === 'ultra' ? FIELD_ULTRA_ZOOM : step === 'in' ? FIELD_DEFAULT_ZOOM + 2 : FIELD_MAP_MIN_ZOOM + 2;
  const delta =
    step === 'out'
      ? clampRegionDelta(regionFallback.latitudeDelta * 1.9)
      : deltaFromZoom(targetZoom);

  map.animateToRegion(
    {
      latitude: regionFallback.latitude,
      longitude: regionFallback.longitude,
      latitudeDelta: delta,
      longitudeDelta: delta,
    },
    260,
  );
}

/** Center map at target camera zoom with crisp region fallback. */
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
        altitude: 0,
      },
      { duration: 450 },
    );
    return;
  } catch {
    map.animateToRegion(regionAt(latitude, longitude, deltaFromZoom(zoom)), 450);
  }
}
