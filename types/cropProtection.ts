export interface CropGrowthStage {
  id: string;
  name: string;
  nameTe: string;
  daysRange: string;
}

export interface FertilizerRecommendation {
  name: string;
  nameTe: string;
  dose: string;
  method: string;
  timing: string;
  estimatedPrice: string;
  notes?: string;
}

export interface SprayRecommendation {
  id: string;
  productName: string;
  productNameTe: string;
  type: 'insecticide' | 'fungicide' | 'herbicide' | 'bio' | 'fertilizer_foliar';
  target: string;
  targetTe: string;
  dose: string;
  howToSpray: string;
  howToSprayTe: string;
  bestTime: string;
  precautions: string[];
  precautionsTe: string[];
  estimatedPrice: string;
  whereToBuy: string[];
}

export interface CropDisease {
  id: string;
  name: string;
  nameTe: string;
  symptoms: string;
  symptomsTe: string;
  sprays: SprayRecommendation[];
}

export interface CropProtectionGuide {
  cropId: string;
  stages: CropGrowthStage[];
  fertilizersByStage: Record<string, FertilizerRecommendation[]>;
  preventiveSpraysByStage: Record<string, SprayRecommendation[]>;
  diseases: CropDisease[];
}

export interface ProtectionAdviceBundle {
  cropId: string;
  stage?: CropGrowthStage;
  disease?: CropDisease;
  fertilizers: FertilizerRecommendation[];
  sprays: SprayRecommendation[];
}
