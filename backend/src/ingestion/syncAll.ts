import { loadEnv } from '../config/env';

loadEnv();

import { syncAgmarknetMandi } from './sources/agmarknetSource';
import { syncFaoCrops, syncFaoFertilizers } from './sources/faoSource';
import { syncIndianAgCatalog, syncIndianFertilizerCatalog } from './sources/indianAgCatalogSource';
import { syncBulkAgCatalog } from './sources/bulkAgCatalogSource';
import { seedBhuvedamCrops } from './seedBhuvedamCrops';
import { syncGlobalWeather } from './sources/openMeteoSource';
import { syncGlobalSoilGrid } from './sources/soilGridsSource';
import { syncAllKnowledge } from './sources/openLibrarySource';
import {
  ensureDataSources,
  finishSyncJob,
  startSyncJob,
  type SyncResult,
} from './syncRunner';

export async function runFullSync(): Promise<SyncResult[]> {
  await ensureDataSources();
  const results: SyncResult[] = [];

  const jobs: { sourceId: string; run: () => Promise<{ fetched: number; upserted: number }> }[] = [
    { sourceId: 'fao', run: () => syncFaoCrops(2000) },
    { sourceId: 'fao', run: () => syncFaoFertilizers(300) },
    { sourceId: 'agmarknet', run: () => syncAgmarknetMandi() },
    { sourceId: 'soilgrids', run: () => syncGlobalSoilGrid({ maxPoints: 1 }) },
    { sourceId: 'open_meteo', run: () => syncGlobalWeather() },
    { sourceId: 'openalex', run: () => syncAllKnowledge() },
  ];

  for (const { sourceId, run } of jobs) {
    const jobId = await startSyncJob(sourceId);
    try {
      const { fetched, upserted } = await run();
      await finishSyncJob(jobId, sourceId, 'success', {
        fetched,
        upserted,
      });
      results.push({ sourceId, fetched, upserted, errors: [] });
      console.log(`✓ ${sourceId}: fetched ${fetched}, stored ${upserted}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await finishSyncJob(jobId, sourceId, 'failed', { error: msg });
      results.push({ sourceId, fetched: 0, upserted: 0, errors: [msg] });
      console.error(`✗ ${sourceId}: ${msg}`);
    }
  }

  return results;
}

const target = process.argv[2] ?? 'all';

async function main() {
  console.log('Bhuvedam — syncing live agricultural data to Neon...\n');

  if (target === 'all') {
    await runFullSync();
  } else if (target === 'crops') {
    await ensureDataSources();
    const fao = await syncFaoCrops(2000);
    console.log('FAO crops:', fao);
    const seeded = await seedBhuvedamCrops();
    console.log(`Bhuvedam AP/Telangana catalog: ${seeded} crops with full Telugu details`);
  } else if (target === 'mandi') {
    const r = await syncAgmarknetMandi();
    console.log('Agmarknet:', r);
  } else if (target === 'soil') {
    const r = await syncGlobalSoilGrid();
    console.log('SoilGrids:', r);
  } else if (target === 'weather') {
    const r = await syncGlobalWeather();
    console.log('Open-Meteo:', r);
  } else if (target === 'fertilizers') {
    await ensureDataSources();
    const fao = await syncFaoFertilizers(300);
    console.log('FAO fertilizers:', fao);
    const catalog = await syncIndianFertilizerCatalog();
    console.log('Indian fertilizer catalog:', catalog);
  } else if (target === 'fertilizer-catalog') {
    await ensureDataSources();
    const r = await syncIndianFertilizerCatalog();
    console.log('Indian fertilizer catalog:', r);
  } else if (target === 'ag-catalog') {
    await ensureDataSources();
    const results = await syncIndianAgCatalog();
    console.log('Indian ag catalog:', JSON.stringify(results, null, 2));
  } else if (target === 'bulk-catalog') {
    await ensureDataSources();
    const counts = await syncBulkAgCatalog();
    console.log('Bulk ag catalog:', JSON.stringify(counts, null, 2));
  } else if (target === 'knowledge') {
    const r = await syncAllKnowledge();
    console.log('Knowledge (research, books, pests):', r);
  } else {
    console.log(
      'Usage: tsx src/ingestion/syncAll.ts [all|crops|mandi|soil|weather|fertilizers|fertilizer-catalog|ag-catalog|knowledge]',
    );
  }

  console.log('\nSync complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
