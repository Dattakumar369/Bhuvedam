import { useCallback } from 'react';

import type { VarietyEntry } from '@/constants/cropVarieties';
import { useMandiStore } from '@/store/mandiStore';

export function useMandiRates() {
  const rates = useMandiStore((s) => s.rates);
  const analytics = useMandiStore((s) => s.analytics);
  const forecasts = useMandiStore((s) => s.forecasts);
  const selectedCropId = useMandiStore((s) => s.selectedCropId);
  const selectedVarietyId = useMandiStore((s) => s.selectedVarietyId);
  const forecastMonths = useMandiStore((s) => s.forecastMonths);
  const source = useMandiStore((s) => s.source);
  const isLoading = useMandiStore((s) => s.isLoading);
  const error = useMandiStore((s) => s.error);
  const lastFetched = useMandiStore((s) => s.lastFetched);
  const fetchRates = useMandiStore((s) => s.fetchRates);
  const refreshRates = useMandiStore((s) => s.refreshRates);
  const setSelectedCrop = useMandiStore((s) => s.setSelectedCrop);
  const setSelectedVariety = useMandiStore((s) => s.setSelectedVariety);
  const setForecastMonths = useMandiStore((s) => s.setForecastMonths);
  const getVarietyList = useMandiStore((s) => s.getVarietyList);
  const getAnalyticsForCrop = useMandiStore((s) => s.getAnalyticsForCrop);
  const getSelectedAnalytics = useMandiStore((s) => s.getSelectedAnalytics);
  const getSelectedForecast = useMandiStore((s) => s.getSelectedForecast);

  const load = useCallback(() => {
    void fetchRates();
  }, [fetchRates]);

  const refresh = useCallback(async () => {
    await refreshRates();
  }, [refreshRates]);

  const varietyList: VarietyEntry[] = getVarietyList(selectedCropId);

  return {
    rates,
    analytics,
    forecasts,
    selectedCropId,
    selectedVarietyId,
    forecastMonths,
    source,
    isLoading,
    error,
    lastFetched,
    load,
    refresh,
    setSelectedCrop,
    setSelectedVariety,
    setForecastMonths,
    varietyList,
    cropAnalytics: getAnalyticsForCrop(selectedCropId),
    selectedAnalytics: getSelectedAnalytics(),
    selectedForecast: getSelectedForecast(),
  };
}
