import { eq, sql } from 'drizzle-orm';

import { db } from '../../db';
import {
  agAdvisories,
  icarGuidelines,
  plantDiseases,
  soilHealthRecommendations,
} from '../../db/schema/agCatalog';
import { diseases, diseaseSprays } from '../../db/schema/fertilizers';
import { crops } from '../../db/schema/crops';
import { fertilizerProducts } from '../../db/schema/fertilizerProducts';
import { DOA_ADVISORIES } from '../data/doaAdvisories';
import { ICAR_GUIDELINES } from '../data/icarGuidelines';
import { INDIAN_FERTILIZER_CATALOG } from '../data/indianFertilizerCatalog';
import { PLANT_VILLAGE_DISEASES } from '../data/plantVillageDiseases';
import { SOIL_HEALTH_RECOMMENDATIONS } from '../data/soilHealthRecommendations';

function cropLabel(crops: string[]): string {
  return crops.slice(0, 4).join(', ');
}

function fertilizerDescription(item: (typeof INDIAN_FERTILIZER_CATALOG)[0]): string {
  const parts = [item.benefits, item.applicationMethod].filter(Boolean);
  return parts.join(' — ');
}

export async function syncIndianFertilizerCatalog(): Promise<{ fetched: number; upserted: number }> {
  const now = new Date();

  for (const item of INDIAN_FERTILIZER_CATALOG) {
    const price = item.price ?? item.mrp ?? null;
    await db
      .insert(fertilizerProducts)
      .values({
        id: item.id,
        name: item.name,
        nameTe: item.nameTe ?? null,
        brand: item.brand,
        category: item.category,
        type: item.category,
        npk: item.npk ?? null,
        npkRatio: item.npk ?? null,
        nutrient: item.nutrient ?? null,
        dosage: item.dosage ?? null,
        crop: cropLabel(item.crops),
        benefits: item.benefits ?? null,
        description: fertilizerDescription(item),
        crops: item.crops,
        soilType: item.soilType ?? [],
        seasons: item.seasons,
        application: item.application,
        applicationMethod: item.applicationMethod ?? null,
        precautions: item.precautions ?? null,
        mrp: item.mrp ?? null,
        price,
        packSize: item.packSize ?? null,
        image: item.image ?? null,
        source: item.source,
        sourceUrl: item.sourceUrl ?? null,
        isSubsidized: item.isSubsidized ?? true,
        metadata: item.metadata ?? {},
        lastSyncedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: fertilizerProducts.id,
        set: {
          name: item.name,
          nameTe: item.nameTe ?? null,
          brand: item.brand,
          category: item.category,
          type: item.category,
          npk: item.npk ?? null,
          npkRatio: item.npk ?? null,
          nutrient: item.nutrient ?? null,
          dosage: item.dosage ?? null,
          crop: cropLabel(item.crops),
          benefits: item.benefits ?? null,
          description: fertilizerDescription(item),
          crops: item.crops,
          soilType: item.soilType ?? [],
          seasons: item.seasons,
          application: item.application,
          applicationMethod: item.applicationMethod ?? null,
          precautions: item.precautions ?? null,
          mrp: item.mrp ?? null,
          price,
          packSize: item.packSize ?? null,
          image: item.image ?? null,
          source: item.source,
          sourceUrl: item.sourceUrl ?? null,
          isSubsidized: item.isSubsidized ?? true,
          metadata: item.metadata ?? {},
          lastSyncedAt: now,
          updatedAt: now,
        },
      });
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(fertilizerProducts);

  return { fetched: INDIAN_FERTILIZER_CATALOG.length, upserted: count ?? 0 };
}

export async function syncPlantDiseases(): Promise<{ fetched: number; upserted: number }> {
  const now = new Date();

  for (const d of PLANT_VILLAGE_DISEASES) {
    await db
      .insert(plantDiseases)
      .values({
        id: d.id,
        name: d.name,
        nameTe: d.nameTe ?? null,
        cropId: d.cropId,
        plant: d.plant,
        plantvillageLabel: d.plantvillageLabel,
        category: d.category,
        symptoms: d.symptoms ?? null,
        symptomsTe: d.symptomsTe ?? null,
        treatment: d.treatment ?? null,
        treatmentTe: d.treatmentTe ?? null,
        prevention: d.prevention ?? null,
        preventionTe: d.preventionTe ?? null,
        imageClass: d.imageClass,
        hasDatasetImages: d.category === 'healthy' ? 'yes' : 'yes',
        source: d.source,
        sourceUrl: d.sourceUrl ?? null,
        lastSyncedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: plantDiseases.id,
        set: {
          name: d.name,
          nameTe: d.nameTe ?? null,
          cropId: d.cropId,
          plant: d.plant,
          plantvillageLabel: d.plantvillageLabel,
          category: d.category,
          symptoms: d.symptoms ?? null,
          symptomsTe: d.symptomsTe ?? null,
          treatment: d.treatment ?? null,
          treatmentTe: d.treatmentTe ?? null,
          prevention: d.prevention ?? null,
          preventionTe: d.preventionTe ?? null,
          imageClass: d.imageClass,
          source: d.source,
          sourceUrl: d.sourceUrl ?? null,
          lastSyncedAt: now,
          updatedAt: now,
        },
      });

    if (d.category !== 'healthy') {
      const legacyId = d.id;
      const [cropExists] = await db
        .select({ id: crops.id })
        .from(crops)
        .where(eq(crops.id, d.cropId))
        .limit(1);

      if (cropExists) {
        await db
          .insert(diseases)
          .values({
            id: legacyId,
            cropId: d.cropId,
            name: d.name,
            nameTe: d.nameTe ?? null,
            symptoms: d.symptoms ?? null,
            symptomsTe: d.symptomsTe ?? null,
          })
          .onConflictDoUpdate({
            target: diseases.id,
            set: {
              name: d.name,
              nameTe: d.nameTe ?? null,
              symptoms: d.symptoms ?? null,
              symptomsTe: d.symptomsTe ?? null,
            },
          });

        if (d.treatment) {
          await db.delete(diseaseSprays).where(eq(diseaseSprays.diseaseId, legacyId));
          await db.insert(diseaseSprays).values({
            diseaseId: legacyId,
            productName: d.treatment.slice(0, 160),
            type:
              d.category === 'pest' ? 'insecticide' : d.category === 'bacterial' ? 'bio' : 'fungicide',
            target: d.name,
            dose: 'As per label / extension recommendation',
            howToSpray: d.treatment,
            precautions: d.prevention ? [d.prevention] : [],
          });
        }
      }
    }
  }

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(plantDiseases);
  return { fetched: PLANT_VILLAGE_DISEASES.length, upserted: count ?? 0 };
}

export async function syncIcarGuidelines(): Promise<{ fetched: number; upserted: number }> {
  const now = new Date();
  for (const g of ICAR_GUIDELINES) {
    await db
      .insert(icarGuidelines)
      .values({
        id: g.id,
        category: g.category,
        cropId: g.cropId ?? null,
        title: g.title,
        titleTe: g.titleTe ?? null,
        content: g.content,
        season: g.season ?? null,
        region: g.region ?? 'India',
        sourceUrl: g.sourceUrl ?? 'https://www.icar.org.in/',
        tags: g.tags ?? [],
        lastSyncedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: icarGuidelines.id,
        set: {
          category: g.category,
          cropId: g.cropId ?? null,
          title: g.title,
          titleTe: g.titleTe ?? null,
          content: g.content,
          season: g.season ?? null,
          region: g.region ?? 'India',
          sourceUrl: g.sourceUrl ?? 'https://www.icar.org.in/',
          tags: g.tags ?? [],
          lastSyncedAt: now,
          updatedAt: now,
        },
      });
  }
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(icarGuidelines);
  return { fetched: ICAR_GUIDELINES.length, upserted: count ?? 0 };
}

export async function syncDoaAdvisories(): Promise<{ fetched: number; upserted: number }> {
  const now = new Date();
  for (const a of DOA_ADVISORIES) {
    await db
      .insert(agAdvisories)
      .values({
        id: a.id,
        type: a.type,
        title: a.title,
        titleTe: a.titleTe ?? null,
        description: a.description,
        state: a.state ?? 'All India',
        season: a.season ?? null,
        cropTags: a.cropTags ?? [],
        source: a.source,
        sourceUrl: a.sourceUrl ?? null,
        lastSyncedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: agAdvisories.id,
        set: {
          type: a.type,
          title: a.title,
          titleTe: a.titleTe ?? null,
          description: a.description,
          state: a.state ?? 'All India',
          season: a.season ?? null,
          cropTags: a.cropTags ?? [],
          source: a.source,
          sourceUrl: a.sourceUrl ?? null,
          lastSyncedAt: now,
          updatedAt: now,
        },
      });
  }
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(agAdvisories);
  return { fetched: DOA_ADVISORIES.length, upserted: count ?? 0 };
}

export async function syncSoilHealthRecommendations(): Promise<{ fetched: number; upserted: number }> {
  const now = new Date();
  for (const s of SOIL_HEALTH_RECOMMENDATIONS) {
    await db
      .insert(soilHealthRecommendations)
      .values({
        id: s.id,
        soilType: s.soilType,
        nutrientStatus: s.nutrientStatus,
        deficiency: s.deficiency,
        fertilizerRecommendation: s.fertilizerRecommendation,
        dosage: s.dosage ?? null,
        crops: s.crops ?? [],
        season: s.season ?? null,
        description: s.description ?? null,
        source: s.source ?? 'soil_health_card',
        sourceUrl: s.sourceUrl ?? 'https://soilhealth.dac.gov.in/',
        lastSyncedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: soilHealthRecommendations.id,
        set: {
          soilType: s.soilType,
          nutrientStatus: s.nutrientStatus,
          deficiency: s.deficiency,
          fertilizerRecommendation: s.fertilizerRecommendation,
          dosage: s.dosage ?? null,
          crops: s.crops ?? [],
          season: s.season ?? null,
          description: s.description ?? null,
          source: s.source ?? 'soil_health_card',
          sourceUrl: s.sourceUrl ?? 'https://soilhealth.dac.gov.in/',
          lastSyncedAt: now,
          updatedAt: now,
        },
      });
  }
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(soilHealthRecommendations);
  return { fetched: SOIL_HEALTH_RECOMMENDATIONS.length, upserted: count ?? 0 };
}

/** Sync all Indian agriculture catalog data to Neon */
export async function syncIndianAgCatalog(): Promise<Record<string, { fetched: number; upserted: number }>> {
  const [fertilizers, plantDiseaseRows, icar, doa, soilHealth] = await Promise.all([
    syncIndianFertilizerCatalog(),
    syncPlantDiseases(),
    syncIcarGuidelines(),
    syncDoaAdvisories(),
    syncSoilHealthRecommendations(),
  ]);

  return {
    fertilizers,
    plant_diseases: plantDiseaseRows,
    icar_guidelines: icar,
    ag_advisories: doa,
    soil_health: soilHealth,
  };
}
