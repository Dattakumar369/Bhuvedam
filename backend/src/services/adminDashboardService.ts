import { count, desc, eq, gte, ilike, inArray, or, sql } from 'drizzle-orm';

import { db } from '../db';
import { adminBroadcasts } from '../db/schema/adminBroadcasts';
import { cropCalendar } from '../db/schema/cropCalendar';
import { crops } from '../db/schema/crops';
import { farmers, lands } from '../db/schema/farmers';
import { fertilizerProducts } from '../db/schema/fertilizerProducts';
import { govtSchemes } from '../db/schema/govtSchemes';
import { mandiPrices } from '../db/schema/mandiPrices';
import { weather } from '../db/schema/weather';
import { dataSources, syncJobs } from '../db/schema/syncJobs';
import schemeSeed from '../ingestion/data/govtSchemes.seed.json';
import { syncBulkAgCatalog } from '../ingestion/sources/bulkAgCatalogSource';
import { syncIndianAgCatalog, syncIndianFertilizerCatalog } from '../ingestion/sources/indianAgCatalogSource';
import { syncAllPublications } from '../ingestion/sources/publicationKnowledgeSource';
import { runDailyAutoSync, runFullSync } from '../ingestion/syncAll';
import { seedCuratedAgPlaces } from './nearbyAgPlacesService';
import { createAndPushNotification } from './notificationInboxService';

export async function getAdminAnalytics() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [[usersTotal], [usersActive], [usersWeek], [usersMonth], [fertCount], [schemeCount], [broadcastCount]] =
    await Promise.all([
      db.select({ n: count() }).from(farmers),
      db.select({ n: count() }).from(farmers).where(eq(farmers.isActive, true)),
      db.select({ n: count() }).from(farmers).where(gte(farmers.createdAt, weekAgo)),
      db.select({ n: count() }).from(farmers).where(gte(farmers.createdAt, monthAgo)),
      db.select({ n: count() }).from(fertilizerProducts),
      db.select({ n: count() }).from(govtSchemes),
      db.select({ n: count() }).from(adminBroadcasts),
    ]);

  const recentJobs = await db
    .select({
      id: syncJobs.id,
      sourceId: syncJobs.sourceId,
      status: syncJobs.status,
      startedAt: syncJobs.startedAt,
      finishedAt: syncJobs.finishedAt,
    })
    .from(syncJobs)
    .orderBy(desc(syncJobs.startedAt))
    .limit(8);

  const sources = await db
    .select({
      id: dataSources.id,
      name: dataSources.name,
      lastSyncAt: dataSources.lastSyncAt,
    })
    .from(dataSources)
    .limit(20);

  return {
    users: {
      total: Number(usersTotal?.n ?? 0),
      active: Number(usersActive?.n ?? 0),
      newLast7Days: Number(usersWeek?.n ?? 0),
      newLast30Days: Number(usersMonth?.n ?? 0),
    },
    catalog: {
      fertilizers: Number(fertCount?.n ?? 0),
      schemes: Number(schemeCount?.n ?? 0),
      broadcasts: Number(broadcastCount?.n ?? 0),
    },
    sync: { sources, recentJobs },
  };
}

