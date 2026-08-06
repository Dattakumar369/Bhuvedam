import * as Location from 'expo-location';

import { requestLocationPermission } from '@/services/location/locationService';
import type { Coordinates } from '@/types/location';

/** Target: corners within ~1–3 m in open sky. Phone GPS cannot match survey-grade 1 cm. */
const WARMUP_MS = 14_000;
const WARMUP_POLL_MS = 450;
const SAMPLE_COUNT = 16;
const SAMPLE_GAP_MS = 450;

/** Reject corner if we cannot get readings this good after warm-up. */
const MAX_ACCEPT_ACCURACY_M = 5;
const GOOD_ACCURACY_M = 2;
const OK_ACCURACY_M = 3.5;

/** All used samples must lie within this radius of the final point. */
const MAX_CLUSTER_SPREAD_M = 2.5;
const STABLE_WINDOW = 5;
const STABLE_SPREAD_M = 2;

export type GpsQuality = 'good' | 'ok' | 'poor';

export interface CaptureProgress {
  phase: 'warming' | 'sampling' | 'processing';
  message: string;
  bestAccuracyMeters: number | null;
  sampleIndex: number;
  totalSamples: number;
}

export interface CapturedCorner extends Coordinates {
  accuracyMeters: number | null;
  spreadMeters: number | null;
  quality: GpsQuality;
  sampleCount: number;
}

interface GpsSample {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function qualityFromAccuracy(accuracy: number | null): GpsQuality {
  if (accuracy == null) return 'ok';
  if (accuracy <= GOOD_ACCURACY_M) return 'good';
  if (accuracy <= OK_ACCURACY_M) return 'ok';
  return 'poor';
}

/** Haversine distance in meters between two GPS points. */
export function distanceMeters(a: Coordinates, b: Coordinates): number {
  const R = 6378137;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function clusterSpreadMeters(samples: GpsSample[], center: Coordinates): number {
  if (!samples.length) return 0;
  return Math.max(...samples.map((s) => distanceMeters(s, center)));
}

function weightedCentroid(samples: GpsSample[]): Coordinates {
  let wSum = 0;
  let lat = 0;
  let lon = 0;
  for (const s of samples) {
    const acc = Math.max(s.accuracy ?? MAX_ACCEPT_ACCURACY_M, 0.8);
    const w = 1 / (acc * acc);
    wSum += w;
    lat += s.latitude * w;
    lon += s.longitude * w;
  }
  return { latitude: lat / wSum, longitude: lon / wSum };
}

function removeOutliers(samples: GpsSample[], center: Coordinates, maxDistM: number): GpsSample[] {
  return samples.filter((s) => distanceMeters(s, center) <= maxDistM);
}

function hasStableTail(samples: GpsSample[]): boolean {
  if (samples.length < STABLE_WINDOW) return false;
  const tail = samples.slice(-STABLE_WINDOW).filter((s) => (s.accuracy ?? 99) <= MAX_ACCEPT_ACCURACY_M);
  if (tail.length < STABLE_WINDOW) return false;
  const center = weightedCentroid(tail);
  return clusterSpreadMeters(tail, center) <= STABLE_SPREAD_M;
}

async function readPosition(): Promise<GpsSample> {
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,
    maximumAge: 0,
    mayShowUserSettingsDialog: true,
  });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy ?? null,
  };
}

/**
 * Warm up GPS at the corner — phone needs clear sky view for ~2–3 m accuracy.
 */
