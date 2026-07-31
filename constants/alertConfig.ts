/** Mandi price change % to trigger alert */
export const MANDI_PRICE_CHANGE_THRESHOLD = 5;

/** Weather thresholds — Open-Meteo, no API key */
export const WEATHER_ALERT_THRESHOLDS = {
  rainChancePercent: 60,
  heavyRainPercent: 80,
  heatTempC: 40,
  highWindKmh: 30,
} as const;

/** Max alerts shown on home */
export const MAX_HOME_ALERTS = 5;

/** Re-check alerts at most once per N ms when app opens */
export const ALERT_CHECK_COOLDOWN_MS = 15 * 60 * 1000;
