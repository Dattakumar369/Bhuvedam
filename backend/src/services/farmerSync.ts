import { and, eq } from 'drizzle-orm';

import { db } from '../db';
import { cropCalendar } from '../db/schema/cropCalendar';
import { crops } from '../db/schema/crops';
import { farmers, lands } from '../db/schema/farmers';

export interface CropPlantingInput {
  cropId: string;
  varietyName?: string;
  areaAcres?: string;
  areaCents?: string;
  sowingMonth?: string;
  sowingYear?: string;
}

export interface FarmerSyncInput {
  crops?: string[];
  cropPlantings?: CropPlantingInput[];
  district?: string;
  mandal?: string;
  village?: string;
  state?: string;
  soilType?: string;
  farmSize?: string;
  areaAcres?: number;
  areaCents?: number;
  notes?: string[];
  fieldMeasurement?: {
    points?: Array<{ latitude: number; longitude: number }>;
    areaAcres?: number;
    areaCents?: number;
  } | null;
  language?: string;
  name?: string;
}

function toSowingDate(month?: string, year?: string): string | null {
  const m = Number(month);
  const y = Number(year) || new Date().getFullYear();
  if (!Number.isFinite(m) || m < 1 || m > 12) return null;
  return `${y}-${String(m).padStart(2, '0')}-01`;
}

