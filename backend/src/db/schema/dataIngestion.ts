import { pgEnum } from 'drizzle-orm/pg-core';

export const dataSourceTypeEnum = pgEnum('data_source_type', [
  'fao',
  'agmarknet',
  'soilgrids',
  'open_meteo',
  'data_gov_in',
  'gbif',
  'usda',
  'manual',
]);

export const syncStatusEnum = pgEnum('sync_status', [
  'pending',
  'running',
  'success',
  'failed',
  'partial',
]);

export const agrochemicalTypeEnum = pgEnum('agrochemical_type', [
  'fertilizer',
  'pesticide',
  'herbicide',
  'fungicide',
  'insecticide',
  'bio',
  'soil_amendment',
]);

export const seedTypeEnum = pgEnum('seed_type', [
  'hybrid',
  'open_pollinated',
  'heirloom',
  'gmo',
  'organic',
  'other',
]);