async function warmUpGps(onProgress?: (p: CaptureProgress) => void): Promise<GpsSample[]> {
  const warmupSamples: GpsSample[] = [];
  let bestAccuracy: number | null = null;
  const started = Date.now();

  onProgress?.({
    phase: 'warming',
    message: 'GPS warm-up — polam moola lo nilchondi, phone pai ki chudandi (open sky)',
    bestAccuracyMeters: null,
    sampleIndex: 0,
    totalSamples: SAMPLE_COUNT,
  });

  while (Date.now() - started < WARMUP_MS) {
    const sample = await readPosition();
    warmupSamples.push(sample);
    if (sample.accuracy != null) {
      bestAccuracy =
        bestAccuracy == null ? sample.accuracy : Math.min(bestAccuracy, sample.accuracy);
    }

    const elapsed = Math.round((Date.now() - started) / 1000);
    onProgress?.({
      phase: 'warming',
      message: `GPS fix avutundi… ${elapsed}s / ${Math.round(WARMUP_MS / 1000)}s — moola daggarame nilchondi`,
      bestAccuracyMeters: bestAccuracy,
      sampleIndex: warmupSamples.length,
      totalSamples: SAMPLE_COUNT,
    });

    if (hasStableTail(warmupSamples)) break;
    await delay(WARMUP_POLL_MS);
  }

  return warmupSamples;
}

/**
 * Capture one field corner using warm-up + multi-sample cluster (no paid GPS API).
 * Rejects readings worse than ~5 m; targets ~1–3 m in open field.
 */
export async function captureFieldCorner(
  onProgress?: (progress: CaptureProgress) => void,
): Promise<CapturedCorner> {
  const permission = await requestLocationPermission();
  if (permission !== 'granted') {
    throw new Error('Location permission ivvaledi — Settings lo Allow cheyandi');
  }

  const servicesOn = await Location.hasServicesEnabledAsync();
  if (!servicesOn) {
    throw new Error('Phone lo Location/GPS OFF undi — Settings lo ON cheyandi');
  }

  const warmupSamples = await warmUpGps(onProgress);
  const samples: GpsSample[] = [...warmupSamples];

  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const sample = await readPosition();
    samples.push(sample);

    const bestAcc = samples
      .map((s) => s.accuracy)
      .filter((v): v is number => v != null)
      .sort((a, b) => a - b)[0] ?? null;

    onProgress?.({
      phase: 'sampling',
      message: `Moola reading ${i + 1}/${SAMPLE_COUNT} — phone ni moola marker pai pettandi`,
      bestAccuracyMeters: bestAcc,
      sampleIndex: i + 1,
      totalSamples: SAMPLE_COUNT,
    });

    if (i < SAMPLE_COUNT - 1) await delay(SAMPLE_GAP_MS);
  }

  onProgress?.({
    phase: 'processing',
    message: 'Stable GPS point calculate avutundi…',
    bestAccuracyMeters: null,
    sampleIndex: SAMPLE_COUNT,
    totalSamples: SAMPLE_COUNT,
  });

  const accurate = samples.filter(
    (s) => s.accuracy != null && s.accuracy <= MAX_ACCEPT_ACCURACY_M,
  );

  if (!accurate.length) {
    const worstBest = samples
      .map((s) => s.accuracy)
      .filter((v): v is number => v != null)
      .sort((a, b) => a - b)[0];
    throw new Error(
      `GPS sariga fix avvaledu (best ±${Math.round(worstBest ?? 10)}m). Open sky lo 15 sec nilchondi, phone moola daggaraki pettandi, malli try cheyandi.`,
    );
  }

  let centroid = weightedCentroid(accurate);
  let cluster = removeOutliers(accurate, centroid, MAX_CLUSTER_SPREAD_M);
  if (cluster.length < 4) {
    cluster = [...accurate].sort(
      (a, b) => (a.accuracy ?? 99) - (b.accuracy ?? 99),
    ).slice(0, Math.min(8, accurate.length));
  }

  centroid = weightedCentroid(cluster);
  cluster = removeOutliers(cluster, centroid, MAX_CLUSTER_SPREAD_M);
  if (!cluster.length) cluster = accurate.slice(0, 4);

  centroid = weightedCentroid(cluster);
  const spread = clusterSpreadMeters(cluster, centroid);
  const accuracyMeters =
    cluster.reduce((sum, s) => sum + (s.accuracy ?? MAX_ACCEPT_ACCURACY_M), 0) / cluster.length;

  if (spread > MAX_CLUSTER_SPREAD_M) {
    throw new Error(
      `GPS readings stable kaavu (±${Math.round(spread)}m spread). Moola lo 15 sec nilchondi, malli try cheyandi.`,
    );
  }

  if (accuracyMeters > MAX_ACCEPT_ACCURACY_M) {
    throw new Error(
      `GPS accuracy chaala taggindi (±${Math.round(accuracyMeters)}m). Open sky lo wait chesi malli add cheyandi.`,
    );
  }

  return {
    latitude: centroid.latitude,
    longitude: centroid.longitude,
    accuracyMeters,
    spreadMeters: spread,
    quality: qualityFromAccuracy(accuracyMeters),
    sampleCount: samples.length,
  };
}

