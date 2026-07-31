import type { Coordinates } from '@/types/location';

const SQ_METERS_PER_ACRE = 4046.8564224;
const SQ_METERS_PER_CENT = SQ_METERS_PER_ACRE / 100;
const EARTH_RADIUS_M = 6378137;
export const CENTS_PER_ACRE = 100;

export interface AreaValues {
  areaAcres: number;
  areaCents: number;
  areaSqMeters: number;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function roundAcres(acres: number): number {
  return Math.round(acres * 10000) / 10000;
}

export function roundCents(cents: number): number {
  return Math.round(cents * 100) / 100;
}

export function acresToCents(acres: number): number {
  return roundCents(acres * CENTS_PER_ACRE);
}

export function centsToAcres(cents: number): number {
  return roundAcres(cents / CENTS_PER_ACRE);
}

export function sqMetersToAcres(sqMeters: number): number {
  return sqMeters / SQ_METERS_PER_ACRE;
}

export function sqMetersToCents(sqMeters: number): number {
  return sqMeters / SQ_METERS_PER_CENT;
}

/** Primary display — cents first, acres second */
export function formatAreaDisplay(
  areaAcres: number,
  areaCents?: number,
  source?: 'patta' | 'tape' | 'gps',
): {
  primary: string;
  secondary: string;
  full: string;
  badge: string;
} {
  const cents = roundCents(areaCents ?? acresToCents(areaAcres));
  const acres = roundAcres(areaCents != null ? centsToAcres(cents) : areaAcres);

  const badge =
    source === 'gps'
      ? 'GPS estimate / సుమారు'
      : source === 'tape'
        ? 'Exact — tape measure / లేఖీ exact'
        : source === 'patta'
          ? 'Exact — patta / పట్టా exact'
          : '';

  return {
    primary: `${cents} cents / ${cents} సెంట్లు`,
    secondary: `${acres} acres / ${acres} ఎకరాలు`,
    full: `${cents} cents (${acres} acres / ${acres} ఎకరాలు)${badge ? ` · ${badge}` : ''}`,
    badge,
  };
}

export function areaFromRectangleMeters(lengthM: number, widthM: number): AreaValues | null {
  if (!Number.isFinite(lengthM) || !Number.isFinite(widthM) || lengthM <= 0 || widthM <= 0) {
    return null;
  }
  const areaSqMeters = lengthM * widthM;
  const areaCents = roundCents(sqMetersToCents(areaSqMeters));
  const areaAcres = centsToAcres(areaCents);
  return { areaSqMeters, areaAcres, areaCents };
}

export function parseMetersInput(value: string): number | null {
  const n = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Stored label for profile & AI */
export function formatAreaLabel(
  areaAcres: number,
  areaCents?: number,
  source?: 'patta' | 'tape' | 'gps',
): string {
  return formatAreaDisplay(areaAcres, areaCents, source).full;
}

export function formatAreaFromMeasurement(measurement: {
  areaAcres: number;
  areaCents: number;
}): string {
  return formatAreaLabel(measurement.areaAcres, measurement.areaCents);
}

export function parseAcresInput(value: string): number | null {
  const n = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(n) && n > 0 ? roundAcres(n) : null;
}

export function parseCentsInput(value: string): number | null {
  const n = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(n) && n > 0 ? roundCents(n) : null;
}

export function areaFromAcresInput(acresStr: string): AreaValues | null {
  const acres = parseAcresInput(acresStr);
  if (acres == null) return null;
  const areaSqMeters = acres * SQ_METERS_PER_ACRE;
  return {
    areaAcres: acres,
    areaCents: acresToCents(acres),
    areaSqMeters,
  };
}

export function areaFromCentsInput(centsStr: string): AreaValues | null {
  const cents = parseCentsInput(centsStr);
  if (cents == null) return null;
  const areaSqMeters = cents * SQ_METERS_PER_CENT;
  return {
    areaAcres: centsToAcres(cents),
    areaCents: cents,
    areaSqMeters,
  };
}

/** Project lat/lon to local meters (equirectangular) — accurate for field-sized polygons in India */
export function projectToLocalMeters(
  points: Coordinates[],
  center?: Coordinates,
): { x: number; y: number }[] {
  if (!points.length) return [];

  const centerLat =
    center?.latitude ?? points.reduce((s, p) => s + p.latitude, 0) / points.length;
  const centerLon =
    center?.longitude ?? points.reduce((s, p) => s + p.longitude, 0) / points.length;
  const cosLat = Math.cos(toRad(centerLat));

  return points.map((p) => ({
    x: toRad(p.longitude - centerLon) * EARTH_RADIUS_M * cosLat,
    y: toRad(p.latitude - centerLat) * EARTH_RADIUS_M,
  }));
}

/** Shoelace area on projected meter coordinates */
export function polygonAreaSqMetersFromProjected(projected: { x: number; y: number }[]): number {
  if (projected.length < 3) return 0;
  let area = 0;
  const n = projected.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += projected[i].x * projected[j].y;
    area -= projected[j].x * projected[i].y;
  }
  return Math.abs(area / 2);
}

export function polygonAreaSqMeters(points: Coordinates[]): number {
  if (points.length < 3) return 0;
  const projected = projectToLocalMeters(points);
  return polygonAreaSqMetersFromProjected(projected);
}

export function estimateAreaUncertaintyPercent(
  points: Coordinates[],
  avgAccuracyMeters: number,
): number {
  if (points.length < 3 || avgAccuracyMeters <= 0) return 0;

  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dLat = toRad(points[j].latitude - points[i].latitude);
    const dLon = toRad(points[j].longitude - points[i].longitude);
    const lat1 = toRad(points[i].latitude);
    const lat2 = toRad(points[j].latitude);
    const a =
      Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    perimeter += 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
  }

