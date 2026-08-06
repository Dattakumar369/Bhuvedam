/** Per-crop planting record collected during farm setup */
export interface FarmerCropPlanting {
  cropId: string;
  /** Rakam / variety — free text or curated name */
  varietyName: string;
  areaAcres: string;
  areaCents: string;
  /** Month number as string "1"–"12" */
  sowingMonth: string;
  sowingYear: string;
  /** Exact sowing date ISO — voice companion reminders use this when set */
  sowingDate?: string;
}

export interface FarmLocation {
  district: string;
  mandal: string;
  village: string;
  state: string;
}

export function emptyPlanting(cropId: string): FarmerCropPlanting {
  return {
    cropId,
    varietyName: '',
    areaAcres: '',
    areaCents: '',
    sowingMonth: '',
    sowingYear: String(new Date().getFullYear()),
  };
}

export function syncPlantingsForCrops(
  cropIds: string[],
  existing: FarmerCropPlanting[],
): FarmerCropPlanting[] {
  return cropIds.map((cropId) => {
    const prev = existing.find((p) => p.cropId === cropId);
    return prev ?? emptyPlanting(cropId);
  });
}

export function plantingHasArea(p: FarmerCropPlanting): boolean {
  return Boolean(p.areaAcres.trim() || p.areaCents.trim());
}

export function plantingIsComplete(p: FarmerCropPlanting): boolean {
  return plantingHasArea(p) && Boolean(p.sowingMonth.trim()) && Boolean(p.varietyName.trim());
}

export function farmLocationIsComplete(input: {
  district?: string;
  mandal?: string;
  village?: string;
  state?: string;
}): boolean {
  return Boolean(
    input.district?.trim() &&
      input.mandal?.trim() &&
      input.village?.trim() &&
      input.state?.trim(),
  );
}

export function totalAreaFromPlantings(
  plantings: FarmerCropPlanting[],
): { areaAcres: number; areaCents: number } | null {
  let totalCents = 0;
  let hasAny = false;

  for (const p of plantings) {
    const cents = Number(p.areaCents.replace(/,/g, '').trim());
    const acres = Number(p.areaAcres.replace(/,/g, '').trim());
    if (Number.isFinite(cents) && cents > 0) {
      totalCents += cents;
      hasAny = true;
    } else if (Number.isFinite(acres) && acres > 0) {
      totalCents += acres * 100;
      hasAny = true;
    }
  }

  if (!hasAny) return null;
  const areaCents = Math.round(totalCents * 100) / 100;
  return { areaCents, areaAcres: Math.round((areaCents / 100) * 10000) / 10000 };
}
