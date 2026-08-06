export type NearbyPlaceSource = 'google' | 'database';

export interface NearbyPlace {
  id: string;
  placeType: string;
  name: string;
  district?: string;
  state?: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  phone?: string | null;
  distanceKm: number;
  source: NearbyPlaceSource;
}

export type NearbyPlaceFilter = 'mandi' | 'shop' | 'all';
