import type { HourlyForecast, WeatherCondition, WeatherData } from '@/types/weather';
import { formatCalendarDate } from '@/utils/weatherForecast';

function buildFullDayHourly(dayOffset: number): HourlyForecast[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() + dayOffset);

  return Array.from({ length: 24 }, (_, h) => {
    const slot = new Date(base);
    slot.setHours(h);
    const condition: WeatherCondition =
      h < 6 || h > 20 ? 'clear' : h % 4 === 0 ? 'partlyCloudy' : 'clear';
    return {
      isoTime: slot.toISOString(),
      time: slot.toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true }),
      temperature: 20 + Math.round(8 * Math.sin(((h - 6) / 12) * Math.PI)),
      condition,
      precipitation: h >= 18 && dayOffset === 0 ? 35 : 10,
    };
  });
}

function buildDailyForecast() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const iso = date.toISOString().slice(0, 10);
    return {
      date: iso,
      day,
      dateLabel: formatCalendarDate(iso),
      high: 32 + (i % 3),
      low: 22 + (i % 2),
      condition: (['clear', 'partlyCloudy', 'rain', 'cloudy', 'clear', 'partlyCloudy', 'rain'] as const)[i] ?? 'clear',
      precipitation: [10, 20, 60, 30, 5, 15, 45][i] ?? 10,
      humidity: [55, 60, 70, 65, 50, 58, 72][i] ?? 60,
    };
  });
}

function buildHourlyByDate(): Record<string, HourlyForecast[]> {
  const daily = buildDailyForecast();
  const map: Record<string, HourlyForecast[]> = {};
  daily.forEach((d, i) => {
    map[d.date] = buildFullDayHourly(i);
  });
  return map;
}

const hourlyByDate = buildHourlyByDate();
const dailyForecast = buildDailyForecast();
const todayKey = dailyForecast[0]?.date ?? '';
const todayFull = hourlyByDate[todayKey] ?? [];
const currentHour = new Date().getHours();
const hourlyToday = todayFull.filter(
  (item) => item.isoTime && new Date(item.isoTime).getHours() >= currentHour,
);

export const mockWeatherData: WeatherData = {
  location: 'Pune, Maharashtra',
  current: {
    temperature: 28,
    feelsLike: 31,
    condition: 'partlyCloudy',
    humidity: 62,
    windSpeed: 12,
    pressure: 1013,
    visibility: 10,
    uvIndex: 6,
    precipitation: 25,
  },
  hourly: hourlyToday.length ? hourlyToday : todayFull,
  hourlyByDate,
  daily: dailyForecast,
  agricultureTip:
    'Moderate humidity and partly cloudy skies are ideal for foliar fertilizer application. Avoid spraying if rain probability exceeds 40% in the next 6 hours.',
  updatedAt: new Date().toISOString(),
};

export async function fetchMockWeather(): Promise<WeatherData> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { ...mockWeatherData, updatedAt: new Date().toISOString() };
}
