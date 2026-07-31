import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { knowledgeTypeEnum } from './knowledge';

/** Unified agriculture knowledge — research, diseases, pests, books, scientist insights */
export const agKnowledge = pgTable(
  'ag_knowledge',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: knowledgeTypeEnum('type').notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    summary: text('summary'),
    content: text('content'),
    authors: jsonb('authors').$type<string[]>().default([]),
    source: varchar('source', { length: 40 }).notNull(),
    externalId: varchar('external_id', { length: 200 }).notNull(),
    url: text('url'),
    tags: jsonb('tags').$type<string[]>().default([]),
    cropTags: jsonb('crop_tags').$type<string[]>().default([]),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    citationCount: integer('citation_count').default(0),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    syncedAt: timestamp('synced_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('ag_knowledge_source_ext_idx').on(t.source, t.externalId),
    index('ag_knowledge_type_idx').on(t.type),
    index('ag_knowledge_title_idx').on(t.title),
    index('ag_knowledge_citations_idx').on(t.citationCount),
  ],
);
