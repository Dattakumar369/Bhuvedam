import { API_CONFIG } from '@/constants/app';
import { getCurrentLocation } from '@/services/location/locationService';
import { fetchOpenMeteoWeather } from '@/services/weather/openMeteoService';
import { weatherRepository } from '@/services/api/repositories';
import type { LocationData } from '@/types/location';
import type { WeatherData } from '@/types/weather';

const USE_BACKEND = process.env.EXPO_PUBLIC_USE_BACKEND_WEATHER === 'true';

async function fetchFromBackend(location: LocationData): Promise<WeatherData> {
  return weatherRepository.getForecast(
    `${location.latitude},${location.longitude}`,
  );
}

async function fetchLiveWeather(location: LocationData): Promise<WeatherData> {
  if (USE_BACKEND) {
    try {
      return await fetchFromBackend(location);
    } catch {
      // fall through to Open-Meteo
    }
  }

  return fetchOpenMeteoWeather(location.latitude, location.longitude, location.label);
}

export async function fetchWeatherForCurrentLocation(): Promise<{
  weather: WeatherData;
  location: LocationData;
}> {
  const location = await getCurrentLocation();
  const weather = await fetchLiveWeather(location);
  return { weather, location };
}

export async function fetchWeatherForCoordinates(
  location: LocationData,
): Promise<WeatherData> {
  return fetchLiveWeather(location);
}

export { API_CONFIG };
