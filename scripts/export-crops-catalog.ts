import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CROPS } from '../constants/crops';

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, '../backend/src/data');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'crops.catalog.json'), JSON.stringify(CROPS, null, 2));
console.log(`Exported ${CROPS.length} crops → backend/src/data/crops.catalog.json`);
