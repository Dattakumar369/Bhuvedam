import { sql } from 'drizzle-orm';

import { db } from '../../db';
import { agKnowledge } from '../../db/schema';
import { fetchJson, sleep } from '../utils';

type OpenLibraryDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  subject?: string[];
  publisher?: string[];
  isbn?: string[];
};

type OpenLibraryResponse = { docs?: OpenLibraryDoc[] };

const BOOK_QUERIES = [
  'agriculture India farming',
  'crop production textbook',
  'plant pathology',
  'integrated pest management',
  'soil science agriculture',
  'horticulture India',
  'organic farming',
  'agronomy',
];

export async function syncAgBooks(perQuery = 10): Promise<{ fetched: number; upserted: number }> {
  let fetched = 0;
  let upserted = 0;

  for (const query of BOOK_QUERIES) {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${perQuery}&fields=key,title,author_name,first_publish_year,subject,publisher,isbn`;

    try {
      const json = await fetchJson<OpenLibraryResponse>(url);
      for (const doc of json.docs ?? []) {
        if (!doc.key || !doc.title) continue;
        fetched++;
        const externalId = doc.key.replace('/works/', '');
        const authors = doc.author_name ?? [];
        const subjects = (doc.subject ?? []).slice(0, 8);

        await db
          .insert(agKnowledge)
          .values({
            type: 'book',
            title: doc.title.slice(0, 500),
            summary: `Authors: ${authors.join(', ') || 'Unknown'}. Subjects: ${subjects.join(', ')}.`,
            authors,
            source: 'openlibrary',
            externalId,
            url: `https://openlibrary.org${doc.key}`,
            tags: [...subjects, query],
            publishedAt: doc.first_publish_year
              ? new Date(`${doc.first_publish_year}-01-01`)
              : undefined,
            syncedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [agKnowledge.source, agKnowledge.externalId],
            set: { summary: sql`excluded.summary`, syncedAt: new Date() },
          });
        upserted++;
      }
    } catch (err) {
      console.warn(`OpenLibrary skip:`, (err as Error).message);
    }
    await sleep(300);
  }

  return { fetched, upserted };
}

export async function syncScientistInsights(): Promise<{ fetched: number; upserted: number }> {
  const insights: { id: string; title: string; summary: string; tags: string[]; crops?: string[] }[] = [
    {
      id: 'ipm_principle',
      title: 'IPM — scientific consensus',
      summary:
        'Monitor weekly, spray only at economic threshold, rotate pesticide modes, combine cultural + biological + chemical control.',
      tags: ['IPM', 'pest'],
    },
    {
      id: 'soil_ph_rice',
      title: 'Soil pH for rice',
      summary: 'Optimal pH 5.5–6.5. Lime if pH < 5. Zinc at tillering if bronzing in alkaline soils.',
      tags: ['soil', 'rice'],
      crops: ['rice'],
    },
    {
      id: 'nitrogen_split',
      title: 'Split nitrogen — yield research',
      summary: '50% basal, 25% active growth, 25% flowering. Improves N efficiency 15–20%.',
      tags: ['fertilizer'],
    },
  ];

  for (const item of insights) {
    await db
      .insert(agKnowledge)
      .values({
        type: 'scientist_insight',
        title: item.title,
        summary: item.summary,
        source: 'icar_consensus',
        externalId: item.id,
        tags: item.tags,
        cropTags: item.crops ?? [],
        syncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [agKnowledge.source, agKnowledge.externalId],
        set: { summary: sql`excluded.summary`, syncedAt: new Date() },
      });
  }

  return { fetched: insights.length, upserted: insights.length };
}

export async function syncAllKnowledge(): Promise<{ fetched: number; upserted: number }> {
  const { syncOpenAlexResearch, syncDiseasePestKnowledge, syncPesticideResearch } = await import(
    './openAlexSource'
  );

  let fetched = 0;
  let upserted = 0;

  for (const fn of [
    syncOpenAlexResearch,
    syncDiseasePestKnowledge,
    syncPesticideResearch,
    syncAgBooks,
    syncScientistInsights,
  ]) {
    const r = await fn();
    fetched += r.fetched;
    upserted += r.upserted;
  }

  return { fetched, upserted };
}
