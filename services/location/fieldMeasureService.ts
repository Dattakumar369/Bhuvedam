import * as Location from 'expo-location';

import {
  getFieldMeasureMessages,
  type FieldMeasureMessages,
} from '@/constants/i18n/fieldMeasureTranslations';
import { requestLocationPermission } from '@/services/location/locationService';
import type { Coordinates } from '@/types/location';

function msgs(messages?: FieldMeasureMessages): FieldMeasureMessages {
  return messages ?? getFieldMeasureMessages('en');
}

/** Target: corners within ~1–3 m in open sky. Phone GPS cannot match survey-grade 1 cm. */
const WARMUP_MS_MAX = 8_000;
const WARMUP_MS_MIN = 2_500;
const WARMUP_POLL_MS = 350;
const SAMPLE_COUNT = 8;
const SAMPLE_GAP_MS = 300;

/** Signal already strong — skip long wait (typical open field: 3–6 sec). */
const QUICK_FIX_ACCURACY_M = 2.5;

/** Reject corner readings worse than this — prevents ±4m corners stacking into huge area error. */
const MAX_ACCEPT_ACCURACY_M = 3.5;
const GOOD_ACCURACY_M = 1.5;
const OK_ACCURACY_M = 2.5;

/** All used samples must lie within this radius of the final point. */
const MAX_CLUSTER_SPREAD_M = 1.8;
const STABLE_WINDOW = 4;
const STABLE_SPREAD_M = 1.5;

/** Block "Use size" when average corner error is above this. */
export const MAX_APPLY_AVG_ACCURACY_M = 3;

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
    const acc = Math.max(s.accuracy ?? MAX_ACCEPT_ACCURACY_M, 0.6);
    const w = 1 / (acc * acc);
    wSum += w;
    lat += s.latitude * w;
    lon += s.longitude * w;
  }
  return { latitude: lat / wSum, longitude: lon / wSum };
}

/** Median of best-accuracy samples — resists single bad jumps better than mean. */
function medianOfBestSamples(samples: GpsSample[], take = 5): Coordinates {
  const ranked = [...samples]
    .filter((s) => s.accuracy != null && s.accuracy <= MAX_ACCEPT_ACCURACY_M)
    .sort((a, b) => (a.accuracy ?? 99) - (b.accuracy ?? 99))
    .slice(0, take);

  if (!ranked.length) return weightedCentroid(samples);

  const lats = ranked.map((s) => s.latitude).sort((a, b) => a - b);
  const lons = ranked.map((s) => s.longitude).sort((a, b) => a - b);
  const mid = Math.floor(ranked.length / 2);
  return { latitude: lats[mid]!, longitude: lons[mid]! };
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
    mayShowUserSettingsDialog: true,
  });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy ?? null,
  };
}

/**
 * Warm up GPS — stops early when signal is good (often 3–6 sec in open field).
 */
