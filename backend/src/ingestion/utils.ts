import { createHash } from 'crypto';

/** Slugify text for stable DB ids (max 40 chars for crops.id column) */
export function slugId(text: string, prefix = ''): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  const full = prefix ? `${prefix}_${base}` : base;
  if (full.length <= 40) return full;

  const hash = createHash('sha256').update(full).digest('hex').slice(0, 8);
  const room = 40 - prefix.length - (prefix ? 1 : 0) - 9;
  return `${prefix ? `${prefix}_` : ''}${base.slice(0, Math.max(room, 8))}_${hash}`.slice(0, 40);
}

/** Geo cache key — ~1km grid */
export function geoKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Parse Agmarknet DD/MM/YYYY or ISO date */
export function parseAgmarknetDate(raw?: string): string {
  if (!raw?.trim()) return new Date().toISOString().slice(0, 10);

  const dmy = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2]!.padStart(2, '0')}-${dmy[1]!.padStart(2, '0')}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim();

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);

  return new Date().toISOString().slice(0, 10);
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${url}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}
