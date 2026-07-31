export type FarmAlertType =
  | 'mandi_price'
  | 'weather_rain'
  | 'weather_heat'
  | 'weather_wind'
  | 'crop_sowing'
  | 'crop_harvest'
  | 'data_freshness';

export type FarmAlertSeverity = 'info' | 'warning' | 'urgent';

export interface FarmAlert {
  id: string;
  type: FarmAlertType;
  severity: FarmAlertSeverity;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  data?: Record<string, unknown>;
}

export interface MandiPriceSnapshot {
  cropId: string;
  varietyName?: string;
  price: number;
  fetchedAt: string;
}

export interface SyncStatusSummary {
  mandiLastSync: string | null;
  weatherLastSync: string | null;
  sources: { id: string; name: string; lastSyncAt: string | null }[];
}
