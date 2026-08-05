import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';

const BUFFER_SIZE = 25;
const UPDATE_INTERVAL_MS = 100;

const MOVING_VARIANCE_THRESHOLD = 0.12;
const STATIONARY_VARIANCE_THRESHOLD = 0.08;

let magnitudeBuffer: number[] = [];
let subscription: { remove: () => void } | null = null;
let refCount = 0;
/** False when native module missing (OTA on old APK) or sensor unavailable. */
let motionSensorReady = false;

function magnitude({ x, y, z }: AccelerometerMeasurement): number {
  return Math.sqrt(x * x + y * y + z * z);
}

function varianceOf(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
}

/** Whether accelerometer fusion is active for this session. */
export function isMotionSensorReady(): boolean {
  return motionSensorReady;
}

/** Start accelerometer sampling (ref-counted for corner + walk sessions). Never throws. */
export async function startMotionSensor(): Promise<void> {
  refCount += 1;
  if (subscription) return;

  try {
    const available = await Accelerometer.isAvailableAsync();
    if (!available) {
      refCount = Math.max(0, refCount - 1);
      return;
    }

    Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
    subscription = Accelerometer.addListener((data) => {
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

/** True when phone motion suggests walking (accelerometer variance above threshold). */
export function isDeviceMoving(): boolean {
  if (!motionSensorReady) return true;
  if (magnitudeBuffer.length < 10) return true;
  return varianceOf(magnitudeBuffer) > MOVING_VARIANCE_THRESHOLD;
}

/** True when phone is held still — good for corner pin capture. */
export function isDeviceStationary(): boolean {
  if (!motionSensorReady) return false;
  if (magnitudeBuffer.length < 15) return false;
  return varianceOf(magnitudeBuffer) < STATIONARY_VARIANCE_THRESHOLD;
}

export function motionVariance(): number {
  return varianceOf(magnitudeBuffer);
}
