import * as Location from 'expo-location';

import {
  isDeviceMoving,
  isDeviceStationary,
  isMotionSensorReady,
  startMotionSensor,
  stopMotionSensor,
} from '@/services/location/motionSensor';
import { getFieldMeasureMessages } from '@/constants/i18n/fieldMeasureTranslations';
import type { LanguageCode } from '@/constants/languages';
import { requestLocationPermission } from '@/services/location/locationService';
import { useLanguageStore } from '@/store/languageStore';
import type { Coordinates } from '@/types/location';
import { GpsKalmanFilter } from '@/utils/gpsKalmanFilter';

/** Corner pin only — walk mode uses plain GPS in fieldWalkTracking.ts */
export const SENSOR_FUSION_ENABLED = false;

/** Target: corners within ~1–3 m in open sky. Phone GPS cannot match survey-grade 1 cm. */
const CORNER_POLL_MS = 300;
const CORNER_MIN_SAMPLES = 5;
const CORNER_TARGET_SAMPLES = 8;
const CORNER_MIN_MS_COLD = 2_500;
const CORNER_MAX_MS_COLD = 8_000;
const CORNER_MIN_MS_WARM = 1_500;
const CORNER_MAX_MS_WARM = 5_000;
/** After first corner, GPS stays warm — next corners finish faster. */
const GPS_SESSION_WARM_MS = 90_000;

/** Reject corner if we cannot get readings this good after warm-up. */
const MAX_ACCEPT_ACCURACY_M = 5;
const GOOD_ACCURACY_M = 2;
const OK_ACCURACY_M = 3.5;

/** All used samples must lie within this radius of the final point. */
const MAX_CLUSTER_SPREAD_M = 2.5;
const STABLE_WINDOW = 4;
const STABLE_SPREAD_M = 2;

let lastCornerCaptureAt = 0;

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

function isGpsSessionWarm(): boolean {
  return lastCornerCaptureAt > 0 && Date.now() - lastCornerCaptureAt < GPS_SESSION_WARM_MS;
}

function bestSampleAccuracy(samples: GpsSample[]): number | null {
  const accs = samples.map((s) => s.accuracy).filter((v): v is number => v != null);
  if (!accs.length) return null;
  return Math.min(...accs);
}

function hasStableCluster(samples: GpsSample[]): boolean {
  const accurate = samples.filter(
    (s) => s.accuracy != null && s.accuracy <= MAX_ACCEPT_ACCURACY_M,
  );
  if (accurate.length < CORNER_MIN_SAMPLES) return false;
  const centroid = weightedCentroid(accurate);
  const cluster = removeOutliers(accurate, centroid, MAX_CLUSTER_SPREAD_M);
  if (cluster.length < CORNER_MIN_SAMPLES) return false;
  return clusterSpreadMeters(cluster, weightedCentroid(cluster)) <= STABLE_SPREAD_M;
}

function hasStableTail(samples: GpsSample[]): boolean {
  if (samples.length < STABLE_WINDOW) return false;
  const tail = samples.slice(-STABLE_WINDOW).filter((s) => (s.accuracy ?? 99) <= MAX_ACCEPT_ACCURACY_M);
  if (tail.length < STABLE_WINDOW) return false;
  const center = weightedCentroid(tail);
  const gpsStable = clusterSpreadMeters(tail, center) <= STABLE_SPREAD_M;
  if (!SENSOR_FUSION_ENABLED) return gpsStable;
  if (!isMotionSensorReady()) return gpsStable;
  return gpsStable && isDeviceStationary();
}

