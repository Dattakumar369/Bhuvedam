/**
 * Build compact AP/TS LGD geography JSON from village CSVs.
 * Source: LGD via india-village-finder v1.3.0 (13 Jul 2026 dump).
 *
 * Usage: node scripts/build-lgd-geography.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const tmp = path.join(__dirname, 'tmp-lgd');
const outDir = path.join(root, 'constants', 'geography');

function parseCsv(text) {
  const rows = [];
  let i = 0;
  let field = '';
  let row = [];
  let inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((c) => c.length)) rows.push(row);
      row = [];
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }
  if (field.length || row.length) {
    row.push(field);
    if (row.some((c) => c.length)) rows.push(row);
  }
  return rows;
}

function buildState(csvPath, stateKey, stateNameEn) {
  const raw = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCsv(raw);
  const header = rows[0];
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));

  /** @type {Map<string, { n: string, c: number, mandals: Map<string, { n: string, c: number, villages: Map<string, { n: string, t?: string, c: number }> }> }>} */
  const districts = new Map();

  for (let r = 1; r < rows.length; r += 1) {
    const cols = rows[r];
    const district = (cols[idx.District] ?? '').trim();
    const districtCode = Number(cols[idx['District Code']]);
    const mandal = (cols[idx.Mandal] ?? '').trim();
    const mandalCode = Number(cols[idx['Mandal Code']]);
    const village = (cols[idx.Village] ?? '').trim();
    const villageNative = (cols[idx['Village (Native)']] ?? '').trim();
    const villageCode = Number(cols[idx['Village Code']]);
    if (!district || !mandal || !village || !Number.isFinite(districtCode)) continue;

    let d = districts.get(String(districtCode));
    if (!d) {
      d = { n: district, c: districtCode, mandals: new Map() };
      districts.set(String(districtCode), d);
    }
    let m = d.mandals.get(String(mandalCode));
    if (!m) {
      m = { n: mandal, c: mandalCode, villages: new Map() };
      d.mandals.set(String(mandalCode), m);
    }
    if (!m.villages.has(String(villageCode))) {
      const entry = { n: village, c: villageCode };
      // Keep Telugu/native only when it differs and looks like non-Latin script
      if (villageNative && villageNative !== village && /[^\u0000-\u007f]/.test(villageNative)) {
        entry.t = villageNative;
      }
      m.villages.set(String(villageCode), entry);
    }
  }

  const districtList = [...districts.values()]
    .sort((a, b) => a.n.localeCompare(b.n))
    .map((d) => ({
      n: d.n,
      c: d.c,
      m: [...d.mandals.values()]
        .sort((a, b) => a.n.localeCompare(b.n))
        .map((m) => ({
          n: m.n,
          c: m.c,
          v: [...m.villages.values()]
            .sort((a, b) => a.n.localeCompare(b.n))
            .map((v) => (v.t ? { n: v.n, t: v.t, c: v.c } : { n: v.n, c: v.c })),
        })),
    }));

  const villageCount = districtList.reduce(
    (acc, d) => acc + d.m.reduce((a, m) => a + m.v.length, 0),
    0,
  );
  const mandalCount = districtList.reduce((acc, d) => acc + d.m.length, 0);

  return {
    key: stateKey,
    nameEn: stateNameEn,
    nameTe: stateKey === 'ap' ? 'ఆంధ్ర ప్రదేశ్' : 'తెలంగాణ',
    source: 'LGD (Local Government Directory) via data.gov.in — dump 13 Jul 2026',
    updated: '2026-07-13',
    counts: {
      districts: districtList.length,
      mandals: mandalCount,
      villages: villageCount,
    },
    districts: districtList,
  };
}

fs.mkdirSync(outDir, { recursive: true });

const ap = buildState(path.join(tmp, 'ap.csv'), 'ap', 'Andhra Pradesh');
const ts = buildState(path.join(tmp, 'ts.csv'), 'ts', 'Telangana');

fs.writeFileSync(path.join(outDir, 'ap.json'), JSON.stringify(ap));
fs.writeFileSync(path.join(outDir, 'ts.json'), JSON.stringify(ts));

console.log('AP', ap.counts, 'bytes', fs.statSync(path.join(outDir, 'ap.json')).size);
console.log('TS', ts.counts, 'bytes', fs.statSync(path.join(outDir, 'ts.json')).size);