export function validateCornerPoints(
  points: Coordinates[],
  newPoint: Coordinates,
): string | null {
  if (!points.length) return null;

  const last = points[points.length - 1];
  const dist = distanceMeters(last, newPoint);
  if (dist < 3) {
    return 'I moola previous moola ki chaala daggaraga undi. Next moola ki walk chesi add cheyandi.';
  }

  if (points.length >= 2) {
    const first = points[0];
    const closeDist = distanceMeters(first, newPoint);
    if (points.length >= 3 && closeDist < 3) {
      return 'First moola ki daggaraga undi — okate place lo add avutundi.';
    }
  }

  return null;
}

/** Walk mode constants */
const WALK_MIN_STEP_M = 3;
const WALK_MAX_ACCURACY_M = 8;
const WALK_CLOSE_LOOP_M = 12;
const WALK_MIN_CLOSE_FOR_AREA_M = 15;

export function isWalkLoopClosed(points: Coordinates[]): boolean {
  if (points.length < 3) return false;
  return distanceMeters(points[0]!, points[points.length - 1]!) <= WALK_MIN_CLOSE_FOR_AREA_M;
}

export function walkLoopGapMeters(points: Coordinates[]): number {
  if (points.length < 2) return 0;
  return distanceMeters(points[0]!, points[points.length - 1]!);
}

/** Remove GPS jitter — keep shape, drop redundant points */
export function simplifyWalkPoints(points: Coordinates[], minDistM = 4): Coordinates[] {
  if (points.length <= 3) return points;
  const out: Coordinates[] = [points[0]!];
  for (let i = 1; i < points.length; i++) {
    const p = points[i]!;
    const last = out[out.length - 1]!;
    if (distanceMeters(last, p) >= minDistM) out.push(p);
  }
  const first = out[0]!;
  const last = out[out.length - 1]!;
  if (out.length > 3 && distanceMeters(first, last) < minDistM) {
    out.pop();
  }
  return out.length >= 3 ? out : points;
}

export function formatAccuracyHint(accuracyMeters: number | null, spreadMeters?: number | null): string {
  const acc = accuracyMeters != null ? Math.round(accuracyMeters * 10) / 10 : null;
  const spread = spreadMeters != null ? Math.round(spreadMeters * 10) / 10 : null;
  if (acc != null && acc <= GOOD_ACCURACY_M) {
    return spread != null ? `±${acc}m (spread ${spread}m) — bagundi` : `±${acc}m — bagundi`;
  }
  if (acc != null && acc <= OK_ACCURACY_M) {
    return spread != null ? `±${acc}m (spread ${spread}m) — open sky lo inka wait cheste better` : `±${acc}m`;
  }
  if (acc != null) return `±${acc}m — weak signal`;
  return 'accuracy unknown';
}

export interface WalkTrackProgress {
  message: string;
  pointCount: number;
  distanceWalkedM: number;
  currentAccuracyM: number | null;
  nearStart: boolean;
  liveLatitude?: number;
  liveLongitude?: number;
}

