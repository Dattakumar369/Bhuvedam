/**
 * One-time migration: add auth columns to farmers table.
 * Run: npm run db:migrate:auth
 */
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env' });
config({ path: '../.env' });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL missing in backend/.env');
  process.exit(1);
}

const sql = neon(url);

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
      AND column_name = ${column}
    LIMIT 1
  `;
  return rows.length > 0;
}

async function main() {
  console.log('[migrate:auth] Checking farmers table...');

  if (!(await columnExists('farmers', 'email'))) {
    await sql`ALTER TABLE farmers ADD COLUMN email varchar(255)`;
    console.log('[migrate:auth] Added column email');
  } else {
    console.log('[migrate:auth] Column email already exists');
  }

  if (!(await columnExists('farmers', 'password_hash'))) {
    await sql`ALTER TABLE farmers ADD COLUMN password_hash text`;
    console.log('[migrate:auth] Added column password_hash');
  } else {
    console.log('[migrate:auth] Column password_hash already exists');
  }

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'farmers_email_unique'
      ) THEN
        ALTER TABLE farmers ADD CONSTRAINT farmers_email_unique UNIQUE (email);
      END IF;
    END $$;
  `;
  console.log('[migrate:auth] Unique constraint farmers_email_unique OK');

  console.log('[migrate:auth] Done — signup should work now.');
}

main().catch((err) => {
  console.error('[migrate:auth] failed:', err);
  process.exit(1);
});
