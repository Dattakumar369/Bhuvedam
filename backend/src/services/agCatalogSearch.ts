import { and, eq, ilike, inArray, or, sql } from 'drizzle-orm';

import { db } from '../db';
import { agProducts, cropDiseaseCatalog } from '../db/schema/agProducts';
import {
  localCropLabel,
  localDiseaseLabel,
  localPestLabel,
  localSymptomsTe,
} from '../data/agLocalTerms';

const FERT_RE =
  /\b(fertilizer|fertiliser|urea|dap|npk|micronutrient|zinc|boron|compost|manure|dose|dosage|eruvu|ఎరువ|యూరియా)\b/i;
const PEST_RE =
  /\b(pest|insect|bollworm|aphid|thrips|whitefly|spray|pesticide|insecticide|ipm|mandu|purugu|poda|tega|gaddam|rogam)\b|తెగ|రోగ|పురుగ|పురుగు|పిచికారి|మంద|పొద|గడ్డ/i;
const FUNG_RE =
  /\b(fungus|fungal|fungicide|blight|rust|mildew|rot|wilt|anthracnose|sheath)\b|రోగ|గడ్డ|పేన/i;
const DISEASE_RE =
  /\b(disease|symptom|deficiency|chlorosis|yellow|spots|lesion|rogam|rogalu|lakshana|vastayi|gaddama|maccha|cheputunnaru)\b|రోగ|లక్ష|గడ్డ|మచ్చ|పసుప/i;
const ALT_RE =
  /\b(alternative|substitute|instead|ledu|lekapothe|badulu|replace|not available|unavailable|em vadali|panikira|substitute|బదుల)\b/i;

/** Known product keywords in farmer queries (Telugu + English) */
const PRODUCT_KEYWORDS: Record<string, string[]> = {
  urea: ['urea', 'యూరియా', 'yuriya'],
  nano: ['nano urea', 'nano', 'నానో', 'nano dap'],
  dap: ['dap', 'డాప'],
  npk: ['npk'],
  mop: ['mop', 'potash', 'potassium'],
  ssp: ['ssp'],
  zinc: ['zinc', 'జింక'],
  ammonium: ['ammonium', 'ammonium sulphate', 'ammonium sulfate'],
  nitrate: ['nitrate', 'calcium nitrate'],
};

/** When product unavailable — search these nitrogen alternatives in DB */
const UREA_ALTERNATIVE_TERMS = [
  'nano urea',
  'nano dap',
  'ammonium sulphate',
  'ammonium sulfate',
  'calcium nitrate',
  'dap',
  'npk 19',
  'npk 20',
  'npk 15',
  'npk 12',
  'npk 10',
  'map',
];

function isConventionalUrea(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes('urea') && !n.includes('nano');
}

function prioritizeNanoUrea(products: typeof agProducts.$inferSelect[]): typeof agProducts.$inferSelect[] {
  return [...products].sort((a, b) => {
    const score = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes('nano urea')) return 0;
      if (n.includes('nano')) return 1;
      return 2;
    };
    return score(a.name) - score(b.name);
  });
}

const CROP_ALIASES: Record<string, string[]> = {
  rice: ['rice', 'paddy', 'vari', 'వరి'],
  cotton: ['cotton', 'patti', 'పత్తి'],
  chilli: ['chilli', 'chili', 'mirchi', 'మిర', 'mirap'],
  tomato: ['tomato', 'టమాట', 'tamata'],
  groundnut: ['groundnut', 'peanut', 'verusenaga', 'వేర'],
  maize: ['maize', 'corn', 'mokkajonna', 'మొక'],
  wheat: ['wheat', 'గోధ'],
};

async function fetchCropAgPack(cropId: string): Promise<{
  diseases: typeof cropDiseaseCatalog.$inferSelect[];
  pesticides: typeof agProducts.$inferSelect[];
  fungicides: typeof agProducts.$inferSelect[];
}> {
  const cropFilter = sql`${agProducts.crops} @> ${JSON.stringify([cropId])}::jsonb`;

  let [diseases, pesticides, fungicides] = await Promise.all([
    db.select().from(cropDiseaseCatalog).where(eq(cropDiseaseCatalog.cropId, cropId)).limit(12),
    db
      .select()
      .from(agProducts)
      .where(and(eq(agProducts.type, 'pesticide'), cropFilter))
      .limit(10),
    db
      .select()
      .from(agProducts)
      .where(and(eq(agProducts.type, 'fungicide'), cropFilter))
      .limit(8),
  ]);

  if (!pesticides.length) {
    pesticides = await db.select().from(agProducts).where(eq(agProducts.type, 'pesticide')).limit(8);
  }
  if (!fungicides.length) {
    fungicides = await db.select().from(agProducts).where(eq(agProducts.type, 'fungicide')).limit(8);
  }

  return { diseases, pesticides, fungicides };
}

function mergeUnique<T extends { id: string }>(primary: T[], extra: T[], max: number): T[] {
  const map = new Map<string, T>();
  for (const item of [...primary, ...extra]) map.set(item.id, item);
  return [...map.values()].slice(0, max);
}