export interface WalkTrackSession {
  stop: () => void;
}

function sampleToCorner(sample: GpsSample): CapturedCorner {
  const accuracyMeters = sample.accuracy ?? MAX_ACCEPT_ACCURACY_M;
  return {
    latitude: sample.latitude,
    longitude: sample.longitude,
    accuracyMeters,
    spreadMeters: null,
    quality: qualityFromAccuracy(accuracyMeters),
    sampleCount: 1,
  };
}

/**
 * Track GPS while farmer walks around the field perimeter.
 * Points auto-record every ~4 m — no manual pin at each corner.
 */
export async function startFieldWalkTracking(
  onPoint: (point: CapturedCorner) => void,
  onProgress: (progress: WalkTrackProgress) => void,
  existingPoints: Coordinates[] = [],
  onLivePosition?: (position: Coordinates) => void,
): Promise<WalkTrackSession> {
  const permission = await requestLocationPermission();
  if (permission !== 'granted') {
    throw new Error('Location permission ivvaledi — Settings lo Allow cheyandi');
  }

  const servicesOn = await Location.hasServicesEnabledAsync();
  if (!servicesOn) {
    throw new Error('Phone lo Location/GPS OFF undi — Settings lo ON cheyandi');
  }

  let stopped = false;
  let distanceWalkedM = 0;
  const recorded: Coordinates[] = [...existingPoints];

  const pushProgress = (
    message: string,
    pointCount: number,
    currentAccuracyM: number | null,
    nearStart: boolean,
    live?: GpsSample,
  ) => {
    onProgress({
      message,
      pointCount,
      distanceWalkedM: Math.round(distanceWalkedM),
      currentAccuracyM,
      nearStart,
      liveLatitude: live?.latitude,
      liveLongitude: live?.longitude,
    });
    if (live) {
      onLivePosition?.({ latitude: live.latitude, longitude: live.longitude });
    }
  };

  pushProgress(
    'Polam border chuttu tiragandi — phone chethulo pettandi, open sky chudali',
    recorded.length,
    null,
    false,
  );

  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 2,
      timeInterval: 1500,
    },
    (position) => {
      if (stopped) return;

      const sample: GpsSample = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? null,
      };

      const acc = sample.accuracy;
      if (acc != null && acc > WALK_MAX_ACCURACY_M) {
        pushProgress(
          `GPS weak (±${Math.round(acc)}m) — open sky daggaraki vellandi`,
          recorded.length,
          acc,
          false,
          sample,
        );
        return;
      }

      if (!recorded.length) {
        const corner = sampleToCorner(sample);
        recorded.push(corner);
        onPoint(corner);
        pushProgress('Start point record ayyindi — ippudu polam chuttu tiragandi', 1, acc, false, sample);
        return;
      }

      const last = recorded[recorded.length - 1]!;
      const step = distanceMeters(last, sample);
      const first = recorded[0]!;
      const nearStart = recorded.length >= 4 && distanceMeters(first, sample) <= WALK_CLOSE_LOOP_M;

      if (step < WALK_MIN_STEP_M) {
        pushProgress(
          nearStart
            ? 'Start point daggaraki vacharu — “Stop” nokki area kanipistundi'
            : `Tirugutunnaru… ${Math.round(distanceWalkedM)}m (${recorded.length} points)`,
          recorded.length,
          acc,
          nearStart,
          sample,
        );
        return;
      }

      const corner = sampleToCorner(sample);
      recorded.push(corner);
      distanceWalkedM += step;
      onPoint(corner);

      pushProgress(
        nearStart
          ? 'Start point daggaraki vacharu — “Stop” nokki area kanipistundi'
          : `Recording… ${Math.round(distanceWalkedM)}m tirigaru · ${recorded.length} points`,
        recorded.length,
        acc,
        nearStart,
        sample,
      );
    },
  );

  return {
    stop: () => {
      stopped = true;
      subscription.remove();
    },
  };
}
