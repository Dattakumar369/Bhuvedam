import { WEATHER_ALERT_THRESHOLDS } from '@/constants/alertConfig';
import type { FarmAlert } from '@/types/alerts';
import type { WeatherData } from '@/types/weather';
import { generateId } from '@/utils/format';

export function buildWeatherAlerts(data: WeatherData | null): FarmAlert[] {
  if (!data) return [];

  const alerts: FarmAlert[] = [];
  const now = new Date().toISOString();
  const { current, daily, hourly } = data;

  const nextHours = hourly.slice(0, 8);
  const maxRain = Math.max(current.precipitation, ...nextHours.map((h) => h.precipitation));
  const maxWind = current.windSpeed;

  if (maxRain >= WEATHER_ALERT_THRESHOLDS.heavyRainPercent) {
    alerts.push({
      id: generateId(),
      type: 'weather_rain',
      severity: 'urgent',
      title: '⛈️ Heavy rain expected',
      body: `Next few hours ${maxRain}% rain chance — spray cheyakandi, fertilizer postpone cheyandi.`,
      createdAt: now,
      read: false,
      data: { rainPercent: maxRain },
    });
  } else if (maxRain >= WEATHER_ALERT_THRESHOLDS.rainChancePercent) {
    alerts.push({
      id: generateId(),
      type: 'weather_rain',
      severity: 'warning',
      title: '🌧️ Rain possible today',
      body: `${maxRain}% rain chance — pesticide spray ki manchidi kaadu. Irrigation plan check cheyandi.`,
      createdAt: now,
      read: false,
      data: { rainPercent: maxRain },
    });
  }

  if (current.temperature >= WEATHER_ALERT_THRESHOLDS.heatTempC) {
    alerts.push({
      id: generateId(),
      type: 'weather_heat',
      severity: 'warning',
      title: '🌡️ High temperature',
      body: `Current ${current.temperature}°C — midday spray avoid cheyandi, irrigation morning/evening.`,
      createdAt: now,
      read: false,
      data: { tempC: current.temperature },
    });
  }

  if (maxWind >= WEATHER_ALERT_THRESHOLDS.highWindKmh) {
    alerts.push({
      id: generateId(),
      type: 'weather_wind',
      severity: 'info',
      title: '💨 Strong wind',
      body: `Wind ${maxWind.toFixed(0)} km/h — spraying effective kaadu.`,
      createdAt: now,
      read: false,
      data: { windKmh: maxWind },
    });
  }

  const tomorrow = daily[1];
  if (tomorrow && tomorrow.precipitation >= WEATHER_ALERT_THRESHOLDS.heavyRainPercent) {
    alerts.push({
      id: generateId(),
      type: 'weather_rain',
      severity: 'info',
      title: `🌧️ ${tomorrow.day}: rain expected`,
      body: `Repu ${tomorrow.high}°/${tomorrow.low}°C, rain ${tomorrow.precipitation}% — field work plan mundu cheyandi.`,
      createdAt: now,
      read: false,
      data: { day: tomorrow.day },
    });
  }

  return alerts;
}
