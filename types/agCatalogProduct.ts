export type AgCatalogType = 'fertilizer' | 'pesticide' | 'fungicide';

export interface AgCatalogProduct {
  id: string;
  name: string;
  nameTe?: string | null;
  type: AgCatalogType;
  subType?: string | null;
  brand?: string | null;
  activeIngredient?: string | null;
  npk?: string | null;
  nutrient?: string | null;
  dosage: string;
  crops: string[];
  targetPest?: string | null;
  targetDisease?: string | null;
  applicationMethod?: string | null;
  precautions?: string | null;
  description?: string | null;
  price?: string | null;
  packSize?: string | null;
  image?: string | null;
  source?: string;
  sourceUrl?: string | null;
  isSubsidized?: boolean;
}

export interface AgCatalogFilters {
  search?: string;
  brand?: string;
  crop?: string;
  target?: string;
  category?: string;
  limit?: number;
}
