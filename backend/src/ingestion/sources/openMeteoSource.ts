import { db } from '../../db';
import { weather } from '../../db/schema';
import { fetchJson } from '../utils';

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    surface_pressure?: number;
    precipitation?: number;
    weather_code?: number;
  };
  hourly?: { time?: string[]; temperature_2m?: number[] };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
  };
};

function weatherCodeToCondition(code?: number): 'clear' | 'rain' | 'cloudy' | 'partlyCloudy' {
  if (code == null) return 'clear';
  if (code <= 1) return 'clear';
  if (code <= 3) return 'partlyCloudy';
  if (code <= 48) return 'cloudy';
  return 'rain';
}

export async function syncWeatherAtPoint(
  lat: number,
  lon: number,
  locationName: string,
): Promise<boolean> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code` +
    `&hourly=temperature_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  try {
    const json = await fetchJson<OpenMeteoResponse>(url);
    const c = json.current;

    await db.insert(weather).values({
      locationName,
      latitude: String(lat),
      longitude: String(lon),
      temperature: c?.temperature_2m != null ? String(c.temperature_2m) : undefined,
      feelsLike: c?.apparent_temperature != null ? String(c.apparent_temperature) : undefined,
      condition: weatherCodeToCondition(c?.weather_code),
      humidity: c?.relative_humidity_2m ?? undefined,
      windSpeed: c?.wind_speed_10m != null ? String(c.wind_speed_10m) : undefined,
      pressure: c?.surface_pressure != null ? String(c.surface_pressure) : undefined,
      precipitation: c?.precipitation != null ? Math.round(c.precipitation) : undefined,
      hourly: [json.hourly ?? {}],
      daily: [json.daily ?? {}],
      agricultureTip: 'Synced from Open-Meteo — use for irrigation & spray timing.',
    });

    return true;
  } catch {
    return false;
  }
}

export async function syncGlobalWeather(): Promise<{ fetched: number; upserted: number }> {
  const locations: [number, number, string][] = [
    [17.38, 78.48, 'Hyderabad, India'],
    [28.61, 77.21, 'Delhi, India'],
    [19.08, 72.88, 'Mumbai, India'],
    [13.08, 80.27, 'Chennai, India'],
    [-23.55, -46.63, 'São Paulo, Brazil'],
    [41.88, -87.63, 'Chicago, USA'],
  ];

  let upserted = 0;
  for (const [lat, lon, name] of locations) {
    if (await syncWeatherAtPoint(lat, lon, name)) upserted++;
  }

  return { fetched: locations.length, upserted };
}
