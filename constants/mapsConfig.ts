/** Google Maps SDK (Android map tiles) + Places API — same key usually works for both. */
export function getGoogleMapsApiKey(): string {
  return process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';
}

export function getGooglePlacesApiKey(): string {
  return (
    process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    ''
  );
}

export function isGoogleMapsConfigured(): boolean {
  return getGoogleMapsApiKey().length > 0;
}

export function isGooglePlacesConfigured(): boolean {
  return getGooglePlacesApiKey().length > 0;
}
