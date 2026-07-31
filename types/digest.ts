export type DigestCategory = 'market' | 'global' | 'pest' | 'research';

export interface DigestItem {
  id: string;
  category: DigestCategory;
  type: string;
  title: string;
  summary: string | null;
  url: string | null;
  cropTags: string[];
  region: string;
  updatedAt: string;
}

export interface DailyDigestResponse {
  items: DigestItem[];
  updatedAt: string;
  totalCropsInDb: number;
  source: string;
}

export interface CropIncomeEstimate {
  cropId: string;
  cropName: string;
  areaAcres: number;
  modalPricePerQtl: number;
  estimatedYieldQtlPerAcre: number;
  grossIncome: number;
  priceSource: 'live_mandi' | 'baseline';
  market: string | null;
}
