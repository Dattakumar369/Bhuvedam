import type { WeatherData } from '@/types/weather';

function buildHourlyForecast() {
  const hours = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
  const temps = [22, 26, 32, 34, 28, 24];
  const conditions = ['clear', 'clear', 'partlyCloudy', 'partlyCloudy', 'cloudy', 'rain'] as const;
  return hours.map((time, i) => ({
    time,
    temperature: temps[i] ?? 25,
    condition: conditions[i] ?? 'clear',
    precipitation: i === 5 ? 40 : 10,
  }));
}

function buildDailyForecast() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    date: new Date(Date.now() + i * 86400000).toISOString(),
    day,
    high: 32 + (i % 3),
    low: 22 + (i % 2),
    condition: (['clear', 'partlyCloudy', 'rain', 'cloudy', 'clear', 'partlyCloudy', 'rain'] as const)[i] ?? 'clear',
    precipitation: [10, 20, 60, 30, 5, 15, 45][i] ?? 10,
    humidity: [55, 60, 70, 65, 50, 58, 72][i] ?? 60,
  }));
}

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
  hourly: buildHourlyForecast(),
  daily: buildDailyForecast(),
  agricultureTip:
    'Moderate humidity and partly cloudy skies are ideal for foliar fertilizer application. Avoid spraying if rain probability exceeds 40% in the next 6 hours.',
  updatedAt: new Date().toISOString(),
};

export async function fetchMockWeather(): Promise<WeatherData> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { ...mockWeatherData, updatedAt: new Date().toISOString() };
}
