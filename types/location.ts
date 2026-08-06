export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends Coordinates {
  city: string;
  region?: string;
  country?: string;
  label: string;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
  source?: 'expo' | 'nominatim' | 'geoapify';
}

export interface ReverseGeocodeResult extends LocationData {
  source: 'nominatim' | 'expo' | 'geoapify';
}

export interface PlaceSearchResult {
  label: string;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
  latitude: number;
  longitude: number;
}

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';
