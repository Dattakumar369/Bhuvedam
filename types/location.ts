export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends Coordinates {
  city: string;
  region?: string;
  country?: string;
  label: string;
}

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';
