import { eq, sql } from 'drizzle-orm';

import { db } from '../db';
import { crops } from '../db/schema';
import { hasOllama, ollamaComplete } from './ollamaClient';

export type FarmerLanguage = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'kn';

const LANG_LABELS: Record<FarmerLanguage, string> = {
  en: 'English',
  hi: 'Hindi (spoken, simple)',
  mr: 'Marathi (spoken, simple)',
  ta: 'Tamil (spoken, simple)',
  te: 'Telugu (spoken, simple — మాట్లాడే తెలుగు)',
  kn: 'Kannada (spoken, simple)',
};

type CropRow = typeof crops.$inferSelect;

export type LocalizeMode = 'names' | 'full' | 'none';

export interface LocalizedCrop extends CropRow {
  displayName: string;
  displayCategory: string | null;
  displaySeasonLabel: string;
  displaySowingPeriod: string;
  displayHarvestPeriod: string;
  displayWaterNeeds: string;
  displaySoilType: string;
  displayTips: string[];
}

type I18nBundle = {
  name?: string;
  seasonLabel?: string;
  sowingPeriod?: string;
  harvestPeriod?: string;
  waterNeeds?: string;
  soilType?: string;
  tips?: string[];
};

function getI18nCache(row: CropRow): Record<string, I18nBundle> {
  const meta = row.metadata as { i18n?: Record<string, I18nBundle> } | null;
  return meta?.i18n ?? {};
}

function withDisplayFields(row: CropRow, bundle: I18nBundle, displayName: string): LocalizedCrop {
  return {
    ...row,
    displayName,
    displayCategory: row.category,
    displaySeasonLabel: bundle.seasonLabel ?? row.seasonLabel ?? '',
    displaySowingPeriod: bundle.sowingPeriod ?? row.sowingPeriod ?? '',
    displayHarvestPeriod: bundle.harvestPeriod ?? row.harvestPeriod ?? '',
    displayWaterNeeds: bundle.waterNeeds ?? row.waterNeeds ?? '',
    displaySoilType: bundle.soilType ?? row.soilType ?? '',
    displayTips: bundle.tips?.length ? bundle.tips : row.tips ?? [],
  };
}

function pickStaticName(row: CropRow, lang: FarmerLanguage): string | null {
  if (lang === 'en') return row.name;
  if (lang === 'te' && row.nameTe) return row.nameTe;
  const cached = (row.localizedNames ?? {})[lang];
  return cached ?? null;
}

async function translateNameWithAi(row: CropRow, lang: FarmerLanguage): Promise<string> {
  if (!hasOllama()) return lang === 'te' ? row.name : row.nameTe ?? row.name;

  const langLabel = LANG_LABELS[lang];
  const prompt = `You help Indian farmers with crop name translation ONLY.
Do not include user data, illegal advice, or anything except the crop name translation.
Use the everyday name farmers use at mandi/field — NOT scientific Latin.
Crop (English): ${row.name}
${row.nameTe ? `Known Telugu name (prefer if lang is Telugu): ${row.nameTe}` : ''}
${row.description ? `Context: ${String(row.description).slice(0, 200)}` : ''}

Reply with ONLY the crop name in ${langLabel}, one short line, no explanation.`;

  const result = await ollamaComplete(prompt, 80);
  return result.split('\n')[0]?.trim() || row.nameTe || row.name;
}

async function translateDetailsWithAi(row: CropRow, lang: FarmerLanguage): Promise<I18nBundle> {
  const cached = getI18nCache(row)[lang];
  if (cached?.tips?.length || (cached?.seasonLabel && lang !== 'en')) return cached;

  const hasDetails =
    row.seasonLabel ||
    row.sowingPeriod ||
    row.harvestPeriod ||
    row.waterNeeds ||
    row.soilType ||
    (row.tips?.length ?? 0) > 0;

  if (!hasDetails) {
    return { name: pickStaticName(row, lang) ?? row.name };
  }

  if (!hasOllama()) {
    return {
      seasonLabel: row.seasonLabel ?? '',
      sowingPeriod: row.sowingPeriod ?? '',
      harvestPeriod: row.harvestPeriod ?? '',
      waterNeeds: row.waterNeeds ?? '',
      soilType: row.soilType ?? '',
      tips: row.tips ?? [],
    };
  }

  const langLabel = LANG_LABELS[lang];
  const prompt = `Translate this Indian crop farming info into ${langLabel} for farmers (simple spoken words).
Agriculture translation ONLY — no user data, no illegal advice, lawful registered products context only.

Crop: ${row.name}
Season: ${row.seasonLabel ?? row.season ?? ''}
Sowing: ${row.sowingPeriod ?? ''}
Harvest: ${row.harvestPeriod ?? ''}
Water: ${row.waterNeeds ?? ''}
Soil: ${row.soilType ?? ''}
Tips:
${(row.tips ?? []).map((t, i) => `${i + 1}. ${t}`).join('\n')}

Reply ONLY valid JSON:
{"seasonLabel":"","sowingPeriod":"","harvestPeriod":"","waterNeeds":"","soilType":"","tips":["tip1"]}`;

  const raw = await ollamaComplete(prompt, 500);
  try {
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as I18nBundle;
      return {
        seasonLabel: parsed.seasonLabel ?? row.seasonLabel ?? '',
        sowingPeriod: parsed.sowingPeriod ?? row.sowingPeriod ?? '',
        harvestPeriod: parsed.harvestPeriod ?? row.harvestPeriod ?? '',
        waterNeeds: parsed.waterNeeds ?? row.waterNeeds ?? '',
        soilType: parsed.soilType ?? row.soilType ?? '',
        tips: Array.isArray(parsed.tips) ? parsed.tips : row.tips ?? [],
      };
    }
  } catch {
    /* fall through */
  }

  return {
    seasonLabel: row.seasonLabel ?? '',
    sowingPeriod: row.sowingPeriod ?? '',
    harvestPeriod: row.harvestPeriod ?? '',
    waterNeeds: row.waterNeeds ?? '',
    soilType: row.soilType ?? '',
    tips: row.tips ?? [],
  };
}

