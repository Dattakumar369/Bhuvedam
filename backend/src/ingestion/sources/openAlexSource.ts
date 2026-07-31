import { sql } from 'drizzle-orm';

import { db } from '../../db';
import { agKnowledge } from '../../db/schema';
import { fetchJson, sleep } from '../utils';

type OpenAlexWork = {
  id?: string;
  title?: string;
  display_name?: string;
  publication_year?: number;
  cited_by_count?: number;
  authorships?: { author?: { display_name?: string } }[];
  abstract_inverted_index?: Record<string, number[]>;
  primary_location?: { source?: { display_name?: string } };
  doi?: string;
};

type OpenAlexResponse = { results?: OpenAlexWork[] };

function invertAbstract(index?: Record<string, number[]>): string {
  if (!index) return '';
  const pairs: [number, string][] = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const pos of positions) pairs.push([pos, word]);
  }
  pairs.sort((a, b) => a[0] - b[0]);
  return pairs
    .map((p) => p[1])
    .join(' ')
    .slice(0, 1200);
}

const RESEARCH_QUERIES = [
  'rice blast disease management India',
  'cotton bollworm integrated pest management',
  'tomato leaf curl virus control',
  'wheat rust fungicide',
  'soil health organic farming',
  'drip irrigation water use efficiency crops',
  'climate change agriculture adaptation',
  'biofertilizer plant growth',
  'pesticide resistance management',
  'precision agriculture smallholder farmers',
  'mandi price forecasting agriculture',
  'sugarcane red rot disease',
  'chickpea wilt management',
  'maize fall armyworm control',
  'soybean rust fungicide timing',
];

/** Sync top agricultural research from OpenAlex (what scientists publish) */
export async function syncOpenAlexResearch(perQuery = 8): Promise<{ fetched: number; upserted: number }> {
  let fetched = 0;
  let upserted = 0;

  for (const query of RESEARCH_QUERIES) {
    const url =
      `https://api.openalex.org/works?search=${encodeURIComponent(query)}` +
      `&filter=type:article&sort=cited_by_count:desc&per_page=${perQuery}`;

    try {
      const json = await fetchJson<OpenAlexResponse>(url);
      const results = json.results ?? [];
      fetched += results.length;

      for (const work of results) {
        const title = work.title ?? work.display_name;
        const externalId = work.id?.replace('https://openalex.org/', '') ?? title ?? '';
        if (!title || !externalId) continue;

        const authors =
          work.authorships?.map((a) => a.author?.display_name).filter(Boolean) as string[] ?? [];
        const abstract = invertAbstract(work.abstract_inverted_index);
        const journal = work.primary_location?.source?.display_name;

        await db
          .insert(agKnowledge)
          .values({
            type: 'research',
            title: title.slice(0, 500),
            summary: abstract.slice(0, 800) || `Research on: ${query}`,
            content: abstract,
            authors: authors.slice(0, 10),
            source: 'openalex',
            externalId,
            url: work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : work.id,
            tags: query.split(' ').filter((w) => w.length > 3),
            cropTags: extractCropTags(query),
            publishedAt: work.publication_year
              ? new Date(`${work.publication_year}-01-01`)
              : undefined,
            citationCount: work.cited_by_count ?? 0,
            metadata: { journal, query },
            syncedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [agKnowledge.source, agKnowledge.externalId],
            set: {
              citationCount: sql`excluded.citation_count`,
              summary: sql`excluded.summary`,
              syncedAt: new Date(),
            },
          });

        upserted++;
      }
    } catch (err) {
      console.warn(`OpenAlex skip "${query}":`, (err as Error).message);
    }

    await sleep(500);
  }

  return { fetched, upserted };
}

function extractCropTags(query: string): string[] {
  const crops = [
    'rice',
    'wheat',
    'cotton',
    'tomato',
    'maize',
    'soybean',
    'sugarcane',
    'chickpea',
    'groundnut',
  ];
  return crops.filter((c) => query.toLowerCase().includes(c));
}

