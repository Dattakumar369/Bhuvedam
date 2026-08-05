/** 1D Kalman filter for a single coordinate axis. */
class ScalarKalmanFilter {
  private estimate: number | null = null;
  private variance = 1;

  constructor(private readonly processNoise: number) {}

  update(measurement: number, measurementVariance: number): number {
    if (this.estimate == null) {
      this.estimate = measurement;
      this.variance = measurementVariance;
      return measurement;
    }

    this.variance += this.processNoise;
    const gain = this.variance / (this.variance + measurementVariance);
    this.estimate += gain * (measurement - this.estimate);
    this.variance *= 1 - gain;
    return this.estimate;
  }

  reset(): void {
    this.estimate = null;
    this.variance = 1;
  }
}

/** Smooth lat/lng independently using GPS accuracy as measurement noise. */
export class GpsKalmanFilter {
  private readonly latFilter: ScalarKalmanFilter;
  private readonly lonFilter: ScalarKalmanFilter;

  constructor(processNoise = 0.35) {
    this.latFilter = new ScalarKalmanFilter(processNoise);
    this.lonFilter = new ScalarKalmanFilter(processNoise);
  }

  filter(
    latitude: number,
    longitude: number,
    accuracyMeters: number | null,
  ): { latitude: number; longitude: number } {
    const variance = Math.max((accuracyMeters ?? 5) ** 2, 0.64);
    return {
      latitude: this.latFilter.update(latitude, variance),
      longitude: this.lonFilter.update(longitude, variance),
    };
  }

  reset(): void {
    this.latFilter.reset();
    this.lonFilter.reset();
  }
}
