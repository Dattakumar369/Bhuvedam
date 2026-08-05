/**
 * Walk-mode GPS tracking — isolated from motion sensor / Kalman (corner-only).
 * Matches the original stable implementation before sensor-fusion OTA changes.
 */
import * as Location from 'expo-location';

import { getFieldMeasureMessages } from '@/constants/i18n/fieldMeasureTranslations';
import type { LanguageCode } from '@/constants/languages';
import { requestLocationPermission } from '@/services/location/locationService';
import { useLanguageStore } from '@/store/languageStore';
import type { Coordinates } from '@/types/location';

export type WalkGpsQuality = 'good' | 'ok' | 'poor';

export interface WalkCapturedCorner extends Coordinates {
  accuracyMeters: number | null;
  spreadMeters: number | null;
  quality: WalkGpsQuality;
  sampleCount: number;
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

interface GpsSample {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

function distanceMeters(a: Coordinates, b: Coordinates): number {
  const R = 6378137;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function qualityFromAccuracy(accuracy: number | null): WalkGpsQuality {
  if (accuracy == null) return 'ok';
  if (accuracy <= 2) return 'good';
  if (accuracy <= 3.5) return 'ok';
  return 'poor';
}

function sampleToCorner(sample: GpsSample): WalkCapturedCorner {
  const accuracyMeters = sample.accuracy ?? 8;
  return {
    latitude: sample.latitude,
    longitude: sample.longitude,
    accuracyMeters,
    spreadMeters: null,
    quality: qualityFromAccuracy(accuracyMeters),
    sampleCount: 1,
  };
}

export async function startFieldWalkTracking(
  onPoint: (point: WalkCapturedCorner) => void,
  onProgress: (progress: WalkTrackProgress) => void,
  existingPoints: Coordinates[] = [],
  language?: LanguageCode,
): Promise<WalkTrackSession> {
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
  };

  pushProgress(msg.walkStartPlain, recorded.length, null, false);

  let subscription: Location.LocationSubscription;
  try {
    subscription = await Location.watchPositionAsync(
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
        if (acc != null && acc > 8) {
          pushProgress(msg.gpsWeak(Math.round(acc)), recorded.length, acc, false, sample);
          return;
        }

        if (!recorded.length) {
          const corner = sampleToCorner(sample);
          recorded.push(corner);
          onPoint(corner);
          pushProgress(msg.walkStartRecorded, 1, acc, false, sample);
          return;
        }

        const last = recorded[recorded.length - 1]!;
        const step = distanceMeters(last, sample);
        const first = recorded[0]!;
        const nearStart =
          recorded.length >= 4 && distanceMeters(first, sample) <= 12;

        if (step < 3) {
          pushProgress(
            nearStart
              ? msg.walkNearStop
              : msg.walkWalking(Math.round(distanceWalkedM), recorded.length),
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
            ? msg.walkNearStop
            : msg.walkRecording(Math.round(distanceWalkedM), recorded.length),
          recorded.length,
          acc,
          nearStart,
          sample,
        );
      },
    );
  } catch {
    throw new Error(msg.walkStartFailed);
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
