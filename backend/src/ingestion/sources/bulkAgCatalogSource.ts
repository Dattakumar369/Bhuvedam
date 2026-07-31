import { eq, sql } from 'drizzle-orm';

import { db } from '../../db';
import { agProducts, cropDiseaseCatalog } from '../../db/schema/agProducts';
import { crops } from '../../db/schema/crops';
import {
  AGRO_BRANDS,
  DISEASE_TEMPLATES,
  FERTILIZER_BASES,
  FUNGICIDE_ACTIVES,
  GROWTH_STAGES,
  INSECTICIDE_ACTIVES,
  NUTRIENT_DEFICIENCY_SYMPTOMS,
  SOIL_TYPES,
} from '../data/bulkMasters';

const BATCH = 200;

function dedupeById<T extends { id: string }>(rows: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of rows) map.set(row.id, row);
  return [...map.values()];
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

function imageFor(type: string, id: string): string {
  return `ag/${type}/${id}.png`;
}

async function getTargetCrops(limit = 280): Promise<string[]> {
  const bhuvedam = await db
    .select({ id: crops.id })
    .from(crops)
    .where(eq(crops.source, 'bhuvedam'))
    .limit(80);

  const agmarknet = await db
    .select({ id: crops.id })
    .from(crops)
    .where(eq(crops.source, 'agmarknet'))
    .limit(200);

  const ids = new Set<string>();
  for (const r of [...bhuvedam, ...agmarknet]) ids.add(r.id);

  const fallback = [
    'rice', 'wheat', 'maize', 'cotton', 'groundnut', 'chickpea', 'tomato', 'chilli',
    'sugarcane', 'soybean', 'mustard', 'potato', 'onion', 'brinjal', 'okra', 'mango',
    'banana', 'grapes', 'citrus', 'turmeric', 'ginger', 'sunflower', 'bajra', 'jowar',
    'ragi', 'redgram', 'greengram', 'blackgram', 'horsegram', 'lentil', 'barley',
  ];
  for (const id of fallback) ids.add(id);

  return [...ids].slice(0, limit);
}

function generatePesticides(): Array<typeof agProducts.$inferInsert> {
  const rows: Array<typeof agProducts.$inferInsert> = [];

  for (const active of INSECTICIDE_ACTIVES) {
    for (const brand of AGRO_BRANDS) {
      for (const crop of active.crops.slice(0, 3)) {
        const target = active.targets[0]!;
        const stage = GROWTH_STAGES[1]!;
        const soil = SOIL_TYPES[0]!;
        const id = `pest-${slug(active.name)}-${slug(brand)}-${crop}`.slice(0, 115);
        rows.push({
          id,
          name: `${brand} ${active.name.split(' ')[0]} — ${target}`,
          type: 'pesticide',
          subType: 'insecticide',
          brand,
          activeIngredient: active.name,
          dosage: active.dose,
          crops: [crop, ...active.crops.slice(0, 2)],
          soilTypes: [...SOIL_TYPES],
          growthStages: [...GROWTH_STAGES],
          targetPest: target,
          applicationMethod: `Spray ${active.dose} in 200 L water/acre. Best: early morning or evening.`,
          precautions: 'Observe PHI on label; wear PPE; rotate chemical groups.',
          description: `CIB&RC-style ${active.name} for ${active.targets.join(', ')} on ${active.crops.join(', ')}.`,
          price: '₹350–1200 per pack',
          image: imageFor('pesticide', slug(active.name)),
          source: 'cibrc_catalog',
          sourceUrl: 'https://www.ppqs.gov.in/divisions/cib-rc/registered-products',
        });
      }
    }
  }

  return rows;
}

function generateFungicides(): Array<typeof agProducts.$inferInsert> {
  const rows: Array<typeof agProducts.$inferInsert> = [];

  for (const active of FUNGICIDE_ACTIVES) {
    for (const brand of AGRO_BRANDS.slice(0, 22)) {
      for (const crop of active.crops.slice(0, 3)) {
        const target = active.targets[0]!;
        const id = `fung-${slug(active.name)}-${slug(brand)}-${crop}`.slice(0, 115);
        rows.push({
          id,
          name: `${brand} ${active.name.split(' ')[0]} — ${target}`,
          type: 'fungicide',
          subType: 'fungicide',
          brand,
          activeIngredient: active.name,
          dosage: active.dose,
          crops: active.crops,
          soilTypes: [...SOIL_TYPES],
          growthStages: [...GROWTH_STAGES],
          targetDisease: target,
          applicationMethod: `Spray ${active.dose}. Repeat after 10–14 days if needed.`,
          precautions: 'Do not mix with alkaline products; observe PHI.',
          description: `${active.name} for ${active.targets.join(', ')}.`,
          price: '₹400–1500 per pack',
          image: imageFor('fungicide', slug(active.name)),
          source: 'cibrc_catalog',
          sourceUrl: 'https://www.ppqs.gov.in/divisions/cib-rc/registered-products',
        });
      }
    }
  }

  return rows;
}

