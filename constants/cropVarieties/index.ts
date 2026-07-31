import type { CropVariety } from '@/types/cropVariety';
import { varietyIdFromAgmarknetName } from '@/utils/slug';

import { CURATED_VARIETIES } from './curated';

/** Variety entry — curated (full guide) or discovered live from Agmarknet */
export interface VarietyEntry {
  id: string;
  cropId: string;
  name: string;
  nameTe: string;
  isCurated: boolean;
  agmarknetName?: string;
  /** Full guide — only when curated */
  curated?: CropVariety;
}

export function getCuratedVarieties(cropId: string): CropVariety[] {
  return CURATED_VARIETIES[cropId] ?? [];
}

export function getCuratedVariety(cropId: string, varietyId: string): CropVariety | undefined {
  return getCuratedVarieties(cropId).find((v) => v.id === varietyId);
}

export function curatedToEntry(v: CropVariety): VarietyEntry {
  return {
    id: v.id,
    cropId: v.cropId,
    name: v.name,
    nameTe: v.nameTe,
    isCurated: true,
    agmarknetName: v.agmarknetNames[0],
    curated: v,
  };
}

export function discoveredToEntry(cropId: string, agmarknetName: string): VarietyEntry {
  const curated = matchCuratedByAgmarknetName(cropId, agmarknetName);
  if (curated) return curatedToEntry(curated);

  return {
    id: varietyIdFromAgmarknetName(agmarknetName),
    cropId,
    name: agmarknetName,
    nameTe: agmarknetName,
    isCurated: false,
    agmarknetName,
  };
}

export function matchCuratedByAgmarknetName(cropId: string, agmarknetName: string): CropVariety | undefined {
  const v = agmarknetName.toLowerCase().trim();
  return getCuratedVarieties(cropId).find((variety) =>
    variety.agmarknetNames.some(
      (name) =>
        v.includes(name.toLowerCase()) ||
        name.toLowerCase().includes(v) ||
        variety.aliases.some((a) => v.includes(a.toLowerCase())),
    ),
  );
}

/** @deprecated use matchCuratedByAgmarknetName */
export const matchAgmarknetVariety = matchCuratedByAgmarknetName;

export function findVarietyByQuery(cropId: string, query: string): VarietyEntry | undefined {
  const q = query.toLowerCase().trim();
  const curated = getCuratedVarieties(cropId).find(
    (v) =>
      v.name.toLowerCase().includes(q) ||
      v.aliases.some((a) => q.includes(a.toLowerCase())) ||
      v.agmarknetNames.some((n) => q.includes(n.toLowerCase())),
  );
  if (curated) return curatedToEntry(curated);
  return undefined;
}

export function getVarietyEntry(
  cropId: string,
  varietyId: string,
  discoveredNames: string[] = [],
): VarietyEntry | undefined {
  const curated = getCuratedVariety(cropId, varietyId);
  if (curated) return curatedToEntry(curated);

  const fromList = buildVarietyList(cropId, discoveredNames).find((e) => e.id === varietyId);
  return fromList;
}

/** Merge curated list + dynamically discovered Agmarknet variety names */
export function buildVarietyList(
  cropId: string,
  discoveredAgmarknetNames: string[] = [],
): VarietyEntry[] {
  const map = new Map<string, VarietyEntry>();

  for (const v of getCuratedVarieties(cropId)) {
    map.set(v.id, curatedToEntry(v));
  }

  for (const agName of discoveredAgmarknetNames) {
    if (!agName.trim()) continue;
    const entry = discoveredToEntry(cropId, agName.trim());
    if (!map.has(entry.id)) map.set(entry.id, entry);
  }

  return [...map.values()].sort((a, b) => {
    if (a.isCurated !== b.isCurated) return a.isCurated ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function searchVarietyList(entries: VarietyEntry[], query: string): VarietyEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.nameTe.toLowerCase().includes(q) ||
      e.agmarknetName?.toLowerCase().includes(q),
  );
}

/** @deprecated */
export function getVarietiesForCrop(cropId: string): CropVariety[] {
  return getCuratedVarieties(cropId);
}

/** @deprecated */
export function getVariety(cropId: string, varietyId: string): CropVariety | undefined {
  return getCuratedVariety(cropId, varietyId);
}

export const ALL_PROTECTION_CROP_IDS = Object.keys(CURATED_VARIETIES);