export async function listAdminUsers(opts: { q?: string; page?: number; limit?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 25));
  const offset = (page - 1) * limit;
  const q = opts.q?.trim();

  const where = q
    ? or(
        ilike(farmers.name, `%${q}%`),
        ilike(farmers.phone, `%${q}%`),
        ilike(farmers.email, `%${q}%`),
        ilike(farmers.locationLabel, `%${q}%`),
      )
    : undefined;

  const [totalRow] = await db.select({ n: count() }).from(farmers).where(where);
  const rows = await db
    .select({
      id: farmers.id,
      name: farmers.name,
      phone: farmers.phone,
      email: farmers.email,
      language: farmers.language,
      locationLabel: farmers.locationLabel,
      farmSize: farmers.farmSize,
      isActive: farmers.isActive,
      createdAt: farmers.createdAt,
      updatedAt: farmers.updatedAt,
    })
    .from(farmers)
    .where(where)
    .orderBy(desc(farmers.createdAt))
    .limit(limit)
    .offset(offset);

  const ids = rows.map((r) => r.id);
  const cropMeta =
    ids.length === 0
      ? []
      : await db
          .select({
            farmerId: cropCalendar.farmerId,
            cropId: cropCalendar.cropId,
            cropName: crops.name,
            cropNameTe: crops.nameTe,
          })
          .from(cropCalendar)
          .leftJoin(crops, eq(cropCalendar.cropId, crops.id))
          .where(inArray(cropCalendar.farmerId, ids));

  const byFarmer = new Map<string, { cropCount: number; cropNames: string[] }>();
  for (const row of cropMeta) {
    const cur = byFarmer.get(row.farmerId) ?? { cropCount: 0, cropNames: [] };
    cur.cropCount += 1;
    const label = row.cropName || row.cropId;
    if (label && !cur.cropNames.includes(label)) cur.cropNames.push(label);
    byFarmer.set(row.farmerId, cur);
  }

  return {
    data: rows.map((r) => ({
      ...r,
      cropCount: byFarmer.get(r.id)?.cropCount ?? 0,
      cropNames: byFarmer.get(r.id)?.cropNames ?? [],
    })),
    page,
    limit,
    total: Number(totalRow?.n ?? 0),
  };
}

export async function getAdminUserFarm(farmerId: string) {
  const [farmer] = await db
    .select({
      id: farmers.id,
      name: farmers.name,
      phone: farmers.phone,
      email: farmers.email,
      language: farmers.language,
      locationLabel: farmers.locationLabel,
      farmSize: farmers.farmSize,
      isActive: farmers.isActive,
      createdAt: farmers.createdAt,
    })
    .from(farmers)
    .where(eq(farmers.id, farmerId))
    .limit(1);

  if (!farmer) return null;

  const landRows = await db.select().from(lands).where(eq(lands.farmerId, farmerId));

  const plantings = await db
    .select({
      id: cropCalendar.id,
      cropId: cropCalendar.cropId,
      cropName: crops.name,
      cropNameTe: crops.nameTe,
      varietyName: cropCalendar.varietyName,
      landId: cropCalendar.landId,
      sowingDate: cropCalendar.sowingDate,
      expectedHarvestDate: cropCalendar.expectedHarvestDate,
      actualHarvestDate: cropCalendar.actualHarvestDate,
      stage: cropCalendar.stage,
      notes: cropCalendar.notes,
      updatedAt: cropCalendar.updatedAt,
    })
    .from(cropCalendar)
    .leftJoin(crops, eq(cropCalendar.cropId, crops.id))
    .where(eq(cropCalendar.farmerId, farmerId))
    .orderBy(desc(cropCalendar.updatedAt));

  return {
    farmer,
    lands: landRows.map((l) => ({
      id: l.id,
      label: l.label,
      areaAcres: l.areaAcres,
      village: l.village,
      mandal: l.mandal,
      district: l.district,
      state: l.state,
      soilType: l.soilType,
    })),
    crops: plantings.map((p) => ({
      id: p.id,
      cropId: p.cropId,
      cropName: p.cropName ?? p.cropId,
      cropNameTe: p.cropNameTe,
      varietyName: p.varietyName,
      landId: p.landId,
      sowingDate: p.sowingDate,
      expectedHarvestDate: p.expectedHarvestDate,
      actualHarvestDate: p.actualHarvestDate,
      stage: p.stage,
      notes: p.notes,
      updatedAt: p.updatedAt,
    })),
  };
}