function averageCoordinate(
  points: Array<{ latitude: number; longitude: number }> | undefined,
): { latitude: string; longitude: string } | null {
  if (!points?.length) return null;
  const valid = points.filter(
    (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
  );
  if (!valid.length) return null;
  const lat = valid.reduce((sum, p) => sum + p.latitude, 0) / valid.length;
  const lon = valid.reduce((sum, p) => sum + p.longitude, 0) / valid.length;
  return { latitude: lat.toFixed(7), longitude: lon.toFixed(7) };
}

function locationLabel(input: FarmerSyncInput): string | null {
  const parts = [input.village, input.mandal, input.district, input.state].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

const MAX_FARM_SIZE_LEN = 255;
const MAX_LOCATION_LABEL_LEN = 200;

function clampText(value: string | undefined, maxLen: number): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.length <= maxLen ? trimmed : trimmed.slice(0, maxLen - 1) + '…';
}

/** Prefer numeric area label over long GPS-formatted strings from the app */
function normalizeFarmSize(input: FarmerSyncInput): string | undefined {
  if (input.areaAcres != null && Number.isFinite(input.areaAcres)) {
    const acres = input.areaAcres;
    if (input.areaCents != null && Number.isFinite(input.areaCents)) {
      return clampText(`${acres} acres, ${input.areaCents} cents`, MAX_FARM_SIZE_LEN);
    }
    return clampText(`${acres} acres`, MAX_FARM_SIZE_LEN);
  }
  return clampText(input.farmSize, MAX_FARM_SIZE_LEN);
}

function resolveAreaAcres(input: FarmerSyncInput): string | null {
  if (input.areaAcres != null && Number.isFinite(input.areaAcres)) {
    return String(input.areaAcres);
  }
  if (input.fieldMeasurement?.areaAcres != null) {
    return String(input.fieldMeasurement.areaAcres);
  }
  return null;
}

export async function upsertFarmerByPhone(
  phone: string,
  name: string,
  language = 'te',
) {
  const existing = await db.query.farmers.findFirst({
    where: eq(farmers.phone, phone),
  });

  if (existing) {
    const [updated] = await db
      .update(farmers)
      .set({
        name,
        language: language || existing.language,
        updatedAt: new Date(),
      })
      .where(eq(farmers.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(farmers)
    .values({ phone, name, language })
    .returning();
  return created;
}

export async function syncFarmerProfile(farmerId: string, input: FarmerSyncInput) {
  const now = new Date();
  const label = clampText(locationLabel(input) ?? undefined, MAX_LOCATION_LABEL_LEN) ?? null;
  const farmSize = normalizeFarmSize(input);

  await db
    .update(farmers)
    .set({
      ...(input.name ? { name: input.name.trim().slice(0, 120) } : {}),
      ...(input.language ? { language: input.language.slice(0, 10) } : {}),
      ...(farmSize ? { farmSize } : {}),
      ...(label ? { locationLabel: label } : {}),
      ...(input.notes?.length ? { notes: input.notes.slice(0, 12) } : {}),
      updatedAt: now,
    })
    .where(eq(farmers.id, farmerId));

  const coords = averageCoordinate(input.fieldMeasurement?.points);
  const areaAcres = resolveAreaAcres(input);

  const landPatch = {
    label: input.village?.trim() ? `${input.village.trim()} field` : 'Main field',
    areaAcres,
    village: input.village?.trim() || null,
    mandal: input.mandal?.trim() || null,
    district: input.district?.trim() || 'Unknown',
    state: input.state?.trim() || 'Andhra Pradesh',
    soilType: input.soilType?.trim() || null,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    updatedAt: now,
  };

  const [existingLand] = await db
    .select()
    .from(lands)
    .where(eq(lands.farmerId, farmerId))
    .limit(1);

  let landId: string;
  if (existingLand) {
    await db.update(lands).set(landPatch).where(eq(lands.id, existingLand.id));
    landId = existingLand.id;
  } else {
    const [inserted] = await db
      .insert(lands)
      .values({ farmerId, ...landPatch })
      .returning();
    landId = inserted.id;
  }

  await db.delete(cropCalendar).where(eq(cropCalendar.farmerId, farmerId));

  const plantings: CropPlantingInput[] = input.cropPlantings?.length
    ? input.cropPlantings
    : (input.crops ?? []).map((cropId) => ({ cropId }));

  for (const planting of plantings) {
    const cropId = planting.cropId?.trim();
    if (!cropId) continue;

    const cropRow = await db.query.crops.findFirst({
      where: eq(crops.id, cropId),
    });
    if (!cropRow) continue;

    await db.insert(cropCalendar).values({
      farmerId,
      landId,
      cropId,
      varietyName: planting.varietyName?.trim() || null,
      sowingDate: toSowingDate(planting.sowingMonth, planting.sowingYear),
      stage: 'planned',
    });
  }

  return db.query.farmers.findFirst({
    where: eq(farmers.id, farmerId),
    with: {
      lands: true,
      cropCalendars: true,
    },
  });
}

export function formatFarmerProfileForApp(profile: NonNullable<Awaited<ReturnType<typeof getFarmerProfile>>>) {
  const land = profile.lands?.[0];
  const landAcres = land?.areaAcres ? String(land.areaAcres) : '';

  const cropPlantings = (profile.cropCalendars ?? []).map((cal) => {
    const sowing = cal.sowingDate ? String(cal.sowingDate) : '';
    const [year, month] = sowing.split('-');
    return {
      cropId: cal.cropId,
      varietyName: cal.varietyName?.trim() ?? '',
      areaAcres: landAcres,
      areaCents: '',
      sowingMonth: month ? String(Number(month)) : '',
      sowingYear: year ?? String(new Date().getFullYear()),
    };
  });

  const crops = [...new Set(cropPlantings.map((p) => p.cropId))];
  const locationReady = Boolean(
    land?.district?.trim() &&
      land?.mandal?.trim() &&
      land?.village?.trim() &&
      land?.state?.trim(),
  );
  const plantingsReady =
    crops.length > 0 &&
    cropPlantings.length >= crops.length &&
    cropPlantings.every(
      (p) =>
        Boolean(p.varietyName.trim()) &&
        Boolean(p.sowingMonth.trim()) &&
        Boolean(p.areaAcres.trim() || p.areaCents.trim()),
    );

  return {
    name: profile.name,
    language: profile.language,
    location: profile.locationLabel ?? undefined,
    farmSize: profile.farmSize ?? undefined,
    crops,
    cropPlantings,
    district: land?.district ?? undefined,
    mandal: land?.mandal ?? undefined,
    village: land?.village ?? undefined,
    state: land?.state ?? undefined,
    soilType: land?.soilType ?? undefined,
    areaAcres: land?.areaAcres ? Number(land.areaAcres) : undefined,
    notes: (profile.notes as string[] | null) ?? [],
    setupComplete: locationReady && plantingsReady,
  };
}

export async function getFarmerProfile(farmerId: string) {
  return db.query.farmers.findFirst({
    where: and(eq(farmers.id, farmerId), eq(farmers.isActive, true)),
    with: {
      lands: true,
      cropCalendars: true,
    },
  });
}