  const area = polygonAreaSqMeters(points);
  if (area <= 0) return 0;

  const delta = (avgAccuracyMeters * perimeter) / area;
  return Math.min(50, Math.round(delta * 100));
}

export function measurePolygon(
  points: Coordinates[],
  avgAccuracyMeters = 0,
): AreaValues & { uncertaintyPercent: number } {
  const areaSqMeters = polygonAreaSqMeters(points);
  const areaCents = roundCents(sqMetersToCents(areaSqMeters));
  const areaAcres = centsToAcres(areaCents);

  return {
    areaSqMeters,
    areaAcres,
    areaCents,
    uncertaintyPercent: estimateAreaUncertaintyPercent(points, avgAccuracyMeters),
  };
}

export function parseStoredArea(
  farmSize?: string,
  stored?: { areaAcres?: number; areaCents?: number },
  measurement?: { areaAcres: number; areaCents: number } | null,
): { cents: string; acres: string } {
  if (stored?.areaCents != null && stored?.areaAcres != null) {
    return { cents: String(stored.areaCents), acres: String(stored.areaAcres) };
  }
  if (measurement) {
    return {
      cents: String(roundCents(measurement.areaCents)),
      acres: String(roundAcres(measurement.areaAcres)),
    };
  }
  if (farmSize) {
    const centsM = farmSize.match(/([\d.]+)\s*cents?/i);
    const acresM = farmSize.match(/([\d.]+)\s*acres?/i);
    if (centsM) {
      const cents = centsM[1];
      return {
        cents,
        acres: acresM?.[1] ?? String(roundAcres(centsToAcres(Number(cents)))),
      };
    }
    if (acresM) {
      const acres = acresM[1];
      return {
        acres,
        cents: String(roundCents(acresToCents(Number(acres)))),
      };
    }
    const plain = parseAcresInput(farmSize);
    if (plain != null) {
      return { acres: String(plain), cents: String(acresToCents(plain)) };
    }
  }
  return { cents: '', acres: '' };
}