export async function listAdminCropPlantings(opts: { q?: string; page?: number; limit?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 40));
  const offset = (page - 1) * limit;
  const q = opts.q?.trim();

  const where = q
    ? or(
        ilike(farmers.name, `%${q}%`),
        ilike(farmers.phone, `%${q}%`),
        ilike(crops.name, `%${q}%`),
        ilike(cropCalendar.cropId, `%${q}%`),
        ilike(cropCalendar.varietyName, `%${q}%`),
      )
    : undefined;

  const [totalRow] = await db
    .select({ n: count() })
    .from(cropCalendar)
    .innerJoin(farmers, eq(cropCalendar.farmerId, farmers.id))
    .leftJoin(crops, eq(cropCalendar.cropId, crops.id))
    .where(where);

  const rows = await db
    .select({
      id: cropCalendar.id,
      farmerId: farmers.id,
      farmerName: farmers.name,
      farmerPhone: farmers.phone,
      cropId: cropCalendar.cropId,
      cropName: crops.name,
      cropNameTe: crops.nameTe,
      varietyName: cropCalendar.varietyName,
      sowingDate: cropCalendar.sowingDate,
      expectedHarvestDate: cropCalendar.expectedHarvestDate,
      stage: cropCalendar.stage,
      locationLabel: farmers.locationLabel,
      updatedAt: cropCalendar.updatedAt,
    })
    .from(cropCalendar)
    .innerJoin(farmers, eq(cropCalendar.farmerId, farmers.id))
    .leftJoin(crops, eq(cropCalendar.cropId, crops.id))
    .where(where)
    .orderBy(desc(cropCalendar.updatedAt))
    .limit(limit)
    .offset(offset);

  return {
    data: rows,
    page,
    limit,
    total: Number(totalRow?.n ?? 0),
  };
}

export async function setFarmerActive(id: string, isActive: boolean) {
  const [row] = await db
    .update(farmers)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(farmers.id, id))
    .returning({
      id: farmers.id,
      name: farmers.name,
      phone: farmers.phone,
      isActive: farmers.isActive,
    });
  return row ?? null;
}

function slugId(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return `${base || 'fertilizer'}-${Date.now().toString(36)}`;
}

export type FertilizerInput = {
  id?: string;
  name: string;
  nameTe?: string | null;
  brand: string;
  category: string;
  type?: string | null;
  npk?: string | null;
  npkRatio?: string | null;
  nutrient?: string | null;
  dosage?: string | null;
  crop?: string | null;
  benefits?: string | null;
  description?: string | null;
  crops?: string[];
  soilType?: string[];
  seasons?: string[];
  application?: string[];
  applicationMethod?: string | null;
  precautions?: string | null;
  mrp?: string | null;
  price?: string | null;
  packSize?: string | null;
  image?: string | null;
  source?: string;
  sourceUrl?: string | null;
  isSubsidized?: boolean;
};

export async function listAdminFertilizers(opts: { search?: string; page?: number; limit?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 25));
  const offset = (page - 1) * limit;
  const search = opts.search?.trim();

  const where = search
    ? or(
        ilike(fertilizerProducts.name, `%${search}%`),
        ilike(fertilizerProducts.brand, `%${search}%`),
        ilike(fertilizerProducts.category, `%${search}%`),
      )
    : undefined;

  const [totalRow] = await db.select({ n: count() }).from(fertilizerProducts).where(where);
  const rows = await db
    .select()
    .from(fertilizerProducts)
    .where(where)
    .orderBy(desc(fertilizerProducts.updatedAt))
    .limit(limit)
    .offset(offset);

  return { data: rows, page, limit, total: Number(totalRow?.n ?? 0) };
}

export async function createAdminFertilizer(input: FertilizerInput) {
  const id = (input.id?.trim() || slugId(input.name)).slice(0, 80);
  const now = new Date();
  const [row] = await db
    .insert(fertilizerProducts)
    .values({
      id,
      name: input.name.trim(),
      nameTe: input.nameTe ?? null,
      brand: input.brand.trim(),
      category: input.category.trim(),
      type: input.type ?? null,
      npk: input.npk ?? null,
      npkRatio: input.npkRatio ?? null,
      nutrient: input.nutrient ?? null,
      dosage: input.dosage ?? null,
      crop: input.crop ?? null,
      benefits: input.benefits ?? null,
      description: input.description ?? null,
      crops: input.crops ?? [],
      soilType: input.soilType ?? [],
      seasons: input.seasons ?? [],
      application: input.application ?? [],
      applicationMethod: input.applicationMethod ?? null,
      precautions: input.precautions ?? null,
      mrp: input.mrp ?? null,
      price: input.price ?? null,
      packSize: input.packSize ?? null,
      image: input.image ?? null,
      source: input.source?.trim() || 'admin',
      sourceUrl: input.sourceUrl ?? null,
      isSubsidized: input.isSubsidized ?? true,
      updatedAt: now,
      createdAt: now,
    })
    .returning();
  return row!;
}

