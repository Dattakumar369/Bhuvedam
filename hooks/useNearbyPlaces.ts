import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { fetchNearbyPlaces } from '@/services/geo/nearbyPlacesService';
import { requestLocationPermission } from '@/services/location/locationService';
import type { NearbyPlace, NearbyPlaceFilter } from '@/types/nearbyPlace';

const GPS_TIMEOUT_MS = 12000;

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

async function readPosition(): Promise<Location.LocationObject | null> {
  try {
    return await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), GPS_TIMEOUT_MS)),
    ]);
  } catch {
    return null;
  }
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

    let pos = await readPosition();
    if (!pos) {
      try {
        pos = await Location.getLastKnownPositionAsync();
      } catch {
        pos = null;
      }
    }
    if (!pos) {
      setError('Location raaledu — GPS ON unda chudandi.');
      return null;
    }

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
      setError('120 km lopala mandi/shops kanipinchatam ledu — location change chesi try cheyandi.');
    } else {
      setError(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Always re-read GPS on refresh — stale coords are a common empty-list cause.
      const coords = await resolveLocation();
      if (!coords) return;
      await loadPlaces(coords.lat, coords.lng, filter);
    } catch {
      setError('Location raaledu — GPS ON unda chudandi.');
    } finally {
      setIsLoading(false);
    }
  }, [filter, loadPlaces, resolveLocation]);

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
