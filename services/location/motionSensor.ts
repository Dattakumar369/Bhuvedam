/**
 * Accelerometer fusion — lazy-loaded so APKs without expo-sensors native code
 * never crash at import time (OTA on older builds).
 */

const BUFFER_SIZE = 25;
const UPDATE_INTERVAL_MS = 100;

const MOVING_VARIANCE_THRESHOLD = 0.12;
const STATIONARY_VARIANCE_THRESHOLD = 0.08;

type AccSample = { x: number; y: number; z: number };
type AccListener = { remove: () => void };
type AccModule = {
  isAvailableAsync: () => Promise<boolean>;
  setUpdateInterval: (ms: number) => void;
  addListener: (cb: (data: AccSample) => void) => AccListener;
};

let magnitudeBuffer: number[] = [];
let subscription: AccListener | null = null;
let refCount = 0;
let motionSensorReady = false;
/** undefined = not probed, null = unavailable, AccModule = ready */
let accModule: AccModule | null | undefined;

function magnitude({ x, y, z }: AccSample): number {
  return Math.sqrt(x * x + y * y + z * z);
}

function varianceOf(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
}

async function loadAccelerometerModule(): Promise<AccModule | null> {
  if (accModule !== undefined) return accModule;

  try {
    const { requireNativeModule } = await import('expo-modules-core');
    requireNativeModule('ExpoAccelerometer');
    const sensors = await import('expo-sensors');
    accModule = sensors.Accelerometer as unknown as AccModule;
  } catch {
    accModule = null;
  }
  return accModule ?? null;
}

export function isMotionSensorReady(): boolean {
  return motionSensorReady;
}

/** Start accelerometer (corner pin only — never used in walk mode). Never throws. */
export async function startMotionSensor(): Promise<void> {
  refCount += 1;
  if (subscription) return;

  try {
    const Acc = await loadAccelerometerModule();
    if (!Acc) {
      refCount = Math.max(0, refCount - 1);
      return;
    }

    const available = await Acc.isAvailableAsync();
    if (!available) {
      refCount = Math.max(0, refCount - 1);
      return;
    }

    Acc.setUpdateInterval(UPDATE_INTERVAL_MS);
    subscription = Acc.addListener((data) => {
      magnitudeBuffer.push(magnitude(data));
      if (magnitudeBuffer.length > BUFFER_SIZE) {
        magnitudeBuffer.shift();
      }
    });
    motionSensorReady = true;
  } catch {
    motionSensorReady = false;
    subscription = null;
    refCount = Math.max(0, refCount - 1);
  }
}

export function stopMotionSensor(): void {
  refCount = Math.max(0, refCount - 1);
  if (refCount > 0) return;
  try {
    subscription?.remove();
  } catch {
    // ignore native teardown errors
  }
  subscription = null;
  motionSensorReady = false;
  magnitudeBuffer = [];
}

export function isDeviceMoving(): boolean {
  if (!motionSensorReady) return true;
  if (magnitudeBuffer.length < 10) return true;
  return varianceOf(magnitudeBuffer) > MOVING_VARIANCE_THRESHOLD;
}

export function isDeviceStationary(): boolean {
  if (!motionSensorReady) return false;
  if (magnitudeBuffer.length < 15) return false;
  return varianceOf(magnitudeBuffer) < STATIONARY_VARIANCE_THRESHOLD;
}

export function motionVariance(): number {
  return varianceOf(magnitudeBuffer);
}
