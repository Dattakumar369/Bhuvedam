import type { HourlyForecast, WeatherData } from '@/types/weather';

/** Avoid timezone shift when parsing date-only strings from Open-Meteo */
export function parseForecastDate(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00`);
}

export function formatCalendarDate(isoDate: string): string {
  return parseForecastDate(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export function getTodayDateKey(data: WeatherData): string {
  return data.daily[0]?.date ?? new Date().toISOString().slice(0, 10);
}

export function getHourlyForDate(data: WeatherData, dateKey: string): HourlyForecast[] {
  const fromMap = data.hourlyByDate?.[dateKey];
  if (fromMap?.length) return fromMap;

  const todayKey = getTodayDateKey(data);
  if (dateKey === todayKey) return data.hourly;

  return [];
}

export function hourlySectionTitle(data: WeatherData, dateKey: string): string {
  const day = data.daily.find((d) => d.date === dateKey);
  const todayKey = getTodayDateKey(data);
  if (dateKey === todayKey) return 'Hourly Forecast · Today';
  if (day) return `Hourly Forecast · ${day.day}, ${day.dateLabel}`;
  return 'Hourly Forecast';
}