function smoothSample(sample: GpsSample, filter: GpsKalmanFilter): GpsSample {
  if (!SENSOR_FUSION_ENABLED) return sample;
  const smoothed = filter.filter(sample.latitude, sample.longitude, sample.accuracy);
  return { ...sample, latitude: smoothed.latitude, longitude: smoothed.longitude };
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
 * One fast capture loop — exits early when Kalman + accelerometer say stable (~3–5 s).
 * First corner may take up to ~8 s; later corners in same session often ~2–3 s.
 */
async function collectCornerSamples(
  filter: GpsKalmanFilter,
  onProgress?: (p: CaptureProgress) => void,
  language?: LanguageCode,
): Promise<GpsSample[]> {
  const msg = getFieldMeasureMessages(language ?? useLanguageStore.getState().language);
  const warm = isGpsSessionWarm();
  const minMs = warm ? CORNER_MIN_MS_WARM : CORNER_MIN_MS_COLD;
  const maxMs = warm ? CORNER_MAX_MS_WARM : CORNER_MAX_MS_COLD;
  const samples: GpsSample[] = [];
  const started = Date.now();

  onProgress?.({
    phase: 'warming',
    message: warm ? msg.cornerWarmFast : msg.cornerWarm,
    bestAccuracyMeters: null,
    sampleIndex: 0,
    totalSamples: CORNER_TARGET_SAMPLES,
  });

  while (Date.now() - started < maxMs) {
    const sample = smoothSample(await readPosition(), filter);
    samples.push(sample);

    const elapsed = Date.now() - started;
    const best = bestSampleAccuracy(samples);
    const stable = hasStableTail(samples) && hasStableCluster(samples);
    const phase: CaptureProgress['phase'] = elapsed < minMs ? 'warming' : 'sampling';

    let message: string;
    if (elapsed < minMs) {
      const waitSec = Math.max(1, Math.ceil((minMs - elapsed) / 1000));
      message = msg.gpsFix(waitSec);
    } else if (stable) {
      message = msg.stableAlmost;
    } else {
      message = msg.cornerReading(Math.round(elapsed / 1000));
    }

    onProgress?.({
      phase,
      message,
      bestAccuracyMeters: best,
      sampleIndex: samples.length,
      totalSamples: CORNER_TARGET_SAMPLES,
    });

    const elapsedOk = elapsed >= minMs;
    if (elapsedOk && stable && samples.length >= CORNER_MIN_SAMPLES) break;
    if (samples.length >= CORNER_TARGET_SAMPLES && stable) break;
    if (
      samples.length >= CORNER_TARGET_SAMPLES &&
      best != null &&
      best <= OK_ACCURACY_M &&
      elapsed >= minMs
    ) {
      break;
    }

    await delay(CORNER_POLL_MS);
  }

  return samples;
}

/**
 * Capture one field corner using warm-up + multi-sample cluster (no paid GPS API).
 * Rejects readings worse than ~5 m; targets ~1–3 m in open field.
 */
export async function captureFieldCorner(
  onProgress?: (progress: CaptureProgress) => void,
  language?: LanguageCode,
): Promise<CapturedCorner> {
  const lang = language ?? useLanguageStore.getState().language;
  const msg = getFieldMeasureMessages(lang);
  const permission = await requestLocationPermission();
  if (permission !== 'granted') {
    throw new Error(msg.permissionDenied);
  }

  const servicesOn = await Location.hasServicesEnabledAsync();
  if (!servicesOn) {
    throw new Error(msg.gpsOff);
  }

  if (SENSOR_FUSION_ENABLED) await startMotionSensor();
  const filter = new GpsKalmanFilter();

  try {
    const samples = await collectCornerSamples(filter, onProgress, lang);

    onProgress?.({
      phase: 'processing',
      message: msg.processing,
      bestAccuracyMeters: null,
      sampleIndex: samples.length,
      totalSamples: CORNER_TARGET_SAMPLES,
    });

    const accurate = samples.filter(
      (s) => s.accuracy != null && s.accuracy <= MAX_ACCEPT_ACCURACY_M,
    );

    if (!accurate.length) {
      const worstBest = samples
        .map((s) => s.accuracy)
        .filter((v): v is number => v != null)
        .sort((a, b) => a - b)[0];
      throw new Error(msg.gpsFixFailed(Math.round(worstBest ?? 10)));
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
      throw new Error(msg.spreadUnstable(Math.round(spread)));
    }

    if (accuracyMeters > MAX_ACCEPT_ACCURACY_M) {
      throw new Error(msg.accuracyPoor(Math.round(accuracyMeters)));
    }

    lastCornerCaptureAt = Date.now();

    return {
      latitude: centroid.latitude,
      longitude: centroid.longitude,
      accuracyMeters,
      spreadMeters: spread,
      quality: qualityFromAccuracy(accuracyMeters),
      sampleCount: samples.length,
    };
  } finally {
    if (SENSOR_FUSION_ENABLED) stopMotionSensor();
  }
}

export function validateCornerPoints(
  points: Coordinates[],
  newPoint: Coordinates,
  language?: LanguageCode,
): string | null {
  const msg = getFieldMeasureMessages(language ?? useLanguageStore.getState().language);
  if (!points.length) return null;

  const last = points[points.length - 1];
  const dist = distanceMeters(last, newPoint);
  if (dist < 3) {
    return msg.validateTooClose;
  }

  if (points.length >= 2) {
    const first = points[0];
    const closeDist = distanceMeters(first, newPoint);
    if (points.length >= 3 && closeDist < 3) {
      return msg.validateNearFirst;
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

export function formatAccuracyHint(
  accuracyMeters: number | null,
  spreadMeters?: number | null,
  language?: LanguageCode,
): string {
  const msg = getFieldMeasureMessages(language ?? useLanguageStore.getState().language);
  const acc = accuracyMeters != null ? Math.round(accuracyMeters * 10) / 10 : null;
  const spread = spreadMeters != null ? Math.round(spreadMeters * 10) / 10 : null;
  if (acc != null && acc <= GOOD_ACCURACY_M) {
    return msg.accuracyGood(acc, spread ?? undefined);
  }
  if (acc != null && acc <= OK_ACCURACY_M) {
    return msg.accuracyOk(acc, spread ?? undefined);
  }
  if (acc != null) return msg.accuracyWeak(acc);
  return msg.accuracyUnknown;
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

export { startFieldWalkTracking } from '@/services/location/fieldWalkTracking';
