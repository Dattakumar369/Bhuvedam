import { index, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { dataSourceTypeEnum, syncStatusEnum } from './dataIngestion';

/** Registry of external data providers */
export const dataSources = pgTable('data_sources', {
  id: varchar('id', { length: 40 }).primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  type: dataSourceTypeEnum('type').notNull(),
  baseUrl: text('base_url'),
  description: text('description'),
  regionScope: varchar('region_scope', { length: 80 }).default('global'),
  isActive: integer('is_active').notNull().default(1),
  config: jsonb('config').$type<Record<string, unknown>>().default({}),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Sync job audit log */
export const syncJobs = pgTable(
  'sync_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceId: varchar('source_id', { length: 40 })
      .notNull()
      .references(() => dataSources.id, { onDelete: 'cascade' }),
    status: syncStatusEnum('status').notNull().default('pending'),
    recordsFetched: integer('records_fetched').default(0),
    recordsUpserted: integer('records_upserted').default(0),
    errorMessage: text('error_message'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
  },
  (t) => [
    index('sync_jobs_source_idx').on(t.sourceId),
    index('sync_jobs_status_idx').on(t.status),
    index('sync_jobs_started_idx').on(t.startedAt),
  ],
);
