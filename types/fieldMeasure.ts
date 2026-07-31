import type { Coordinates } from '@/types/location';

export type AreaMeasureMode = 'patta' | 'tape' | 'gps';

export interface FieldCorner extends Coordinates {
  accuracyMeters?: number | null;
  quality?: 'good' | 'ok' | 'poor';
  sampleCount?: number;
}

export interface FieldMeasurement {
  points: FieldCorner[];
  areaAcres: number;
  areaCents: number;
  areaSqMeters: number;
  uncertaintyPercent?: number;
  measuredAt: string;
}
