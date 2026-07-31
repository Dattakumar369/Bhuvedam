export type FertilizerCategory =
  | 'Nitrogen'
  | 'Phosphatic'
  | 'Potassic'
  | 'NPK Complex'
  | 'Bio-fertilizer'
  | 'Micronutrient'
  | 'Organic'
  | 'Nano'
  | 'all';

export interface FertilizerProduct {
  id: string;
  name: string;
  nameTe?: string | null;
  brand: string;
  category: string;
  npk?: string | null;
  nutrient?: string | null;
  dosage?: string | null;
  benefits?: string | null;
  crops: string[];
  seasons?: string[];
  application?: string[];
  applicationMethod?: string | null;
  precautions?: string | null;
  mrp?: string | null;
  packSize?: string | null;
  image?: string | null;
  source?: string;
  sourceUrl?: string | null;
  isSubsidized?: boolean;
}

export interface FertilizerProductFilters {
  search?: string;
  category?: FertilizerCategory;
  brand?: string;
  crop?: string;
  limit?: number;
}
