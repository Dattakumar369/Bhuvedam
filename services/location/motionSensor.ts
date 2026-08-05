import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';

const BUFFER_SIZE = 25;
const UPDATE_INTERVAL_MS = 100;

const MOVING_VARIANCE_THRESHOLD = 0.12;
const STATIONARY_VARIANCE_THRESHOLD = 0.08;

let magnitudeBuffer: number[] = [];
let subscription: { remove: () => void } | null = null;
let refCount = 0;

function magnitude({ x, y, z }: AccelerometerMeasurement): number {
  return Math.sqrt(x * x + y * y + z * z);
}

function varianceOf(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
}

/** Start accelerometer sampling (ref-counted for corner + walk sessions). */
export async function startMotionSensor(): Promise<void> {
  refCount += 1;
  if (subscription) return;

  const available = await Accelerometer.isAvailableAsync();
  if (!available) return;

  Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
  subscription = Accelerometer.addListener((data) => {
    magnitudeBuffer.push(magnitude(data));
    if (magnitudeBuffer.length > BUFFER_SIZE) {
      magnitudeBuffer.shift();
    }
  });
}

export function stopMotionSensor(): void {
  refCount = Math.max(0, refCount - 1);
  if (refCount > 0) return;
  subscription?.remove();
  subscription = null;
  magnitudeBuffer = [];
}

/** True when phone motion suggests walking (accelerometer variance above threshold). */
export function isDeviceMoving(): boolean {
  if (magnitudeBuffer.length < 10) return true;
  return varianceOf(magnitudeBuffer) > MOVING_VARIANCE_THRESHOLD;
}

/** True when phone is held still — good for corner pin capture. */
export function isDeviceStationary(): boolean {
  if (magnitudeBuffer.length < 15) return false;
  return varianceOf(magnitudeBuffer) < STATIONARY_VARIANCE_THRESHOLD;
}

export function motionVariance(): number {
  return varianceOf(magnitudeBuffer);
}
