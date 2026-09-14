import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, '../../constants/govtSchemes.ts');
const out = path.resolve(__dirname, '../src/ingestion/data/govtSchemes.seed.json');
const t = fs.readFileSync(src, 'utf8');
const marker = 'export const GOVT_SCHEMES:';
const start = t.indexOf(marker);
if (start < 0) throw new Error('GOVT_SCHEMES not found');
const eq = t.indexOf('=', start);
const arrStart = t.indexOf('[', eq);
let depth = 0;
let end = -1;
for (let i = arrStart; i < t.length; i++) {
  if (t[i] === '[') depth++;
  else if (t[i] === ']') {
    depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}
const data = Function(`return ${t.slice(arrStart, end + 1)}`)();
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(data, null, 2));
console.log('Wrote', data.length, 'schemes to', out);
