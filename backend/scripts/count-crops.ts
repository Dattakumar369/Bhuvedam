import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config({ path: '.env' });
config({ path: '../.env' });

import { db } from '../src/db';
import { crops } from '../src/db/schema';
import { countCropsDb } from '../src/services/cropSearch';

async function main() {
  const total = await countCropsDb();
  const bySource = await db
    .select({ source: crops.source, count: sql<number>`count(*)::int` })
    .from(crops)
    .groupBy(crops.source);
  const withTelugu = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(crops)
    .where(sql`name_te is not null and name_te != ''`);
  const withTips = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(crops)
    .where(sql`jsonb_array_length(COALESCE(tips, '[]'::jsonb)) > 0`);

  console.log(JSON.stringify({ total, bySource, withTeluguName: withTelugu[0]?.count, withFarmingTips: withTips[0]?.count }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
