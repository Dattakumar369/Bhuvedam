import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

/** Government schemes (Pathakalu) — admin-managed; public read of active rows */
export const govtSchemes = pgTable(
  'govt_schemes',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    category: varchar('category', { length: 40 }).notNull(),
    region: varchar('region', { length: 20 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    titleEn: varchar('title_en', { length: 200 }).notNull(),
    titleTe: varchar('title_te', { length: 200 }).notNull(),
    amountEn: varchar('amount_en', { length: 120 }).notNull().default(''),
    amountTe: varchar('amount_te', { length: 120 }).notNull().default(''),
    benefitEn: text('benefit_en').notNull().default(''),
    benefitTe: text('benefit_te').notNull().default(''),
    eligibilityEn: text('eligibility_en').notNull().default(''),
    eligibilityTe: text('eligibility_te').notNull().default(''),
    howToApplyEn: text('how_to_apply_en').notNull().default(''),
    howToApplyTe: text('how_to_apply_te').notNull().default(''),
    applyUrl: text('apply_url'),
    icon: varchar('icon', { length: 80 }).notNull().default('sprout'),
    highlightsEn: jsonb('highlights_en').$type<string[]>().notNull().default([]),
    highlightsTe: jsonb('highlights_te').$type<string[]>().notNull().default([]),
    eligibilityRules: jsonb('eligibility_rules').$type<Record<string, unknown>>().default({}),
    verifiedAt: varchar('verified_at', { length: 40 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('govt_schemes_status_idx').on(t.status),
    index('govt_schemes_category_idx').on(t.category),
    index('govt_schemes_region_idx').on(t.region),
  ],
);