function detectCropId(query: string, cropHint?: string): string | undefined {
  if (cropHint?.trim()) return cropHint.trim().toLowerCase();
  const lower = query.toLowerCase();
  for (const [id, aliases] of Object.entries(CROP_ALIASES)) {
    if (aliases.some((a) => lower.includes(a.toLowerCase()))) return id;
  }
  return undefined;
}

function extractProductTerms(query: string): string[] {
  const lower = query.toLowerCase();
  const terms = new Set<string>();

  for (const [, aliases] of Object.entries(PRODUCT_KEYWORDS)) {
    for (const alias of aliases) {
      if (lower.includes(alias.toLowerCase())) terms.add(alias);
    }
  }

  // Meaningful English/Telugu words (skip stop words)
  const stop = new Set(['the', 'and', 'for', 'what', 'give', 'me', 'ledu', 'em', 'vadali', 'alternative', 'available', 'not', 'use', 'cheyali', 'panikira']);
  for (const w of lower.split(/\s+/)) {
    if (w.length > 2 && !stop.has(w)) terms.add(w);
  }

  return [...terms].slice(0, 6);
}

function isAlternativeQuery(query: string): boolean {
  return ALT_RE.test(query);
}

function mentionsUrea(query: string): boolean {
  const lower = query.toLowerCase();
  return lower.includes('urea') || lower.includes('యూరియా') || lower.includes('yuriya');
}

function productTypesForQuery(query: string): string[] {
  const types: string[] = [];
  if (FERT_RE.test(query) || isAlternativeQuery(query)) types.push('fertilizer');
  if (PEST_RE.test(query)) types.push('pesticide');
  if (FUNG_RE.test(query)) types.push('fungicide');
  if (!types.length) types.push('fertilizer', 'pesticide', 'fungicide');
  return types;
}

function isFertilizerQuery(query: string): boolean {
  return FERT_RE.test(query) || isAlternativeQuery(query) || mentionsUrea(query);
}

async function queryProducts(
  searchTerms: string[],
  types: string[],
  cropId?: string,
  limit = 12,
): Promise<typeof agProducts.$inferSelect[]> {
  if (!searchTerms.length) return [];

  const termConditions = searchTerms.flatMap((term) => [
    ilike(agProducts.name, `%${term}%`),
    ilike(agProducts.nutrientComposition, `%${term}%`),
    ilike(agProducts.description, `%${term}%`),
    ilike(agProducts.npkRatio, `%${term}%`),
  ]);

  const conditions = [or(...termConditions), inArray(agProducts.type, types)];

  if (cropId) {
    conditions.push(sql`${agProducts.crops} @> ${JSON.stringify([cropId])}::jsonb`);
  }

  return db
    .select()
    .from(agProducts)
    .where(and(...conditions))
    .limit(limit);
}

export async function searchAgCatalogForAI(
  query: string,
  cropHint?: string,
  limit = 12,
): Promise<{ products: typeof agProducts.$inferSelect[]; diseases: typeof cropDiseaseCatalog.$inferSelect[] }> {
  const q = query.trim();
  if (!q) return { products: [], diseases: [] };

  const cropId = detectCropId(q, cropHint);
  const types = productTypesForQuery(q);
  const terms = extractProductTerms(q);
  const isAlt = isAlternativeQuery(q);

  let products: typeof agProducts.$inferSelect[];

  if (isAlt && mentionsUrea(q)) {
    const nanoProducts = await queryProducts(['nano urea', 'nano dap'], ['fertilizer'], cropId, 6);
    const otherProducts = await queryProducts(
      UREA_ALTERNATIVE_TERMS.filter((t) => !t.includes('nano')),
      ['fertilizer'],
      cropId,
      limit,
    );
    if (!nanoProducts.length && !otherProducts.length && cropId) {
      const nanoAny = await queryProducts(['nano urea'], ['fertilizer'], undefined, 6);
      const otherAny = await queryProducts(
        UREA_ALTERNATIVE_TERMS.filter((t) => !t.includes('nano')),
        ['fertilizer'],
        undefined,
        limit,
      );
      products = [...nanoAny, ...otherAny];
    } else {
      products = [...nanoProducts, ...otherProducts];
    }
    products = products.filter((p) => !isConventionalUrea(p.name));
  } else if (q.toLowerCase().includes('nano')) {
    products = await queryProducts(['nano urea', 'nano dap'], types, cropId, limit);
    if (!products.length && cropId) {
      products = await queryProducts(['nano urea', 'nano dap'], types, undefined, limit);
    }
  } else {
    products = await queryProducts(terms, types, cropId, limit);
    if (!products.length && cropId) {
      products = await queryProducts(terms, types, undefined, limit);
    }
  }

  // Still empty — broad nitrogen fertilizer search (no conventional urea)
  if (!products.length && (mentionsUrea(q) || isAlt)) {
    products = (
      await db
        .select()
        .from(agProducts)
        .where(
          and(
            eq(agProducts.type, 'fertilizer'),
            or(
              ilike(agProducts.name, '%nano urea%'),
              ilike(agProducts.name, '%ammonium%'),
              ilike(agProducts.name, '%nitrate%'),
              ilike(agProducts.name, '%dap%'),
            ),
          ),
        )
        .limit(limit)
    ).filter((p) => !isConventionalUrea(p.name));
  }

  // Disease search — skip for pure fertilizer/alternative questions
  let diseases: typeof cropDiseaseCatalog.$inferSelect[] = [];
  const needsDiseases =
    !isFertilizerQuery(q) ||
    DISEASE_RE.test(q) ||
    FUNG_RE.test(q) ||
    PEST_RE.test(q);

  if (needsDiseases && (DISEASE_RE.test(q) || FUNG_RE.test(q) || PEST_RE.test(q) || cropId)) {
    const pattern = `%${terms[0] ?? q.slice(0, 40)}%`;
    const diseaseConditions = [
      or(
        ilike(cropDiseaseCatalog.name, pattern),
        ilike(cropDiseaseCatalog.symptoms, pattern),
        ilike(cropDiseaseCatalog.treatment, pattern),
      ),
    ];
    if (cropId && !isFertilizerQuery(q)) {
      diseaseConditions.push(eq(cropDiseaseCatalog.cropId, cropId));
    } else if (!DISEASE_RE.test(q) && !FUNG_RE.test(q) && !PEST_RE.test(q)) {
      diseaseConditions.push(sql`false`);
    }

    diseases = await db
      .select()
      .from(cropDiseaseCatalog)
      .where(and(...diseaseConditions))
      .limit(limit);
  }

  return { products: prioritizeNanoUrea(products).slice(0, limit), diseases: diseases.slice(0, limit) };
}