export async function updateAdminFertilizer(id: string, input: Partial<FertilizerInput>) {
  const [row] = await db
    .update(fertilizerProducts)
    .set({
      ...(input.name != null ? { name: input.name.trim() } : {}),
      ...(input.nameTe !== undefined ? { nameTe: input.nameTe } : {}),
      ...(input.brand != null ? { brand: input.brand.trim() } : {}),
      ...(input.category != null ? { category: input.category.trim() } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.npk !== undefined ? { npk: input.npk } : {}),
      ...(input.npkRatio !== undefined ? { npkRatio: input.npkRatio } : {}),
      ...(input.nutrient !== undefined ? { nutrient: input.nutrient } : {}),
      ...(input.dosage !== undefined ? { dosage: input.dosage } : {}),
      ...(input.crop !== undefined ? { crop: input.crop } : {}),
      ...(input.benefits !== undefined ? { benefits: input.benefits } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.crops !== undefined ? { crops: input.crops } : {}),
      ...(input.soilType !== undefined ? { soilType: input.soilType } : {}),
      ...(input.seasons !== undefined ? { seasons: input.seasons } : {}),
      ...(input.application !== undefined ? { application: input.application } : {}),
      ...(input.applicationMethod !== undefined ? { applicationMethod: input.applicationMethod } : {}),
      ...(input.precautions !== undefined ? { precautions: input.precautions } : {}),
      ...(input.mrp !== undefined ? { mrp: input.mrp } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.packSize !== undefined ? { packSize: input.packSize } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
      ...(input.source != null ? { source: input.source.trim() } : {}),
      ...(input.sourceUrl !== undefined ? { sourceUrl: input.sourceUrl } : {}),
      ...(input.isSubsidized !== undefined ? { isSubsidized: input.isSubsidized } : {}),
      updatedAt: new Date(),
    })
    .where(eq(fertilizerProducts.id, id))
    .returning();
  return row ?? null;
}

export async function deleteAdminFertilizer(id: string) {
  const result = await db
    .delete(fertilizerProducts)
    .where(eq(fertilizerProducts.id, id))
    .returning({ id: fertilizerProducts.id });
  return result.length > 0;
}

export type SchemeInput = {
  id?: string;
  category: string;
  region: string;
  status?: string;
  titleEn: string;
  titleTe: string;
  amountEn?: string;
  amountTe?: string;
  benefitEn?: string;
  benefitTe?: string;
  eligibilityEn?: string;
  eligibilityTe?: string;
  howToApplyEn?: string;
  howToApplyTe?: string;
  applyUrl?: string | null;
  icon?: string;
  highlightsEn?: string[];
  highlightsTe?: string[];
  eligibilityRules?: Record<string, unknown>;
  verifiedAt?: string | null;
};

function mapSchemeRow(input: SchemeInput, id: string, now: Date) {
  return {
    id,
    category: input.category.trim(),
    region: input.region.trim(),
    status: (input.status ?? 'active').trim(),
    titleEn: input.titleEn.trim(),
    titleTe: input.titleTe.trim(),
    amountEn: input.amountEn ?? '',
    amountTe: input.amountTe ?? '',
    benefitEn: input.benefitEn ?? '',
    benefitTe: input.benefitTe ?? '',
    eligibilityEn: input.eligibilityEn ?? '',
    eligibilityTe: input.eligibilityTe ?? '',
    howToApplyEn: input.howToApplyEn ?? '',
    howToApplyTe: input.howToApplyTe ?? '',
    applyUrl: input.applyUrl ?? null,
    icon: input.icon ?? 'sprout',
    highlightsEn: input.highlightsEn ?? [],
    highlightsTe: input.highlightsTe ?? [],
    eligibilityRules: input.eligibilityRules ?? {},
    verifiedAt: input.verifiedAt ?? null,
    updatedAt: now,
  };
}

export async function listAdminSchemes(opts: { status?: string; page?: number; limit?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 50));
  const offset = (page - 1) * limit;
  const where = opts.status ? eq(govtSchemes.status, opts.status) : undefined;

  const [totalRow] = await db.select({ n: count() }).from(govtSchemes).where(where);
  const rows = await db
    .select()
    .from(govtSchemes)
    .where(where)
    .orderBy(desc(govtSchemes.updatedAt))
    .limit(limit)
    .offset(offset);

  return { data: rows, page, limit, total: Number(totalRow?.n ?? 0) };
}

