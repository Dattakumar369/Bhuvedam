import {
  FUNGICIDE_ACTIVES,
  INSECTICIDE_ACTIVES,
} from '../ingestion/data/bulkMasters';
import {
  AGROCHEM_CATALOG_VERIFIED_AT,
  AGROCHEM_ENRICHMENT,
} from '../ingestion/data/agrochemEnrichment';
import { resolveProductImageUrl } from './productImageResolver';

const PPQS_URL = 'https://www.ppqs.gov.in/divisions/cib-rc/registered-products';

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

export interface CanonicalAgProduct {
  id: string;
  name: string;
  nameTe: string | null;
  type: 'pesticide' | 'fungicide';
  subType: string;
  brand: string | null;
  activeIngredient: string;
  dosage: string;
  crops: string[];
  targetPest: string | null;
  targetDisease: string | null;
  applicationMethod: string;
  precautions: string;
  description: string;
  price: string | null;
  image: string | null;
  source: string;
  sourceUrl: string;
  whenToUse: string | null;
  phiDays: number | null;
  status: 'registered' | 'banned' | 'restricted';
  verifiedAt: string;
}

function buildFromActives(
  type: 'pesticide' | 'fungicide',
  subType: string,
  actives: typeof INSECTICIDE_ACTIVES,
): CanonicalAgProduct[] {
  const rows: CanonicalAgProduct[] = [];

  for (const active of actives) {
    const enrich = AGROCHEM_ENRICHMENT[active.name];
    const status = enrich?.status ?? 'registered';
    if (status === 'banned') continue;

    const when =
      enrich?.whenToUse ??
      (type === 'pesticide'
        ? 'Spray at ETL. Early morning or evening — avoid bee activity.'
        : 'Spray at first disease symptoms or as preventive in risk weather.');
    const phi = enrich?.phiDays;
    const phiText =
      phi != null
        ? ` PHI about ${phi} days (verify pack label).`
        : ' Check pack label for PHI.';

    rows.push({
      id: `ref-${type === 'pesticide' ? 'pest' : 'fung'}-${slug(active.name)}`,
      name: active.name,
      nameTe: null,
      type,
      subType,
      brand: null,
      activeIngredient: active.name,
      dosage: active.dose,
      crops: [...new Set(active.crops)],
      targetPest: type === 'pesticide' ? active.targets.join(', ') : null,
      targetDisease: type === 'fungicide' ? active.targets.join(', ') : null,
      applicationMethod: `Use ${active.dose} in ~200 L water/acre (or as label). ${when}`,
      precautions: `Follow label dose.${phiText} Wear PPE (gloves, mask). Rotate chemical groups. Do not mix unknown products.`,
      description: `CIB&RC-style registered formulation reference. Targets: ${active.targets.join(', ')}. Crops: ${active.crops.join(', ')}. Source: PPQS registered products list.`,
      price: enrich?.packMrp ?? 'Typical dealer pack — verify MRP on label',
      image: resolveProductImageUrl({
        id: `ref-${type === 'pesticide' ? 'pest' : 'fung'}-${slug(active.name)}`,
        type,
        activeIngredient: active.name,
      }),
      source: 'cibrc_reference',
      sourceUrl: PPQS_URL,
      whenToUse: when,
      phiDays: phi ?? null,
      status,
      verifiedAt: AGROCHEM_CATALOG_VERIFIED_AT,
    });
  }

  return rows;
}

const PESTICIDE_CACHE = buildFromActives('pesticide', 'insecticide', INSECTICIDE_ACTIVES);
const FUNGICIDE_CACHE = buildFromActives('fungicide', 'fungicide', FUNGICIDE_ACTIVES);

export interface CanonicalAgQuery {
  type: 'pesticide' | 'fungicide';
  search?: string;
  crop?: string;
  target?: string;
  limit?: number;
}

function matchesSearch(p: CanonicalAgProduct, q: string): boolean {
  const needle = q.toLowerCase();
  return [
    p.name,
    p.activeIngredient,
    p.targetPest,
    p.targetDisease,
    p.description,
    p.whenToUse,
    ...p.crops,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

function matchesTarget(p: CanonicalAgProduct, target: string): boolean {
  const needle = target.toLowerCase();
  const hay = [p.targetPest, p.targetDisease, p.name, p.activeIngredient]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(needle);
}

export function searchCanonicalAgProducts(query: CanonicalAgQuery): CanonicalAgProduct[] {
  const base = query.type === 'pesticide' ? PESTICIDE_CACHE : FUNGICIDE_CACHE;
  let rows = [...base];

  if (query.crop?.trim()) {
    const cropId = query.crop.trim().toLowerCase();
    rows = rows.filter((p) => p.crops.some((c) => c.toLowerCase() === cropId));
  }
  if (query.target?.trim()) {
    rows = rows.filter((p) => matchesTarget(p, query.target!.trim()));
  }
  if (query.search?.trim()) {
    rows = rows.filter((p) => matchesSearch(p, query.search!.trim()));
  }

  const limit = Math.min(query.limit ?? 100, 200);
  return rows.slice(0, limit);
}

export function getCanonicalAgProductById(id: string): CanonicalAgProduct | null {
  return (
    PESTICIDE_CACHE.find((p) => p.id === id) ??
    FUNGICIDE_CACHE.find((p) => p.id === id) ??
    null
  );
}

export function canonicalAgStats() {
  return {
    pesticides: PESTICIDE_CACHE.length,
    fungicides: FUNGICIDE_CACHE.length,
    verifiedAt: AGROCHEM_CATALOG_VERIFIED_AT,
    source: 'cibrc_reference',
  };
}
