import {
  FUNGICIDE_ACTIVES,
  INSECTICIDE_ACTIVES,
} from '../ingestion/data/bulkMasters';
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
}

function buildPesticides(): CanonicalAgProduct[] {
  return INSECTICIDE_ACTIVES.map((active) => ({
    id: `ref-pest-${slug(active.name)}`,
    name: active.name,
    nameTe: null,
    type: 'pesticide' as const,
    subType: 'insecticide',
    brand: null,
    activeIngredient: active.name,
    dosage: active.dose,
    crops: [...new Set(active.crops)],
    targetPest: active.targets.join(', '),
    targetDisease: null,
    applicationMethod: `Spray ${active.dose} in 200 L water/acre. Early morning or evening — bee activity tagginchandi.`,
    precautions:
      'Label dose follow cheyandi. PHI (pre-harvest interval) label chudandi. PPE (gloves, mask) vadandi. Same chemical group rotate cheyandi.',
    description: `CIB&RC registered active ingredient. Targets: ${active.targets.join(', ')}. Crops: ${active.crops.join(', ')}.`,
    price: null,
    image: resolveProductImageUrl({
      id: `ref-pest-${slug(active.name)}`,
      type: 'pesticide',
      activeIngredient: active.name,
    }),
    source: 'cibrc_reference',
    sourceUrl: PPQS_URL,
  }));
}

function buildFungicides(): CanonicalAgProduct[] {
  return FUNGICIDE_ACTIVES.map((active) => ({
    id: `ref-fung-${slug(active.name)}`,
    name: active.name,
    nameTe: null,
    type: 'fungicide' as const,
    subType: 'fungicide',
    brand: null,
    activeIngredient: active.name,
    dosage: active.dose,
    crops: [...new Set(active.crops)],
    targetPest: null,
    targetDisease: active.targets.join(', '),
    applicationMethod: `Spray ${active.dose}. 10–14 rojula tarvata avasaram unte malli spray cheyandi.`,
    precautions:
      'Alkaline products tho kalipi vadhu. PHI label chudandi. Fungicide group rotate cheyandi — resistance taggutundi.',
    description: `CIB&RC registered fungicide. Diseases: ${active.targets.join(', ')}. Crops: ${active.crops.join(', ')}.`,
    price: null,
    image: resolveProductImageUrl({
      id: `ref-fung-${slug(active.name)}`,
      type: 'fungicide',
      activeIngredient: active.name,
    }),
    source: 'cibrc_reference',
    sourceUrl: PPQS_URL,
  }));
}

const PESTICIDE_CACHE = buildPesticides();
const FUNGICIDE_CACHE = buildFungicides();

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
  };
}