/** Sync disease/pest entries from research titles + GBIF */
export async function syncDiseasePestKnowledge(): Promise<{ fetched: number; upserted: number }> {
  const topics = [
    { q: 'Magnaporthe oryzae rice blast', type: 'disease' as const, crop: 'rice' },
    { q: 'Helicoverpa armigera cotton bollworm', type: 'pest' as const, crop: 'cotton' },
    { q: 'Tomato leaf curl virus', type: 'disease' as const, crop: 'tomato' },
    { q: 'Puccinia triticina wheat rust', type: 'disease' as const, crop: 'wheat' },
    { q: 'Spodoptera frugiperda fall armyworm', type: 'pest' as const, crop: 'maize' },
    { q: 'Aphids crop pest management', type: 'pest' as const, crop: 'general' },
    { q: 'Whitefly Bemisia tabaci pesticide', type: 'pest' as const, crop: 'general' },
    { q: 'Fusarium wilt chickpea', type: 'disease' as const, crop: 'chickpea' },
  ];

  let fetched = 0;
  let upserted = 0;

  for (const topic of topics) {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(topic.q)}&sort=cited_by_count:desc&per_page=3`;
    try {
      const json = await fetchJson<OpenAlexResponse>(url);
      const top = json.results?.[0];
      if (!top) continue;
      fetched++;

      const title = top.title ?? topic.q;
      const externalId = `pest_${topic.q.replace(/\s+/g, '_').slice(0, 80)}`;
      const abstract = invertAbstract(top.abstract_inverted_index);

      await db
        .insert(agKnowledge)
        .values({
          type: topic.type,
          title: title.slice(0, 500),
          summary:
            abstract.slice(0, 600) ||
            `Scientific literature on ${topic.q}. Top cited research informs IPM and spray decisions.`,
          content: abstract,
          authors: top.authorships?.map((a) => a.author?.display_name).filter(Boolean) as string[],
          source: 'openalex_pest',
          externalId,
          url: top.id,
          tags: [topic.type, topic.crop, ...topic.q.split(' ').slice(0, 4)],
          cropTags: [topic.crop],
          citationCount: top.cited_by_count ?? 0,
          metadata: { scientificQuery: topic.q },
          syncedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [agKnowledge.source, agKnowledge.externalId],
          set: { summary: sql`excluded.summary`, syncedAt: new Date() },
        });

      upserted++;
      await sleep(400);
    } catch {
      /* skip */
    }
  }

  return { fetched, upserted };
}

/** Sync pesticide/fertilizer research summaries */
export async function syncPesticideResearch(): Promise<{ fetched: number; upserted: number }> {
  const queries = [
    'tricyclazole rice blast fungicide',
    'imidacloprid neonicotinoid pest control',
    'glyphosate herbicide safety crops',
    'urea nitrogen use efficiency',
    'DAP fertilizer application timing',
    'neem oil biopesticide',
    'copper oxychloride fungicide',
  ];

  let upserted = 0;
  for (const q of queries) {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(q)}&per_page=2&sort=cited_by_count:desc`;
    try {
      const json = await fetchJson<OpenAlexResponse>(url);
      for (const work of json.results ?? []) {
        const title = work.title ?? q;
        const externalId = `chem_${q.replace(/\s+/g, '_').slice(0, 60)}`;
        await db
          .insert(agKnowledge)
          .values({
            type: q.includes('fertilizer') || q.includes('urea') || q.includes('DAP') ? 'fertilizer' : 'pesticide',
            title: title.slice(0, 500),
            summary: invertAbstract(work.abstract_inverted_index).slice(0, 700) || q,
            source: 'openalex_chem',
            externalId,
            url: work.id,
            tags: q.split(' '),
            citationCount: work.cited_by_count ?? 0,
            syncedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [agKnowledge.source, agKnowledge.externalId],
            set: { syncedAt: new Date() },
          });
        upserted++;
      }
      await sleep(400);
    } catch {
      /* skip */
    }
  }

  return { fetched: queries.length, upserted };
}