export async function listPublicActiveSchemes() {
  return db
    .select()
    .from(govtSchemes)
    .where(eq(govtSchemes.status, 'active'))
    .orderBy(govtSchemes.titleEn);
}

export async function createAdminScheme(input: SchemeInput) {
  const id = (input.id?.trim() || slugId(input.titleEn)).slice(0, 80);
  const now = new Date();
  const [row] = await db
    .insert(govtSchemes)
    .values({ ...mapSchemeRow(input, id, now), createdAt: now })
    .returning();
  return row!;
}

export async function updateAdminScheme(id: string, input: Partial<SchemeInput>) {
  const existing = await db.select().from(govtSchemes).where(eq(govtSchemes.id, id)).limit(1);
  if (!existing[0]) return null;
  const merged: SchemeInput = {
    category: input.category ?? existing[0].category,
    region: input.region ?? existing[0].region,
    status: input.status ?? existing[0].status,
    titleEn: input.titleEn ?? existing[0].titleEn,
    titleTe: input.titleTe ?? existing[0].titleTe,
    amountEn: input.amountEn ?? existing[0].amountEn,
    amountTe: input.amountTe ?? existing[0].amountTe,
    benefitEn: input.benefitEn ?? existing[0].benefitEn,
    benefitTe: input.benefitTe ?? existing[0].benefitTe,
    eligibilityEn: input.eligibilityEn ?? existing[0].eligibilityEn,
    eligibilityTe: input.eligibilityTe ?? existing[0].eligibilityTe,
    howToApplyEn: input.howToApplyEn ?? existing[0].howToApplyEn,
    howToApplyTe: input.howToApplyTe ?? existing[0].howToApplyTe,
    applyUrl: input.applyUrl !== undefined ? input.applyUrl : existing[0].applyUrl,
    icon: input.icon ?? existing[0].icon,
    highlightsEn: input.highlightsEn ?? existing[0].highlightsEn,
    highlightsTe: input.highlightsTe ?? existing[0].highlightsTe,
    eligibilityRules:
      input.eligibilityRules ?? (existing[0].eligibilityRules as Record<string, unknown>) ?? {},
    verifiedAt: input.verifiedAt !== undefined ? input.verifiedAt : existing[0].verifiedAt,
  };
  const [row] = await db
    .update(govtSchemes)
    .set(mapSchemeRow(merged, id, new Date()))
    .where(eq(govtSchemes.id, id))
    .returning();
  return row ?? null;
}

export async function deleteAdminScheme(id: string) {
  const result = await db.delete(govtSchemes).where(eq(govtSchemes.id, id)).returning({ id: govtSchemes.id });
  return result.length > 0;
}

type SeedScheme = {
  id: string;
  category: string;
  region: string;
  status: string;
  titleEn: string;
  titleTe: string;
  amountEn: string;
  amountTe: string;
  benefitEn: string;
  benefitTe: string;
  eligibilityEn: string;
  eligibilityTe: string;
  howToApplyEn: string;
  howToApplyTe: string;
  applyUrl?: string;
  icon: string;
  highlightsEn: string[];
  highlightsTe: string[];
  eligibilityRules?: Record<string, unknown>;
  verifiedAt: string;
};

