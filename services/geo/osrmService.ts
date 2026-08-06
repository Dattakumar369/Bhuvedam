import { OSRM_BASE, OSRM_MAX_WAYPOINTS } from '@/services/geo/geoConfig';
import { distanceMeters } from '@/services/location/fieldMeasureService';
import type { Coordinates } from '@/types/location';

interface OsrmRouteResponse {
  code?: string;
  routes?: Array<{ distance?: number }>;
}

/** Sum of straight-line segments between GPS points (offline, no API). */
export function haversinePathDistanceMeters(points: Coordinates[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += distanceMeters(points[i - 1]!, points[i]!);
  }
  return Math.round(total);
}

function samplePointsForOsrm(points: Coordinates[], max: number): Coordinates[] {
  if (points.length <= max) return points;
  const out: Coordinates[] = [points[0]!];
  const step = (points.length - 1) / (max - 1);
  for (let i = 1; i < max - 1; i++) {
    out.push(points[Math.round(i * step)]!);
  }
  out.push(points[points.length - 1]!);
  return out;
}

/**
 * OSRM foot route distance through waypoints (public demo server).
 * Falls back to null when off-road / too far from mapped paths.
 */
export async function osrmPathDistanceMeters(points: Coordinates[]): Promise<number | null> {
  if (points.length < 2) return 0;

  const sampled = samplePointsForOsrm(points, OSRM_MAX_WAYPOINTS);
  const coordPath = sampled.map((p) => `${p.longitude},${p.latitude}`).join(';');
  const url = `${OSRM_BASE}/route/v1/foot/${coordPath}?overview=false`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;

    const data = (await res.json()) as OsrmRouteResponse;
    if (data.code !== 'Ok') return null;

    const meters = data.routes?.[0]?.distance;
    if (meters == null || !Number.isFinite(meters)) return null;

    return Math.round(meters);
  } catch {
    return null;
  }
}
