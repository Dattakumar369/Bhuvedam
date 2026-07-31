import type { WeatherCondition, WeatherData } from '@/types/weather';

/** WMO Weather interpretation codes → app condition */
export function mapWeatherCode(code: number): WeatherCondition {
  if (code === 0) return 'clear';
  if (code >= 1 && code <= 3) return 'partlyCloudy';
  if (code >= 45 && code <= 48) return 'fog';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 95 && code <= 99) return 'thunderstorm';
  if (code >= 4 && code <= 44) return 'cloudy';
  return 'cloudy';
}

export function generateAgricultureTip(data: WeatherData): string {
  const { current, daily } = data;
  const rainToday = daily[0]?.precipitation ?? current.precipitation;

  if (current.condition === 'rain' || rainToday > 60) {
    return 'Heavy rain expected — postpone pesticide spraying and ensure field drainage is clear. Cover stored grain and delay harvesting if possible.';
  }
  if (current.uvIndex >= 7) {
    return 'High UV levels today — schedule field work in early morning or late evening. Ensure adequate irrigation to reduce heat stress on crops.';
  }
  if (current.humidity > 75 && current.temperature > 30) {
    return 'High humidity and warm temperatures increase fungal disease risk. Monitor crops for blight and ensure good air circulation in greenhouses.';
  }
  if (current.windSpeed > 25) {
    return 'Strong winds today — avoid foliar spraying as drift will reduce effectiveness. Secure greenhouse covers and young plant supports.';
  }
  if (current.condition === 'clear' && current.precipitation < 20) {
    return 'Clear skies with low rain chance — ideal for field operations, harvesting, and fertilizer application. Monitor soil moisture levels.';
  }
  return 'Moderate conditions today — suitable for routine farm activities. Check soil moisture before irrigation and monitor local pest advisories.';
}

interface OpenMeteoCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation_probability: number;
  wind_speed_10m: number;
  surface_pressure: number;
  uv_index: number;
  weather_code: number;
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    relative_humidity_2m_mean: number[];
  };
}

function formatHourLabel(isoTime: string): string {
  const date = new Date(isoTime);
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true });
}

function formatDayLabel(isoTime: string): string {
  return new Date(isoTime).toLocaleDateString('en-IN', { weekday: 'short' });
}

export async function fetchOpenMeteoWeather(
  latitude: number,
  longitude: number,
  locationLabel: string,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'wind_speed_10m',
      'surface_pressure',
      'uv_index',
      'weather_code',
    ].join(','),
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,relative_humidity_2m_mean',
    timezone: 'auto',
    forecast_days: '7',
    wind_speed_unit: 'kmh',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Weather service unavailable');
  }

  const json = (await response.json()) as OpenMeteoResponse;
  const { current, hourly, daily } = json;

  const now = new Date();
  const currentHour = now.getHours();
  const hourlySlice = hourly.time
    .map((time, index) => ({
      time,
      hour: new Date(time).getHours(),
      temperature: hourly.temperature_2m[index] ?? 0,
      precipitation: hourly.precipitation_probability[index] ?? 0,
      weatherCode: hourly.weather_code[index] ?? 0,
    }))
    .filter((item) => item.hour >= currentHour)
    .slice(0, 6);

  const weatherData: WeatherData = {
    location: locationLabel,
    current: {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      condition: mapWeatherCode(current.weather_code),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      pressure: Math.round(current.surface_pressure),
      visibility: 10,
      uvIndex: Math.round(current.uv_index),
      precipitation: Math.round(current.precipitation_probability),
    },
    hourly: hourlySlice.map((item) => ({
      time: formatHourLabel(item.time),
      temperature: Math.round(item.temperature),
      condition: mapWeatherCode(item.weatherCode),
      precipitation: Math.round(item.precipitation),
    })),
    daily: daily.time.map((date, index) => ({
      date,
      day: formatDayLabel(date),
      high: Math.round(daily.temperature_2m_max[index] ?? 0),
      low: Math.round(daily.temperature_2m_min[index] ?? 0),
      condition: mapWeatherCode(daily.weather_code[index] ?? 0),
      precipitation: Math.round(daily.precipitation_probability_max[index] ?? 0),
      humidity: Math.round(daily.relative_humidity_2m_mean[index] ?? 0),
    })),
    agricultureTip: '',
    updatedAt: new Date().toISOString(),
  };

  weatherData.agricultureTip = generateAgricultureTip(weatherData);
  return weatherData;
}
