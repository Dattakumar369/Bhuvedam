import { CROPS } from '@/constants/crops';

/** Primary + fallback commodity names for data.gov.in search */
export const CROP_MANDI_SEARCH_TERMS: Record<string, string[]> = {
  rice: ['Paddy(Dhan)(Common)', 'Paddy', 'Rice'],
  wheat: ['Wheat'],
  cotton: ['Cotton'],
  soybean: ['Soyabean', 'Soybean'],
  tomato: ['Tomato'],
  sugarcane: ['Sugarcane'],
  maize: ['Maize'],
  chickpea: ['Bengal Gram(Gram)(Whole)', 'Bengal Gram', 'Gram'],
};

export const CROP_TO_MANDI_COMMODITY: Record<string, string> = Object.fromEntries(
  Object.entries(CROP_MANDI_SEARCH_TERMS).map(([id, terms]) => [id, terms[0]]),
);

/** Baseline modal prices (₹/Quintal) — used for mock & fallback */
export const MANDI_BASELINE_PRICES: Record<string, number> = {
  rice: 2100,
  wheat: 2250,
  cotton: 6200,
  soybean: 4200,
  tomato: 1800,
  sugarcane: 320,
  maize: 1950,
  chickpea: 5100,
};

/** Monthly seasonal index vs annual average (harvest-month peaks) */
export const SEASONAL_PRICE_INDEX: Record<string, number[]> = {
  rice: [1.05, 1.06, 1.02, 0.98, 0.94, 0.9, 0.88, 0.9, 0.95, 1.0, 0.97, 1.04],
  wheat: [1.08, 1.06, 1.02, 0.96, 0.92, 0.9, 0.92, 0.95, 0.98, 1.0, 1.03, 1.06],
  cotton: [0.95, 0.96, 0.98, 1.0, 1.02, 0.98, 0.94, 0.92, 0.96, 1.05, 1.08, 1.02],
  soybean: [1.02, 1.0, 0.98, 0.96, 0.94, 0.92, 0.9, 0.92, 0.96, 1.0, 1.04, 1.06],
  tomato: [1.1, 1.05, 0.95, 0.85, 0.8, 0.82, 0.88, 0.92, 0.98, 1.05, 1.12, 1.15],
  sugarcane: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.02, 1.02],
  maize: [1.04, 1.02, 0.98, 0.94, 0.9, 0.88, 0.9, 0.94, 0.98, 1.02, 1.05, 1.06],
  chickpea: [1.06, 1.04, 1.0, 0.96, 0.92, 0.9, 0.92, 0.96, 1.0, 1.04, 1.06, 1.08],
};

export const MANDI_CROPS = CROPS.filter((c) => CROP_TO_MANDI_COMMODITY[c.id]);

export const DEFAULT_MANDI_STATE = 'Andhra Pradesh';
