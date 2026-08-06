/** Curated AP & Telangana mandi markets and ag shops — offline fallback when API unavailable. */
export interface CuratedAgPlace {
  placeType: 'mandi' | 'fertilizer_shop' | 'seed_shop' | 'dealer';
  name: string;
  district: string;
  state: string;
  address?: string;
  latitude: number;
  longitude: number;
  phone?: string;
}

export const CURATED_AG_PLACES: CuratedAgPlace[] = [
  {
    placeType: 'mandi',
    name: 'Guntur APMC',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    latitude: 16.3067,
    longitude: 80.4365,
  },
  {
    placeType: 'mandi',
    name: 'Vijayawada Nunna APMC',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    latitude: 16.5193,
    longitude: 80.6305,
  },
  {
    placeType: 'mandi',
    name: 'Kurnool APMC',
    district: 'Kurnool',
    state: 'Andhra Pradesh',
    latitude: 15.8281,
    longitude: 78.0373,
  },
  {
    placeType: 'mandi',
    name: 'Tirupati APMC',
    district: 'Chittoor',
    state: 'Andhra Pradesh',
    latitude: 13.6288,
    longitude: 79.4192,
  },
  {
    placeType: 'mandi',
    name: 'Nellore APMC',
    district: 'SPSR Nellore',
    state: 'Andhra Pradesh',
    latitude: 14.4426,
    longitude: 79.9865,
  },
  {
    placeType: 'mandi',
    name: 'Warangal APMC',
    district: 'Warangal',
    state: 'Telangana',
    latitude: 17.9689,
    longitude: 79.5941,
  },
  {
    placeType: 'mandi',
    name: 'Karimnagar APMC',
    district: 'Karimnagar',
    state: 'Telangana',
    latitude: 18.4386,
    longitude: 79.1288,
  },
  {
    placeType: 'mandi',
    name: 'Nizamabad APMC',
    district: 'Nizamabad',
    state: 'Telangana',
    latitude: 18.6725,
    longitude: 78.0941,
  },
  {
    placeType: 'mandi',
    name: 'Hyderabad Bowenpally Market Yard',
    district: 'Hyderabad',
    state: 'Telangana',
    latitude: 17.4584,
    longitude: 78.4189,
  },
  {
    placeType: 'fertilizer_shop',
    name: 'IFFCO Dealer — Guntur',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    address: 'Arundelpet, Guntur',
    latitude: 16.306,
    longitude: 80.44,
  },
  {
    placeType: 'fertilizer_shop',
    name: 'PACS Fertilizer — Tenali',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    latitude: 16.2428,
    longitude: 80.6404,
  },
  {
    placeType: 'fertilizer_shop',
    name: 'Rythu Bharosa Kendra — Vijayawada',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    latitude: 16.5062,
    longitude: 80.648,
  },
  {
    placeType: 'fertilizer_shop',
    name: 'Agri Input Dealer — Kurnool',
    district: 'Kurnool',
    state: 'Andhra Pradesh',
    latitude: 15.8285,
    longitude: 78.042,
  },
  {
    placeType: 'fertilizer_shop',
    name: 'Telangana Markfed — Warangal',
    district: 'Warangal',
    state: 'Telangana',
    latitude: 17.975,
    longitude: 79.6,
  },
  {
    placeType: 'dealer',
    name: 'Seed & Pesticide Dealer — Karimnagar',
    district: 'Karimnagar',
    state: 'Telangana',
    latitude: 18.44,
    longitude: 79.13,
  },
];
