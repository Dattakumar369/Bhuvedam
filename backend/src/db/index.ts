import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { getDatabaseUrl, loadEnv } from '../config/env';
import * as schema from './schema';

type Db = NeonHttpDatabase<typeof schema>;

let dbInstance: Db | null = null;

function createDb(): Db {
  loadEnv();
  const sql = neon(getDatabaseUrl());
  return drizzle(sql, { schema });
}

export function getDb(): Db {
  if (!dbInstance) dbInstance = createDb();
  return dbInstance;
}

/** Lazy DB — avoids crashing Vercel cold start before env is read */
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const instance = getDb();
    const value = Reflect.get(instance as object, prop, instance);
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(instance) : value;
  },
});

export type Database = Db;
