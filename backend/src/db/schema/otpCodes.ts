import { index, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

/** Phone OTP — 5 min expiry, 2Factor SMS AUTOGEN or dev mode */
export const otpCodes = pgTable(
  'otp_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    phone: varchar('phone', { length: 20 }).notNull(),
    /** Local hash (dev) or `tf:{sessionId}` for 2Factor SMS AUTOGEN */
    codeHash: varchar('code_hash', { length: 128 }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('otp_codes_phone_idx').on(t.phone), index('otp_codes_expires_idx').on(t.expiresAt)],
);
