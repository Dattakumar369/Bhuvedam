import { config } from 'dotenv';
import path from 'path';

/** Load backend/.env then root app .env (Expo keys) */
export function loadEnv(): void {
  config({ path: path.resolve(process.cwd(), '.env') });
  config({ path: path.resolve(process.cwd(), '../.env') });
}

export function getDataGovApiKey(): string {
  return (
    process.env.DATA_GOV_API_KEY?.trim() ||
    process.env.EXPO_PUBLIC_DATA_GOV_API_KEY?.trim() ||
    ''
  );
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error('DATABASE_URL missing in backend/.env');
  }
  return url;
}
