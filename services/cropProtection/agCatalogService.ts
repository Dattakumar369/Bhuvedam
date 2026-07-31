import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type {
  CropDisease,
  FertilizerRecommendation,
  SprayRecommendation,
} from '@/types/cropProtection';

export interface DbAgProduct {
  id: string;
  name: string;
  nameTe?: string | null;
  type: string;
  subType?: string | null;
  brand?: string | null;
  activeIngredient?: string | null;
  nutrientComposition?: string | null;
  npkRatio?: string | null;
  dosage: string;
  crops: string[];
  soilTypes: string[];
  growthStages: string[];
  deficiencySymptoms?: string[];
  targetPest?: string | null;
  targetDisease?: string | null;
  applicationMethod?: string | null;
  precautions?: string | null;
  description?: string | null;
  price?: string | null;
  image?: string | null;
  source: string;
}

export interface DbCropDisease {
  id: string;
  name: string;
  nameTe?: string | null;
  cropId: string;
  category: string;
  pathogen?: string | null;
  symptoms: string;
  deficiencySymptoms?: string[];
  treatment?: string | null;
  prevention?: string | null;
  growthStage?: string | null;
  soilTypes?: string[];
  image?: string | null;
  source: string;
}

export interface BulkCatalogStats {
  pesticides: number;
  fungicides: number;
  fertilizers: number;
  diseases: number;
  crops: number;
}

function unwrapList<T>(body: { data?: T[]; count?: number }): T[] {
  return body.data ?? [];
}

function mapFertilizer(p: DbAgProduct): FertilizerRecommendation {
  const deficiency = p.deficiencySymptoms?.length
    ? `Deficiency signs: ${p.deficiencySymptoms.slice(0, 3).join('; ')}`
    : undefined;
  const soil = p.soilTypes.length ? `Soils: ${p.soilTypes.slice(0, 3).join(', ')}` : undefined;
  const notes = [p.nutrientComposition, p.npkRatio ? `NPK ${p.npkRatio}` : null, deficiency, soil]
    .filter(Boolean)
    .join(' · ');

  return {
    name: p.name,
    nameTe: p.nameTe ?? p.name,
    dose: p.dosage,
    method: p.applicationMethod ?? 'As per soil test',
    timing: p.growthStages.slice(0, 2).join(', ') || 'crop stage',
    estimatedPrice: p.price ?? '₹250–1800',
    notes: notes || undefined,
  };
}

function mapSpray(p: DbAgProduct): SprayRecommendation {
  const type =
    p.type === 'fungicide'
      ? 'fungicide'
      : p.subType === 'herbicide'
        ? 'herbicide'
        : 'insecticide';
  const target = p.targetPest ?? p.targetDisease ?? p.activeIngredient ?? 'pests/diseases';

  return {
    id: p.id,
    productName: p.name,
    productNameTe: p.nameTe ?? p.name,
    type,
    target,
    targetTe: target,
    dose: p.dosage,
    howToSpray: p.applicationMethod ?? `Spray ${p.dosage}`,
    howToSprayTe: p.applicationMethod ?? `Spray ${p.dosage}`,
    bestTime: p.growthStages[0] ?? 'early morning or evening',
    precautions: p.precautions ? [p.precautions] : ['Follow label PHI & PPE'],
    precautionsTe: p.precautions ? [p.precautions] : ['Label PHI & PPE follow cheyandi'],
    estimatedPrice: p.price ?? '₹350–1500',
    whereToBuy: p.brand ? [p.brand, 'Local agri dealer', 'FPO store'] : ['Local agri dealer'],
  };
}

function mapDisease(d: DbCropDisease, sprays: SprayRecommendation[]): CropDisease {
  return {
    id: d.id,
    name: d.name,
    nameTe: d.nameTe ?? d.name,
    symptoms: d.symptoms,
    symptomsTe: d.symptoms,
    sprays,
  };
}

export const agCatalogService = {
  async getStats(): Promise<BulkCatalogStats | null> {
    try {
      const res = await apiClient.get(ENDPOINTS.bulkCatalog.stats);
      return (res.data as { data: BulkCatalogStats }).data ?? null;
    } catch {
      return null;
    }
  },

  async getProducts(params: {
    type: 'fertilizer' | 'pesticide' | 'fungicide';
    cropId: string;
    growthStage?: string;
    soilType?: string;
    limit?: number;
  }): Promise<DbAgProduct[]> {
    const res = await apiClient.get(ENDPOINTS.agProducts.list, {
      params: {
        type: params.type,
        crop: params.cropId,
        growthStage: params.growthStage,
        soilType: params.soilType,
        limit: params.limit ?? 50,
      },
    });
    return unwrapList<DbAgProduct>(res.data);
  },

  async getDiseases(params: {
    cropId: string;
    search?: string;
    limit?: number;
  }): Promise<DbCropDisease[]> {
    const res = await apiClient.get(ENDPOINTS.cropDiseases.list, {
      params: {
        crop: params.cropId,
        search: params.search,
        limit: params.limit ?? 100,
      },
    });
    return unwrapList<DbCropDisease>(res.data);
  },

  mapFertilizer,
  mapSpray,
  mapDisease,

  async getAdviceForStage(
    cropId: string,
    growthStage: string,
  ): Promise<{ fertilizers: FertilizerRecommendation[]; sprays: SprayRecommendation[] }> {
    const [ferts, pests, fungi] = await Promise.all([
      this.getProducts({ type: 'fertilizer', cropId, growthStage, limit: 20 }),
      this.getProducts({ type: 'pesticide', cropId, growthStage, limit: 15 }),
      this.getProducts({ type: 'fungicide', cropId, growthStage, limit: 10 }),
    ]);

    return {
      fertilizers: ferts.map(mapFertilizer),
      sprays: [...pests, ...fungi].map(mapSpray),
    };
  },

  async getAdviceForDisease(
    cropId: string,
    disease: DbCropDisease,
  ): Promise<{ disease: CropDisease; sprays: SprayRecommendation[] }> {
    const sprayType = disease.category === 'fungal' || disease.category === 'bacterial' ? 'fungicide' : 'pesticide';
    const products = await this.getProducts({
      type: sprayType,
      cropId,
      growthStage: disease.growthStage ?? undefined,
      limit: 10,
    });
    const sprays = products.map(mapSpray);
    return { disease: mapDisease(disease, sprays), sprays };
  },
};