export function formatAgCatalogForAI(
  products: typeof agProducts.$inferSelect[],
  diseases: typeof cropDiseaseCatalog.$inferSelect[],
  query: string,
  cropHint?: string,
): string {
  if (!products.length && !diseases.length) {
    return '';
  }

  const lines = [
    `=== ${cropHint ? localCropLabel(cropHint) : 'Panta'} — DB nundi rogalu & mandulu ===`,
    'AI: Kindha unna perlu + dose matrame cheppandi. English textbook style vadhu — simple Telugu.',
    'Format: Rogam local peru → lakshanaalu → mandu peru + motta/acre → eppudu spray cheyali.',
    '',
  ];

  if (products.length) {
    lines.push('--- MANDU / PESTICIDES / FUNGICIDES (ఎరువు & మందulu) ---');
    for (const p of products.slice(0, 12)) {
      const pestLabel = p.targetPest ? localPestLabel(p.targetPest) : p.targetDisease ? localPestLabel(p.targetDisease) : '';
      lines.push(`• ${p.name}${p.brand ? ` (${p.brand})` : ''} — ${p.type}`);
      if (pestLabel) lines.push(`  Target / Rogam-Purugu: ${pestLabel}`);
      lines.push(`  Dose / Motta: ${p.dosage}`);
      if (p.activeIngredient) lines.push(`  Active: ${p.activeIngredient}`);
      if (p.applicationMethod) lines.push(`  Vidhanam: ${p.applicationMethod.slice(0, 120)}`);
      lines.push('');
    }
  }

  if (diseases.length) {
    lines.push('--- ROGALU / DISEASES ---');
    for (const d of diseases.slice(0, 10)) {
      const teName = localDiseaseLabel(d.id, d.name);
      const teSym = localSymptomsTe(d.id, d.symptoms);
      lines.push(`• ${teName}`);
      lines.push(`  Lakshanaalu: ${teSym}`);
      if (d.treatment) lines.push(`  Mandu/Chikitsa: ${d.treatment.slice(0, 150)}`);
      if (d.prevention) lines.push(`  Nivarana: ${d.prevention.slice(0, 100)}`);
      lines.push('');
    }
  }

  if (cropHint) lines.push(`Farmer crop context: ${cropHint}`);

  return lines.join('\n');
}

export async function buildAgCatalogContextForAI(
  query: string,
  cropIds: string[] = [],
): Promise<string> {
  const cropHint = cropIds[0];
  const agHealthQuery =
    PEST_RE.test(query) || DISEASE_RE.test(query) || FUNG_RE.test(query);
  let { products, diseases } = await searchAgCatalogForAI(query, cropHint, 15);

  if (cropHint) {
    const pack = await fetchCropAgPack(cropHint);
    diseases = mergeUnique(diseases, pack.diseases, 15);

    if (agHealthQuery || !products.length) {
      products = mergeUnique(products, [...pack.pesticides, ...pack.fungicides], 15);
    }
  }

  if (!products.length && !diseases.length && cropHint) {
    const pack = await fetchCropAgPack(cropHint);
    diseases = mergeUnique(diseases, pack.diseases, 15);
    products = mergeUnique(products, [...pack.pesticides, ...pack.fungicides], 15);
  }

  if (!products.length && cropIds.length > 1) {
    const retry = await searchAgCatalogForAI(query, cropIds[1], 12);
    products = mergeUnique(products, retry.products, 15);
    diseases = mergeUnique(diseases, retry.diseases, 12);
  }

  return formatAgCatalogForAI(products, diseases, query, cropHint);
}
