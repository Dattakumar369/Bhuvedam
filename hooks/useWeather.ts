import { useCallback } from 'react';

import { useWeatherStore } from '@/store/weatherStore';

export function useWeather() {
  const data = useWeatherStore((s) => s.data);
  const location = useWeatherStore((s) => s.location);
  const permissionStatus = useWeatherStore((s) => s.permissionStatus);
  const isLoading = useWeatherStore((s) => s.isLoading);
  const error = useWeatherStore((s) => s.error);
  const lastFetched = useWeatherStore((s) => s.lastFetched);
  const fetchWeather = useWeatherStore((s) => s.fetchWeather);
  const refreshWeather = useWeatherStore((s) => s.refreshWeather);

  const load = useCallback(() => {
    void fetchWeather();
  }, [fetchWeather]);

  const refresh = useCallback(async () => {
    await refreshWeather();
  }, [refreshWeather]);

  const retryWithLocation = useCallback(() => {
    void fetchWeather(true);
  }, [fetchWeather]);

  return {
    data,
    location,
    permissionStatus,
    isLoading,
    error,
    lastFetched,
    load,
    refresh,
    retryWithLocation,
  };
}
