import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { fetchNearbyPlaces } from '@/services/geo/nearbyPlacesService';
import { requestLocationPermission } from '@/services/location/locationService';
import type { NearbyPlace, NearbyPlaceFilter } from '@/types/nearbyPlace';

interface NearbyPlacesState {
  places: NearbyPlace[];
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;
  isLoading: boolean;
  error: string | null;
  filter: NearbyPlaceFilter;
  setFilter: (filter: NearbyPlaceFilter) => void;
  refresh: () => Promise<void>;
}

export function useNearbyPlaces(): NearbyPlacesState {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NearbyPlaceFilter>('all');

  const resolveLocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    const perm = await requestLocationPermission();
    if (perm !== 'granted') {
      setError('Location permission ivvandi — daggaralo unna mandi/shops chupistam.');
      return null;
    }

    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    setLatitude(lat);
    setLongitude(lng);

    try {
      const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const label = [geo?.city ?? geo?.district, geo?.region].filter(Boolean).join(', ');
      setLocationLabel(label || 'Current location');
    } catch {
      setLocationLabel('Current location');
    }

    return { lat, lng };
  }, []);

  const loadPlaces = useCallback(async (lat: number, lng: number, activeFilter: NearbyPlaceFilter) => {
    const results = await fetchNearbyPlaces(lat, lng, activeFilter);
    setPlaces(results);
    if (!results.length) {
      setError('50 km lopala mandi/shops kanipinchatam ledu — location change chesi try cheyandi.');
    } else {
      setError(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let lat = latitude;
      let lng = longitude;
      if (lat == null || lng == null) {
        const coords = await resolveLocation();
        if (!coords) return;
        lat = coords.lat;
        lng = coords.lng;
      }
      await loadPlaces(lat, lng, filter);
    } catch {
      setError('Location raaledu — GPS ON unda chudandi.');
    } finally {
      setIsLoading(false);
    }
  }, [filter, latitude, longitude, loadPlaces, resolveLocation]);

  useEffect(() => {
    void refresh();
    // Initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    setIsLoading(true);
    void loadPlaces(latitude, longitude, filter).finally(() => setIsLoading(false));
  }, [filter, latitude, longitude, loadPlaces]);

  return {
    places,
    latitude,
    longitude,
    locationLabel,
    isLoading,
    error,
    filter,
    setFilter,
    refresh,
  };
}
