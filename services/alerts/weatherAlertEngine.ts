import { WEATHER_ALERT_THRESHOLDS } from '@/constants/alertConfig';
import { tNotif } from '@/constants/notificationCopy';
import { useLanguageStore } from '@/store/languageStore';
import type { FarmAlert } from '@/types/alerts';
import type { WeatherData } from '@/types/weather';
import { generateId } from '@/utils/format';

export function buildWeatherAlerts(data: WeatherData | null): FarmAlert[] {
  if (!data) return [];

  const lang = useLanguageStore.getState().language;
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
      title: tNotif(lang, 'heavyRainTitle'),
      body: tNotif(lang, 'heavyRainBody', { rain: maxRain }),
      createdAt: now,
      read: false,
      data: { rainPercent: maxRain },
    });
  } else if (maxRain >= WEATHER_ALERT_THRESHOLDS.rainChancePercent) {
    alerts.push({
      id: generateId(),
      type: 'weather_rain',
      severity: 'warning',
      title: tNotif(lang, 'rainTitle'),
      body: tNotif(lang, 'rainBody', { rain: maxRain }),
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
      title: tNotif(lang, 'heatTitle'),
      body: tNotif(lang, 'heatBody', { temp: current.temperature }),
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
      title: tNotif(lang, 'windTitle'),
      body: tNotif(lang, 'windBody', { wind: maxWind.toFixed(0) }),
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
      title: tNotif(lang, 'tomorrowRainTitle', { day: tomorrow.day }),
      body: tNotif(lang, 'tomorrowRainBody', {
        high: tomorrow.high,
        low: tomorrow.low,
        rain: tomorrow.precipitation,
      }),
      createdAt: now,
      read: false,
      data: { day: tomorrow.day },
    });
  }

  return alerts;
}