function generateFertilizers(cropIds: string[]): Array<typeof agProducts.$inferInsert> {
  const rows: Array<typeof agProducts.$inferInsert> = [];
  const priorityCrops = [
    'rice', 'wheat', 'maize', 'cotton', 'chilli', 'tomato', 'groundnut',
    'sugarcane', 'soybean', 'mustard', 'potato', 'onion', 'pulses',
  ];
  const targetCrops = [...new Set([...priorityCrops, ...cropIds])].slice(0, 15);

  for (const base of FERTILIZER_BASES) {
    const brands = [...new Set([base.brand, ...AGRO_BRANDS.slice(0, 4)])];
    const nanoCrops =
      base.id.startsWith('nano')
        ? ['rice', 'wheat', 'maize', 'cotton', 'chilli', 'tomato', 'groundnut', 'sugarcane', 'vegetables']
        : targetCrops;
    for (const brand of brands) {
      for (const cropId of nanoCrops) {
        const id = `fert-${base.id}-${slug(brand)}-${cropId}`.slice(0, 115);
        const deficiencyKeys = Object.keys(NUTRIENT_DEFICIENCY_SYMPTOMS).slice(0, 4);
        rows.push({
          id,
          name: `${brand} ${base.name} — ${cropId}`,
          type: 'fertilizer',
          subType: base.type,
          brand,
          nutrientComposition: base.nutrient,
          npkRatio: base.npk,
          dosage: base.baseDose,
          crops: [cropId],
          soilTypes: [...SOIL_TYPES],
          growthStages: [...GROWTH_STAGES],
          deficiencySymptoms: deficiencyKeys.flatMap((k) => NUTRIENT_DEFICIENCY_SYMPTOMS[k]!.slice(0, 2)),
          applicationMethod: `${base.application.join(' / ')} — adjust by soil test & growth stage.`,
          description: `${base.name} for ${cropId}. NPK ${base.npk}. ${base.nutrient}.`,
          price: '₹250–1800 per bag',
          image: imageFor('fertilizer', base.id),
          source: 'icar_dof_catalog',
        });
      }
    }
  }

  return rows;
}

function generateDiseases(cropIds: string[]): Array<typeof cropDiseaseCatalog.$inferInsert> {
  const rows: Array<typeof cropDiseaseCatalog.$inferInsert> = [];

  for (const cropId of cropIds) {
    for (const tmpl of DISEASE_TEMPLATES) {
      for (const soil of SOIL_TYPES.slice(0, 4)) {
        const id = `dis-${cropId}-${tmpl.suffix}-${soil}`.slice(0, 115);
        const deficiencyKeys =
          tmpl.category === 'nutrient'
            ? [tmpl.pathogen.replace(' deficiency', '').toLowerCase()]
            : [];

        rows.push({
          id,
          name: `${cropId.charAt(0).toUpperCase() + cropId.slice(1)} — ${tmpl.suffix.replace(/-/g, ' ')}`,
          cropId,
          category: tmpl.category,
          pathogen: tmpl.pathogen,
          symptoms: tmpl.symptoms,
          deficiencySymptoms: deficiencyKeys.flatMap(
            (k) => NUTRIENT_DEFICIENCY_SYMPTOMS[k] ?? [],
          ),
          treatment: tmpl.treatment,
          prevention: tmpl.prevention,
          growthStage: tmpl.growthStage,
          soilTypes: [soil],
          image: imageFor('disease', `${cropId}-${tmpl.suffix}`),
          source: 'icar_plantvillage',
          sourceUrl: 'https://www.icar.org.in/',
        });
      }
    }
  }

  return rows;
}

