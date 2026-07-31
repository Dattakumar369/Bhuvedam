import {
  boolean,
  decimal,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/** Farmers — app users / ryots */
export const farmers = pgTable(
  'farmers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    phone: varchar('phone', { length: 15 }).unique(),
    email: varchar('email', { length: 255 }).unique(),
    passwordHash: text('password_hash'),
    name: varchar('name', { length: 120 }).notNull(),
    avatarUrl: text('avatar_url'),
    language: varchar('language', { length: 10 }).notNull().default('te'),
    locationLabel: varchar('location_label', { length: 200 }),
    farmSize: varchar('farm_size', { length: 255 }),
    notes: jsonb('notes').$type<string[]>().default([]),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('farmers_phone_idx').on(t.phone)],
);

/** Lands — farmer-owned parcels */
export const lands = pgTable(
  'lands',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    farmerId: uuid('farmer_id')
      .notNull()
      .references(() => farmers.id, { onDelete: 'cascade' }),
    label: varchar('label', { length: 120 }).notNull(),
    areaAcres: decimal('area_acres', { precision: 10, scale: 4 }),
    village: varchar('village', { length: 120 }),
    mandal: varchar('mandal', { length: 120 }),
    district: varchar('district', { length: 120 }).notNull(),
    state: varchar('state', { length: 120 }).notNull().default('Andhra Pradesh'),
    soilType: varchar('soil_type', { length: 120 }),
    latitude: decimal('latitude', { precision: 10, scale: 7 }),
    longitude: decimal('longitude', { precision: 10, scale: 7 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('lands_farmer_idx').on(t.farmerId),
    index('lands_district_idx').on(t.district),
  ],
);

/** Survey Numbers — revenue / cadastral identifiers per land parcel */
export const surveyNumbers = pgTable(
  'survey_numbers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    landId: uuid('land_id')
      .notNull()
      .references(() => lands.id, { onDelete: 'cascade' }),
    surveyNumber: varchar('survey_number', { length: 60 }).notNull(),
    subDivision: varchar('sub_division', { length: 30 }),
    extentAcres: decimal('extent_acres', { precision: 10, scale: 4 }),
    revenueVillage: varchar('revenue_village', { length: 120 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('survey_numbers_land_idx').on(t.landId),
    index('survey_numbers_number_idx').on(t.surveyNumber),
  ],
);