export async function seedGovtSchemesFromFile(): Promise<{ upserted: number }> {
  const schemes = schemeSeed as SeedScheme[];
  let upserted = 0;
  const now = new Date();
  for (const s of schemes) {
    await db
      .insert(govtSchemes)
      .values({
        id: s.id,
        category: s.category,
        region: s.region,
        status: s.status,
        titleEn: s.titleEn,
        titleTe: s.titleTe,
        amountEn: s.amountEn,
        amountTe: s.amountTe,
        benefitEn: s.benefitEn,
        benefitTe: s.benefitTe,
        eligibilityEn: s.eligibilityEn,
        eligibilityTe: s.eligibilityTe,
        howToApplyEn: s.howToApplyEn,
        howToApplyTe: s.howToApplyTe,
        applyUrl: s.applyUrl ?? null,
        icon: s.icon,
        highlightsEn: s.highlightsEn ?? [],
        highlightsTe: s.highlightsTe ?? [],
        eligibilityRules: s.eligibilityRules ?? {},
        verifiedAt: s.verifiedAt,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: govtSchemes.id,
        set: {
          category: s.category,
          region: s.region,
          status: s.status,
          titleEn: s.titleEn,
          titleTe: s.titleTe,
          amountEn: s.amountEn,
          amountTe: s.amountTe,
          benefitEn: s.benefitEn,
          benefitTe: s.benefitTe,
          eligibilityEn: s.eligibilityEn,
          eligibilityTe: s.eligibilityTe,
          howToApplyEn: s.howToApplyEn,
          howToApplyTe: s.howToApplyTe,
          applyUrl: s.applyUrl ?? null,
          icon: s.icon,
          highlightsEn: s.highlightsEn ?? [],
          highlightsTe: s.highlightsTe ?? [],
          eligibilityRules: s.eligibilityRules ?? {},
          verifiedAt: s.verifiedAt,
          updatedAt: now,
        },
      });
    upserted += 1;
  }
  return { upserted };
}

const BROADCAST_TYPES = new Set([
  'mandi_alert',
  'weather_alert',
  'spray_reminder',
  'fertilizer_reminder',
  'ai_insight',
  'crop_calendar',
]);

export async function listAdminBroadcasts(limit = 30) {
  return db.select().from(adminBroadcasts).orderBy(desc(adminBroadcasts.createdAt)).limit(limit);
}

export async function getAdminSyncStatus(jobLimit = 40) {
  const sources = await db
    .select({
      id: dataSources.id,
      name: dataSources.name,
      type: dataSources.type,
      lastSyncAt: dataSources.lastSyncAt,
      isActive: dataSources.isActive,
    })
    .from(dataSources)
    .orderBy(dataSources.id);

  const jobs = await db
    .select({
      id: syncJobs.id,
      sourceId: syncJobs.sourceId,
      status: syncJobs.status,
      recordsFetched: syncJobs.recordsFetched,
      recordsUpserted: syncJobs.recordsUpserted,
      errorMessage: syncJobs.errorMessage,
      startedAt: syncJobs.startedAt,
      finishedAt: syncJobs.finishedAt,
    })
    .from(syncJobs)
    .orderBy(desc(syncJobs.startedAt))
    .limit(jobLimit);

  const [mandiRow] = await db
    .select({ at: sql<string>`max(${mandiPrices.fetchedAt})` })
    .from(mandiPrices);
  const [weatherRow] = await db
    .select({ at: sql<string>`max(${weather.fetchedAt})` })
    .from(weather);
  const [fertRow] = await db
    .select({ at: sql<string>`max(${fertilizerProducts.lastSyncedAt})` })
    .from(fertilizerProducts);

  return {
    sources,
    recentJobs: jobs,
    freshness: {
      mandiLastSync: mandiRow?.at ?? null,
      weatherLastSync: weatherRow?.at ?? null,
      fertilizerLastSync: fertRow?.at ?? null,
    },
    actions: [
      { id: 'daily', label: 'Daily sync', blurb: 'Mandi, fertilizers, weather, crops, nearby places' },
      { id: 'full', label: 'Full live sync', blurb: 'FAO, mandi, soil, weather, knowledge' },
      { id: 'fertilizers', label: 'Fertilizer catalog', blurb: 'Indian DoF / NBS fertilizer products' },
      { id: 'ag-catalog', label: 'Ag catalog', blurb: 'Diseases, ICAR, advisories' },
      { id: 'bulk-catalog', label: 'Bulk catalog', blurb: 'Pesticides, fungicides, diseases' },
      { id: 'publications', label: 'Publications', blurb: 'ICAR / PJTSAU / ANGRAU / FAO / Gov' },
      { id: 'places', label: 'Nearby places seed', blurb: 'Curated mandi & fertilizer shop pins' },
    ],
  };
}