async function upsertAgProducts(rows: Array<typeof agProducts.$inferInsert>): Promise<void> {
  const total = rows.length;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const now = new Date();
    await db
      .insert(agProducts)
      .values(chunk.map((row) => ({ ...row, lastSyncedAt: now, updatedAt: now })))
      .onConflictDoUpdate({
        target: agProducts.id,
        set: {
          name: sql`excluded.name`,
          type: sql`excluded.type`,
          subType: sql`excluded.sub_type`,
          brand: sql`excluded.brand`,
          activeIngredient: sql`excluded.active_ingredient`,
          nutrientComposition: sql`excluded.nutrient_composition`,
          npkRatio: sql`excluded.npk_ratio`,
          dosage: sql`excluded.dosage`,
          crops: sql`excluded.crops`,
          soilTypes: sql`excluded.soil_types`,
          growthStages: sql`excluded.growth_stages`,
          deficiencySymptoms: sql`excluded.deficiency_symptoms`,
          targetPest: sql`excluded.target_pest`,
          targetDisease: sql`excluded.target_disease`,
          applicationMethod: sql`excluded.application_method`,
          precautions: sql`excluded.precautions`,
          description: sql`excluded.description`,
          price: sql`excluded.price`,
          image: sql`excluded.image`,
          source: sql`excluded.source`,
          sourceUrl: sql`excluded.source_url`,
          lastSyncedAt: now,
          updatedAt: now,
        },
      });
    if ((i + BATCH) % 1000 === 0 || i + BATCH >= total) {
      console.log(`  ag_products: ${Math.min(i + BATCH, total)}/${total}`);
    }
  }
}

async function upsertDiseases(rows: Array<typeof cropDiseaseCatalog.$inferInsert>): Promise<void> {
  const total = rows.length;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const now = new Date();
    await db
      .insert(cropDiseaseCatalog)
      .values(chunk.map((row) => ({ ...row, lastSyncedAt: now, updatedAt: now })))
      .onConflictDoUpdate({
        target: cropDiseaseCatalog.id,
        set: {
          name: sql`excluded.name`,
          cropId: sql`excluded.crop_id`,
          category: sql`excluded.category`,
          pathogen: sql`excluded.pathogen`,
          symptoms: sql`excluded.symptoms`,
          deficiencySymptoms: sql`excluded.deficiency_symptoms`,
          treatment: sql`excluded.treatment`,
          prevention: sql`excluded.prevention`,
          growthStage: sql`excluded.growth_stage`,
          soilTypes: sql`excluded.soil_types`,
          image: sql`excluded.image`,
          source: sql`excluded.source`,
          sourceUrl: sql`excluded.source_url`,
          lastSyncedAt: now,
          updatedAt: now,
        },
      });
    if ((i + BATCH) % 1000 === 0 || i + BATCH >= total) {
      console.log(`  crop_diseases: ${Math.min(i + BATCH, total)}/${total}`);
    }
  }
}

export async function syncBulkAgCatalog(): Promise<Record<string, number>> {
  const cropIds = await getTargetCrops(280);

  const pesticides = generatePesticides();
  const fungicides = generateFungicides();
  const fertilizers = generateFertilizers(cropIds);
  const diseases = generateDiseases(cropIds);

  console.log(`Generating: ${pesticides.length} pesticides, ${fungicides.length} fungicides, ${fertilizers.length} fertilizers, ${diseases.length} diseases...`);

  const products = dedupeById([...pesticides, ...fungicides, ...fertilizers]);
  const uniqueDiseases = dedupeById(diseases);
  console.log(`After dedupe: ${products.length} products, ${uniqueDiseases.length} diseases`);

  await upsertAgProducts(products);
  await upsertDiseases(uniqueDiseases);

  const [[{ pc }], [{ fc }], [{ fertc }], [{ dc }], [{ cropc }]] = await Promise.all([
    db.select({ pc: sql<number>`count(*)::int` }).from(agProducts).where(eq(agProducts.type, 'pesticide')),
    db.select({ fc: sql<number>`count(*)::int` }).from(agProducts).where(eq(agProducts.type, 'fungicide')),
    db.select({ fertc: sql<number>`count(*)::int` }).from(agProducts).where(eq(agProducts.type, 'fertilizer')),
    db.select({ dc: sql<number>`count(*)::int` }).from(cropDiseaseCatalog),
    db.select({ cropc: sql<number>`count(*)::int` }).from(crops),
  ]);

  return {
    pesticides: pc ?? 0,
    fungicides: fc ?? 0,
    fertilizers: fertc ?? 0,
    diseases: dc ?? 0,
    crops: cropc ?? 0,
    generated_pesticides: pesticides.length,
    generated_fungicides: fungicides.length,
    generated_fertilizers: fertilizers.length,
    generated_diseases: diseases.length,
  };
}
