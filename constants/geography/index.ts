import type { LanguageCode } from '@/constants/languages';
import type {
  GeographyOption,
  GeographyStateKey,
  LgdDistrict,
  LgdMandal,
  LgdStateBundle,
  LgdVillage,
} from '@/constants/geography/types';

const STATE_META: Record<
  GeographyStateKey,
  { nameEn: string; nameTe: string; aliases: string[] }
> = {
  ap: {
    nameEn: 'Andhra Pradesh',
    nameTe: 'ఆంధ్ర ప్రదేశ్',
    aliases: ['andhra', 'andhra pradesh', 'ఆంధ్ర', 'ఆంధ్రప్రదేశ్', 'ap'],
  },
  ts: {
    nameEn: 'Telangana',
    nameTe: 'తెలంగాణ',
    aliases: ['telangana', 'తెలంగాణ', 'ts', 'tg'],
  },
};

const cache: Partial<Record<GeographyStateKey, LgdStateBundle>> = {};

function loadBundle(key: GeographyStateKey): LgdStateBundle {
  if (!cache[key]) {
    // Lazy require keeps the unused state's ~1MB JSON out of the initial path.
    cache[key] =
      key === 'ap'
        ? (require('./ap.json') as LgdStateBundle)
        : (require('./ts.json') as LgdStateBundle);
  }
  return cache[key]!;
}

export function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0c00-\u0c7f\s]/gi, ' ')
    .replace(/\s+/g, ' ');
}

export function resolveGeographyState(state?: string): GeographyStateKey | null {
  const n = normalizeText(state ?? '');
  if (!n) return null;
  for (const key of Object.keys(STATE_META) as GeographyStateKey[]) {
    if (STATE_META[key].aliases.some((a) => n === a || n.includes(a))) return key;
  }
  return null;
}

export function geographyStateLabel(key: GeographyStateKey, language: LanguageCode): string {
  const meta = STATE_META[key];
  return language === 'te' ? meta.nameTe : meta.nameEn;
}

export function geographyStateNameEn(key: GeographyStateKey): string {
  return STATE_META[key].nameEn;
}

export function getGeographyBundle(key: GeographyStateKey): LgdStateBundle {
  return loadBundle(key);
}

function villageLabel(v: LgdVillage, language: LanguageCode): string {
  if (language === 'te' && v.t) return v.t;
  return v.n;
}

export function getDistrictOptions(
  key: GeographyStateKey,
  language: LanguageCode,
): GeographyOption[] {
  return loadBundle(key).districts.map((d) => ({
    label: d.n,
    value: d.n,
    code: d.c,
  }));
}

export function findDistrict(
  key: GeographyStateKey,
  districtNameOrCode: string | number,
): LgdDistrict | undefined {
  const bundle = loadBundle(key);
  if (typeof districtNameOrCode === 'number' || /^\d+$/.test(String(districtNameOrCode))) {
    const code = Number(districtNameOrCode);
    return bundle.districts.find((d) => d.c === code);
  }
  const target = normalizeText(String(districtNameOrCode));
  return (
    bundle.districts.find((d) => normalizeText(d.n) === target) ??
    bundle.districts.find((d) => normalizeText(d.n).includes(target) || target.includes(normalizeText(d.n)))
  );
}

export function getMandalOptions(
  key: GeographyStateKey,
  districtName: string,
  language: LanguageCode,
): GeographyOption[] {
  const district = findDistrict(key, districtName);
  if (!district) return [];
  return district.m.map((m) => ({
    label: m.n,
    value: m.n,
    code: m.c,
  }));
}

export function findMandal(
  key: GeographyStateKey,
  districtName: string,
  mandalNameOrCode: string | number,
): LgdMandal | undefined {
  const district = findDistrict(key, districtName);
  if (!district) return undefined;
  if (typeof mandalNameOrCode === 'number' || /^\d+$/.test(String(mandalNameOrCode))) {
    const code = Number(mandalNameOrCode);
    return district.m.find((m) => m.c === code);
  }
  const target = normalizeText(String(mandalNameOrCode));
  return (
    district.m.find((m) => normalizeText(m.n) === target) ??
    district.m.find((m) => normalizeText(m.n).includes(target) || target.includes(normalizeText(m.n)))
  );
}

export function getVillageOptions(
  key: GeographyStateKey,
  districtName: string,
  mandalName: string,
  language: LanguageCode,
): GeographyOption[] {
  const mandal = findMandal(key, districtName, mandalName);
  if (!mandal) return [];
  return mandal.v.map((v) => ({
    label: villageLabel(v, language),
    value: v.n,
    code: v.c,
    nativeLabel: v.t,
  }));
}

function scoreName(candidate: string, query: string): number {
  const c = normalizeText(candidate);
  const q = normalizeText(query);
  if (!c || !q) return 0;
  if (c === q) return 100;
  if (c.startsWith(q) || q.startsWith(c)) return 80;
  if (c.includes(q) || q.includes(c)) return 60;
  return 0;
}

/**
 * Best-effort map of GPS / place-search strings onto LGD names.
 * Returns only fields that confidently matched.
 */
export function matchAddressToLgd(input: {
  state?: string;
  district?: string;
  mandal?: string;
  village?: string;
}): {
  stateKey: GeographyStateKey | null;
  state?: string;
  district?: string;
  mandal?: string;
  village?: string;
} {
  const stateKey = resolveGeographyState(input.state);
  if (!stateKey) {
    return { stateKey: null };
  }

  const bundle = loadBundle(stateKey);
  const result: {
    stateKey: GeographyStateKey;
    state: string;
    district?: string;
    mandal?: string;
    village?: string;
  } = {
    stateKey,
    state: geographyStateNameEn(stateKey),
  };

  let district: LgdDistrict | undefined;
  if (input.district?.trim()) {
    let best: { d: LgdDistrict; score: number } | null = null;
    for (const d of bundle.districts) {
      const score = scoreName(d.n, input.district);
      if (score >= 60 && (!best || score > best.score)) best = { d, score };
    }
    if (best) {
      district = best.d;
      result.district = best.d.n;
    }
  }

  let mandal: LgdMandal | undefined;
  if (district && input.mandal?.trim()) {
    let best: { m: LgdMandal; score: number } | null = null;
    for (const m of district.m) {
      const score = scoreName(m.n, input.mandal);
      if (score >= 60 && (!best || score > best.score)) best = { m, score };
    }
    if (best) {
      mandal = best.m;
      result.mandal = best.m.n;
    }
  }

  if (mandal && input.village?.trim()) {
    let best: { v: LgdVillage; score: number } | null = null;
    for (const v of mandal.v) {
      const score = Math.max(scoreName(v.n, input.village), v.t ? scoreName(v.t, input.village) : 0);
      if (score >= 60 && (!best || score > best.score)) best = { v, score };
    }
    if (best) result.village = best.v.n;
  }

  return result;
}

export const GEOGRAPHY_STATE_KEYS: GeographyStateKey[] = ['ap', 'ts'];
