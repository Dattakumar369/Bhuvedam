import { create } from 'zustand';

import { fetchWeatherForCurrentLocation } from '@/services/weather/weatherService';
import type { LocationData, LocationPermissionStatus } from '@/types/location';
import type { WeatherData } from '@/types/weather';

interface WeatherState {
  data: WeatherData | null;
  location: LocationData | null;
  permissionStatus: LocationPermissionStatus;
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
  fetchWeather: (force?: boolean) => Promise<void>;
  refreshWeather: () => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  data: null,
  location: null,
  permissionStatus: 'undetermined',
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchWeather: async (force = false) => {
    if (!force && get().data) return;

    set({ isLoading: true, error: null });

    try {
      const { weather, location } = await fetchWeatherForCurrentLocation();
      set({
        data: weather,
        location,
        permissionStatus: 'granted',
        isLoading: false,
        lastFetched: new Date().toISOString(),
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load weather data';

      const isPermissionError = message.toLowerCase().includes('permission');

      set({
        isLoading: false,
        error: message,
        permissionStatus: isPermissionError ? 'denied' : get().permissionStatus,
      });
    }
  },

  refreshWeather: async () => {
    await get().fetchWeather(true);
  },
}));