async function persistLocalization(
  row: CropRow,
  lang: FarmerLanguage,
  displayName: string,
  details?: I18nBundle,
): Promise<void> {
  const localizedNames = { ...(row.localizedNames ?? {}), [lang]: displayName };
  const i18n = { ...getI18nCache(row), [lang]: { ...details, name: displayName } };
  const metadata = { ...(row.metadata as Record<string, unknown>), i18n };

  await db
    .update(crops)
    .set({
      localizedNames,
      metadata,
      searchAliases: sql`(
        SELECT COALESCE(jsonb_agg(DISTINCT val), '[]'::jsonb)
        FROM (
          SELECT jsonb_array_elements_text(COALESCE(${crops.searchAliases}, '[]'::jsonb)) AS val
          UNION ALL SELECT ${displayName.toLowerCase()}
        ) s
      )`,
    })
    .where(eq(crops.id, row.id));
}

export async function localizeCropRow(
  row: CropRow,
  lang: FarmerLanguage,
  mode: LocalizeMode = 'full',
): Promise<LocalizedCrop> {
  if (mode === 'none') {
    return withDisplayFields(row, {}, row.name);
  }

  if (lang === 'en' && mode === 'names') {
    return withDisplayFields(row, {}, row.name);
  }

  if (lang === 'te' && row.nameTe && mode === 'names') {
    return withDisplayFields(row, getI18nCache(row).te ?? {}, row.nameTe);
  }

  const cachedBundle = getI18nCache(row)[lang];
  let displayName = pickStaticName(row, lang) ?? cachedBundle?.name ?? null;

  if (!displayName) {
    displayName = await translateNameWithAi(row, lang);
    if (mode === 'names') {
      await persistLocalization(row, lang, displayName);
      return withDisplayFields(row, { name: displayName }, displayName);
    }
  }

  if (mode === 'names') {
    return withDisplayFields(row, cachedBundle ?? { name: displayName }, displayName);
  }

  if (lang === 'en') {
    const details = cachedBundle?.tips?.length
      ? cachedBundle
      : await translateDetailsWithAi(row, 'en');
    if (!cachedBundle?.tips?.length && (row.tips?.length ?? 0) > 0) {
      await persistLocalization(row, 'en', row.name, details);
    }
    return withDisplayFields(row, details, row.name);
  }

  if (lang === 'te' && row.nameTe && (row.tips?.length ?? 0) > 0 && !cachedBundle?.tips?.length) {
    return withDisplayFields(
      row,
      {
        seasonLabel: row.seasonLabel ?? '',
        sowingPeriod: row.sowingPeriod ?? '',
        harvestPeriod: row.harvestPeriod ?? '',
        waterNeeds: row.waterNeeds ?? '',
        soilType: row.soilType ?? '',
        tips: row.tips ?? [],
      },
      row.nameTe,
    );
  }

  const details =
    cachedBundle?.tips?.length || cachedBundle?.seasonLabel
      ? cachedBundle
      : await translateDetailsWithAi(row, lang);

  if (!displayName) displayName = details.name ?? (await translateNameWithAi(row, lang));

  if (!cachedBundle?.tips?.length && (row.tips?.length ?? 0) > 0) {
    await persistLocalization(row, lang, displayName, details);
  } else if (!pickStaticName(row, lang)) {
    await persistLocalization(row, lang, displayName, details);
  }

  return withDisplayFields(row, details, displayName);
}

export async function localizeCropsForFarmer(
  rows: CropRow[],
  lang: FarmerLanguage,
  mode: LocalizeMode = 'names',
): Promise<LocalizedCrop[]> {
  if (mode === 'none') {
    return rows.map((row) => withDisplayFields(row, {}, row.name));
  }

  if (lang === 'en' && mode === 'names') {
    return rows.map((row) => withDisplayFields(row, {}, row.name));
  }

  if (lang === 'te' && mode === 'names') {
    const needsAi = rows.filter((r) => !r.nameTe);
    const aiById = new Map<string, string>();

    if (needsAi.length && hasOllama()) {
      const batchSize = 8;
      for (let i = 0; i < needsAi.length; i += batchSize) {
        const chunk = needsAi.slice(i, i + batchSize);
        await Promise.all(
          chunk.map(async (row) => {
            const name = await translateNameWithAi(row, 'te');
            aiById.set(row.id, name);
            await persistLocalization(row, 'te', name);
          }),
        );
      }
    }

    return rows.map((row) =>
      withDisplayFields(row, {}, aiById.get(row.id) ?? row.nameTe ?? row.name),
    );
  }

  const batchSize = 8;
  const out: LocalizedCrop[] = [];

  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const localized = await Promise.all(chunk.map((row) => localizeCropRow(row, lang, mode)));
    out.push(...localized);
  }

  return out;
}

export function parseFarmerLanguage(code?: string | null): FarmerLanguage {
  const c = (code ?? 'te').toLowerCase();
  if (c === 'hi' || c === 'mr' || c === 'ta' || c === 'te' || c === 'kn' || c === 'en') return c;
  return 'te';
}

export function parseLocalizeMode(raw?: string | null, limit = 500): LocalizeMode {
  if (raw === 'false' || raw === 'none') return 'none';
  if (raw === 'full') return 'full';
  if (raw === 'names') return 'names';
  return limit > 200 ? 'names' : 'full';
}
