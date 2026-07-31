import * as Location from 'expo-location';

import type { LocationData, LocationPermissionStatus } from '@/types/location';

export async function getLocationPermissionStatus(): Promise<LocationPermissionStatus> {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status === Location.PermissionStatus.GRANTED) return 'granted';
  if (status === Location.PermissionStatus.DENIED) return 'denied';
  return 'undetermined';
}

export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === Location.PermissionStatus.GRANTED) return 'granted';
  if (status === Location.PermissionStatus.DENIED) return 'denied';
  return 'undetermined';
}

function buildLocationLabel(address: Location.LocationGeocodedAddress): string {
  const parts = [address.city, address.region, address.country].filter(Boolean);
  return parts.join(', ') || 'Current Location';
}

export async function getCurrentLocation(): Promise<LocationData> {
  const permission = await requestLocationPermission();

  if (permission !== 'granted') {
    throw new Error('Location permission is required for live weather');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = position.coords;

  let label = 'Current Location';
  let city = 'Current Location';
  let region: string | undefined;
  let country: string | undefined;

  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (address) {
      label = buildLocationLabel(address);
      city = address.city ?? address.district ?? address.subregion ?? label;
      region = address.region ?? undefined;
      country = address.country ?? undefined;
    }
  } catch {
    label = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
  }

  return { latitude, longitude, city, region, country, label };
}

export async function watchLocation(
  onUpdate: (location: LocationData) => void,
): Promise<() => void> {
  const permission = await getLocationPermissionStatus();
  if (permission !== 'granted') return () => {};

  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 500,
      timeInterval: 5 * 60 * 1000,
    },
    async (position) => {
      const { latitude, longitude } = position.coords;
      let label = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;

      try {
        const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (address) label = buildLocationLabel(address);
      } catch {
        // keep coordinate label
      }

      onUpdate({ latitude, longitude, city: label, label });
    },
  );

  return () => subscription.remove();
}
