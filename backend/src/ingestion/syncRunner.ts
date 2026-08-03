import { eq } from 'drizzle-orm';

import { db } from '../db';
import { syncJobs, dataSources } from '../db/schema';
import type { syncStatusEnum } from '../db/schema/dataIngestion';

type SyncStatus = (typeof syncStatusEnum.enumValues)[number];

export async function ensureDataSources() {
  const sources = [
    {
      id: 'fao',
      name: 'FAO FAOSTAT',
      type: 'fao' as const,
      baseUrl: 'https://fenixservices.fao.org/faostat/api/v1',
      description: 'Global crops, production, fertilizer statistics',
      regionScope: 'global',
    },
    {
      id: 'agmarknet',
      name: 'Agmarknet / data.gov.in',
      type: 'agmarknet' as const,
      baseUrl: 'https://api.data.gov.in/resource',
      description: 'India mandi prices and crop varieties',
      regionScope: 'India',
    },
    {
      id: 'soilgrids',
      name: 'ISRIC SoilGrids',
      type: 'soilgrids' as const,
      baseUrl: 'https://rest.isric.org/soilgrids/v2.0',
      description: 'Global soil pH, texture, organic carbon',
      regionScope: 'global',
    },
    {
      id: 'open_meteo',
      name: 'Open-Meteo',
      type: 'open_meteo' as const,
      baseUrl: 'https://api.open-meteo.com/v1',
      description: 'Global weather forecasts',
      regionScope: 'global',
    },
    {
      id: 'openalex',
      name: 'OpenAlex Research',
      type: 'manual' as const,
      baseUrl: 'https://api.openalex.org',
      description: 'Scientific papers — diseases, pests, fertilizers, climate',
      regionScope: 'global',
    },
    {
      id: 'openlibrary',
      name: 'Open Library',
      type: 'manual' as const,
      baseUrl: 'https://openlibrary.org',
      description: 'Agriculture books and textbooks',
      regionScope: 'global',
    },
    {
      id: 'indian_fertilizers',
      name: 'DoF / IFFCO / Coromandel / NFL',
      type: 'manual' as const,
      baseUrl: 'https://dof.gov.in',
      description: 'Indian fertilizer product catalog — NPK, bio, micronutrients',
      regionScope: 'India',
    },
    {
      id: 'bhuvedam',
      name: 'Bhuvedam AP/Telangana Crop Catalog',
      type: 'manual' as const,
      baseUrl: 'https://bhuvedam.com',
      description: 'Curated regional crops with Telugu details',
      regionScope: 'India — AP & Telangana',
    },
    {
      id: 'bulk_catalog',
      name: 'Bhuvedam Bulk Ag Catalog',
      type: 'manual' as const,
      baseUrl: 'https://bhuvedam.com',
      description: 'Generated pesticides, fungicides, fertilizers, diseases per crop',
      regionScope: 'India',
    },
  ];

  for (const s of sources) {
    await db.insert(dataSources).values(s).onConflictDoNothing({ target: dataSources.id });
  }
}

export async function startSyncJob(sourceId: string) {
  const [job] = await db
    .insert(syncJobs)
    .values({ sourceId, status: 'running' })
    .returning({ id: syncJobs.id });
  return job!.id;
}

export async function finishSyncJob(
  jobId: string,
  sourceId: string,
  status: SyncStatus,
  stats: { fetched?: number; upserted?: number; error?: string; metadata?: Record<string, unknown> },
) {
  await db
    .update(syncJobs)
    .set({
      status,
      recordsFetched: stats.fetched ?? 0,
      recordsUpserted: stats.upserted ?? 0,
      errorMessage: stats.error,
      metadata: stats.metadata ?? {},
      finishedAt: new Date(),
    })
    .where(eq(syncJobs.id, jobId));

  if (status === 'success' || status === 'partial') {
    await db.update(dataSources).set({ lastSyncAt: new Date() }).where(eq(dataSources.id, sourceId));
  }
}

export interface SyncResult {
  sourceId: string;
  fetched: number;
  upserted: number;
  errors: string[];
}
