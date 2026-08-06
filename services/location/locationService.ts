import * as Location from 'expo-location';

import { reverseGeocodeNominatim } from '@/services/geo/nominatimService';
import type {
  LocationData,
  LocationPermissionStatus,
  ReverseGeocodeResult,
} from '@/types/location';

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

function fromExpoAddress(
  latitude: number,
  longitude: number,
  address: Location.LocationGeocodedAddress,
): ReverseGeocodeResult {
  const label = buildLocationLabel(address);
  return {
    latitude,
    longitude,
    label,
    city: address.city ?? address.district ?? address.subregion ?? label,
    region: address.region ?? undefined,
    country: address.country ?? undefined,
    district: address.district ?? address.subregion ?? undefined,
    state: address.region ?? undefined,
    source: 'expo',
  };
}

function coordinateFallback(latitude: number, longitude: number): LocationData {
  const label = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
  return { latitude, longitude, city: label, label };
}

/** Nominatim (OSM) first for Indian village names; Expo geocoder as fallback. */
export async function reverseGeocodeFromGps(
  coords: { latitude: number; longitude: number },
): Promise<LocationData> {
  const nominatim = await reverseGeocodeNominatim(coords);
  if (nominatim?.label) return nominatim;

  try {
    const [address] = await Location.reverseGeocodeAsync(coords);
    if (address) return fromExpoAddress(coords.latitude, coords.longitude, address);
  } catch {
    // fall through
  }

  return coordinateFallback(coords.latitude, coords.longitude);
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
  return reverseGeocodeFromGps({ latitude, longitude });
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
      const location = await reverseGeocodeFromGps({ latitude, longitude });
      onUpdate(location);
    },
  );

  return () => subscription.remove();
}