export type AdminSyncActionId =
  | 'daily'
  | 'full'
  | 'fertilizers'
  | 'ag-catalog'
  | 'bulk-catalog'
  | 'publications'
  | 'places';

export async function runAdminSyncAction(action: AdminSyncActionId) {
  switch (action) {
    case 'daily':
      return { action, results: await runDailyAutoSync() };
    case 'full':
      return { action, results: await runFullSync() };
    case 'fertilizers': {
      const r = await syncIndianFertilizerCatalog();
      return { action, results: [{ sourceId: 'indian_fertilizers', ...r, errors: [] as string[] }] };
    }
    case 'ag-catalog': {
      const parts = await syncIndianAgCatalog();
      return { action, results: Object.entries(parts).map(([k, v]) => ({ sourceId: k, ...v, errors: [] as string[] })) };
    }
    case 'bulk-catalog': {
      const counts = await syncBulkAgCatalog();
      return {
        action,
        results: [
          {
            sourceId: 'bulk_catalog',
            fetched: Object.values(counts).reduce((s, n) => s + n, 0),
            upserted: Object.values(counts).reduce((s, n) => s + n, 0),
            errors: [] as string[],
            counts,
          },
        ],
      };
    }
    case 'publications': {
      const parts = await syncAllPublications();
      return {
        action,
        results: [
          {
            sourceId: 'publications',
            fetched: parts.curated.fetched + parts.research.fetched,
            upserted: parts.curated.upserted + parts.research.upserted,
            errors: [] as string[],
          },
        ],
      };
    }
    case 'places': {
      const r = await seedCuratedAgPlaces();
      return {
        action,
        results: [
          {
            sourceId: 'bhuvedam',
            fetched: r.inserted + r.skipped,
            upserted: r.inserted,
            errors: [] as string[],
          },
        ],
      };
    }
    default:
      throw new Error('UNKNOWN_SYNC_ACTION');
  }
}

export async function createAdminBroadcast(input: {
  title: string;
  body: string;
  type?: string;
  createdBy?: string;
}) {
  const type = BROADCAST_TYPES.has(input.type ?? '') ? (input.type as string) : 'ai_insight';
  const title = input.title.trim().slice(0, 200);
  const body = input.body.trim();
  if (!title || !body) throw new Error('TITLE_BODY_REQUIRED');

  const active = await db
    .select({ id: farmers.id })
    .from(farmers)
    .where(eq(farmers.isActive, true));

  let pushSent = 0;
  for (const farmer of active) {
    const result = await createAndPushNotification(farmer.id, {
      type: type as
        | 'mandi_alert'
        | 'weather_alert'
        | 'spray_reminder'
        | 'fertilizer_reminder'
        | 'ai_insight'
        | 'crop_calendar',
      title,
      body,
      data: { broadcast: true, source: 'admin' },
      sendPush: true,
    });
    pushSent += result.pushSent;
  }

  const [log] = await db
    .insert(adminBroadcasts)
    .values({
      title,
      body,
      type,
      recipientCount: active.length,
      pushSent,
      createdBy: input.createdBy ?? null,
    })
    .returning();

  return log!;
}
