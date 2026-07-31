import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { getDatabaseUrl, loadEnv } from '../config/env';
import * as schema from './schema';

loadEnv();

const sql = neon(getDatabaseUrl());

export const db = drizzle(sql, { schema });
export type Database = typeof db;
