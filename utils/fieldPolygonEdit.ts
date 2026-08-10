import { distanceMeters } from '@/services/location/fieldMeasureService';
import type { Coordinates } from '@/types/location';
import { projectToLocalMeters } from '@/utils/geoArea';

function distPointToSegmentM(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-6) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Existing corner within threshold — avoid duplicate pins. */
export function nearestVertexIndex(
  tap: Coordinates,
  vertices: Coordinates[],
  thresholdM = 1.5,
): number | null {
  let best: { i: number; d: number } | null = null;
  for (let i = 0; i < vertices.length; i++) {
    const d = distanceMeters(tap, vertices[i]!);
    if (d <= thresholdM && (!best || d < best.d)) best = { i, d };
  }
  return best?.i ?? null;
}

/** Insert new corner after this index when tap is on a boundary line. */
export function nearestEdgeInsertAfterIndex(
  tap: Coordinates,
  vertices: Coordinates[],
  thresholdM = 6,
): number | null {
  if (vertices.length < 2) return null;

  const projected = projectToLocalMeters([tap, ...vertices]);
  const tapP = projected[0]!;
  const verts = projected.slice(1);

  let best: { after: number; d: number } | null = null;
  const edgeCount = vertices.length >= 3 ? vertices.length : vertices.length - 1;

  for (let i = 0; i < edgeCount; i++) {
    const j = i + 1;
    if (j >= vertices.length) continue;
    const d = distPointToSegmentM(tapP, verts[i]!, verts[j]!);
    if (d <= thresholdM && (!best || d < best.d)) best = { after: i, d };
  }

  if (vertices.length >= 3) {
    const d = distPointToSegmentM(
      tapP,
      verts[vertices.length - 1]!,
      verts[0]!,
    );
    if (d <= thresholdM && (!best || d < best.d)) {
      best = { after: vertices.length - 1, d };
    }
  }

  return best?.after ?? null;
}