async function warmUpGps(
  onProgress?: (p: CaptureProgress) => void,
  messages?: FieldMeasureMessages,
): Promise<GpsSample[]> {
  const fm = msgs(messages);
  const warmupSamples: GpsSample[] = [];
  let bestAccuracy: number | null = null;
  const started = Date.now();

  onProgress?.({
    phase: 'warming',
    message: fm.cornerWarm,
    bestAccuracyMeters: null,
    sampleIndex: 0,
    totalSamples: SAMPLE_COUNT,
  });

  while (Date.now() - started < WARMUP_MS_MAX) {
    const sample = await readPosition();
    warmupSamples.push(sample);
    if (sample.accuracy != null) {
      bestAccuracy =
        bestAccuracy == null ? sample.accuracy : Math.min(bestAccuracy, sample.accuracy);
    }

    const elapsed = Date.now() - started;
    const elapsedSec = Math.round(elapsed / 1000);
    onProgress?.({
      phase: 'warming',
      message:
        bestAccuracy != null && bestAccuracy <= QUICK_FIX_ACCURACY_M
          ? fm.gpsGoodWait(Math.round(bestAccuracy * 10) / 10)
          : fm.gpsFix(elapsedSec),
      bestAccuracyMeters: bestAccuracy,
      sampleIndex: warmupSamples.length,
      totalSamples: SAMPLE_COUNT,
    });

    if (
      elapsed >= WARMUP_MS_MIN &&
      bestAccuracy != null &&
      bestAccuracy <= QUICK_FIX_ACCURACY_M &&
      hasStableTail(warmupSamples)
    ) {
      break;
    }

    if (
      elapsed >= 5_000 &&
      bestAccuracy != null &&
      bestAccuracy <= OK_ACCURACY_M &&
      hasStableTail(warmupSamples)
    ) {
      break;
    }

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
  messages?: FieldMeasureMessages,
): Promise<CapturedCorner> {
  const fm = msgs(messages);
  const permission = await requestLocationPermission();
  if (permission !== 'granted') {
    throw new Error(fm.permissionDenied);
  }

  const servicesOn = await Location.hasServicesEnabledAsync();
  if (!servicesOn) {
    throw new Error(fm.gpsOff);
  }

  const warmupSamples = await warmUpGps(onProgress, fm);
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
      message: fm.cornerSample(i + 1, SAMPLE_COUNT),
      bestAccuracyMeters: bestAcc,
      sampleIndex: i + 1,
      totalSamples: SAMPLE_COUNT,
    });

    if (i < SAMPLE_COUNT - 1) await delay(SAMPLE_GAP_MS);
  }

  onProgress?.({
    phase: 'processing',
    message: fm.processing,
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
    throw new Error(fm.gpsFixFailed(Math.round(worstBest ?? 10)));
  }

  let centroid = weightedCentroid(accurate);
  let cluster = removeOutliers(accurate, centroid, MAX_CLUSTER_SPREAD_M);
  if (cluster.length < 3) {
    cluster = [...accurate]
      .sort((a, b) => (a.accuracy ?? 99) - (b.accuracy ?? 99))
      .slice(0, Math.min(6, accurate.length));
  }

  centroid = medianOfBestSamples(cluster);
  cluster = removeOutliers(cluster, centroid, MAX_CLUSTER_SPREAD_M);
  if (!cluster.length) cluster = accurate.slice(0, 4);

  centroid = medianOfBestSamples(cluster);
  const spread = clusterSpreadMeters(cluster, centroid);
  const accuracyMeters =
    cluster.reduce((sum, s) => sum + (s.accuracy ?? MAX_ACCEPT_ACCURACY_M), 0) / cluster.length;

  if (spread > MAX_CLUSTER_SPREAD_M) {
    throw new Error(fm.spreadUnstable(Math.round(spread)));
  }

  if (accuracyMeters > MAX_ACCEPT_ACCURACY_M) {
    throw new Error(fm.accuracyPoor(Math.round(accuracyMeters)));
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
  messages?: FieldMeasureMessages,
): string | null {
  const fm = msgs(messages);
  if (!points.length) return null;

  const last = points[points.length - 1]!;
  const dist = distanceMeters(last, newPoint);
  if (dist < 3) {
    return fm.validateTooClose;
  }

  if (points.length >= 2) {
    const first = points[0]!;
    const closeDist = distanceMeters(first, newPoint);
    if (points.length >= 3 && closeDist < 3) {
      return fm.validateNearFirst;
    }
  }

  return null;
}

/** Walk mode — tighter accuracy, smaller steps for less shape error */
const WALK_MIN_STEP_M = 2.5;
const WALK_MAX_ACCURACY_M = 5;
const WALK_BURST_SAMPLES = 3;
const WALK_BURST_GAP_MS = 280;
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
export function simplifyWalkPoints(points: Coordinates[], minDistM = 2.5): Coordinates[] {
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

export function formatAccuracyHint(
  accuracyMeters: number | null,
  spreadMeters?: number | null,
  messages?: FieldMeasureMessages,
): string {
  const fm = msgs(messages);
  const acc = accuracyMeters != null ? Math.round(accuracyMeters * 10) / 10 : null;
  const spread = spreadMeters != null ? Math.round(spreadMeters * 10) / 10 : null;
  if (acc != null && acc <= GOOD_ACCURACY_M) {
    return fm.accuracyGood(acc, spread ?? undefined);
  }
  if (acc != null && acc <= OK_ACCURACY_M) {
    return fm.accuracyOk(acc, spread ?? undefined);
  }
  if (acc != null) return fm.accuracyWeak(acc);
  return fm.accuracyUnknown;
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


/** 3 quick readings when walk records a point — ~1 sec, better than single jumpy fix. */
async function captureWalkBurst(): Promise<CapturedCorner | null> {
  const burst: GpsSample[] = [];
  for (let i = 0; i < WALK_BURST_SAMPLES; i++) {
    burst.push(await readPosition());
    if (i < WALK_BURST_SAMPLES - 1) await delay(WALK_BURST_GAP_MS);
  }

  const good = burst.filter((s) => s.accuracy != null && s.accuracy <= WALK_MAX_ACCURACY_M);
  if (!good.length) return null;

  const coords = medianOfBestSamples(good, good.length);
  const accuracyMeters =
    good.reduce((sum, s) => sum + (s.accuracy ?? WALK_MAX_ACCURACY_M), 0) / good.length;
  const spread = clusterSpreadMeters(good, coords);

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracyMeters,
    spreadMeters: spread,
    quality: qualityFromAccuracy(accuracyMeters),
    sampleCount: good.length,
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
  messages?: FieldMeasureMessages,
): Promise<WalkTrackSession> {
  const fm = msgs(messages);
  const permission = await requestLocationPermission();
  if (permission !== 'granted') {
    throw new Error(fm.permissionDenied);
  }

  const servicesOn = await Location.hasServicesEnabledAsync();
  if (!servicesOn) {
    throw new Error(fm.gpsOff);
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

  pushProgress(fm.walkStartPlain, recorded.length, null, false);

  let subscription: Location.LocationSubscription;
  let burstBusy = false;

  const recordCorner = (corner: CapturedCorner, acc: number | null, nearStart: boolean, live: GpsSample) => {
    const last = recorded[recorded.length - 1];
    if (last) {
      distanceWalkedM += distanceMeters(last, corner);
    }
    recorded.push(corner);
    onPoint(corner);
    pushProgress(
      nearStart
        ? fm.walkNearStop
        : fm.walkRecording(Math.round(distanceWalkedM), recorded.length),
      recorded.length,
      acc,
      nearStart,
      live,
    );
  };

  try {
    subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 2,
      timeInterval: 1500,
    },
    (position) => {
      if (stopped || burstBusy) return;

      const sample: GpsSample = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? null,
      };

      const acc = sample.accuracy;
      if (acc != null && acc > WALK_MAX_ACCURACY_M) {
        pushProgress(fm.gpsWeak(Math.round(acc)), recorded.length, acc, false, sample);
        return;
      }

      if (!recorded.length) {
        burstBusy = true;
        void captureWalkBurst()
          .then((corner) => {
            if (stopped) return;
            if (!corner) {
              pushProgress(fm.gpsWeakRetry, 0, acc, false, sample);
              return;
            }
            recordCorner(corner, corner.accuracyMeters, false, sample);
            pushProgress(fm.walkStartRecorded, 1, corner.accuracyMeters, false, sample);
          })
          .finally(() => {
            burstBusy = false;
          });
        return;
      }

      const last = recorded[recorded.length - 1]!;
      const step = distanceMeters(last, sample);
      const first = recorded[0]!;
      const nearStart = recorded.length >= 4 && distanceMeters(first, sample) <= WALK_CLOSE_LOOP_M;

      if (step < WALK_MIN_STEP_M) {
        pushProgress(
          nearStart
            ? fm.walkNearStop
            : fm.walkWalking(Math.round(distanceWalkedM), recorded.length),
          recorded.length,
          acc,
          nearStart,
          sample,
        );
        return;
      }

      burstBusy = true;
      void captureWalkBurst()
        .then((corner) => {
          if (stopped || !corner) return;
          recordCorner(corner, corner.accuracyMeters, nearStart, sample);
        })
        .finally(() => {
          burstBusy = false;
        });
    },
  );
  } catch {
    throw new Error(fm.walkStartFailed);
  }

  return {
    stop: () => {
      stopped = true;
      try {
        subscription.remove();
      } catch {
        // ignore
      }
    },
  };
}
