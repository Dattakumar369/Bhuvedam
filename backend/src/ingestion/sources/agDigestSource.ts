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
  return pairs.map((p) => p[1]).join(' ').slice(0, 900);
}

const DIGEST_QUERIES: {
  q: string;
  category: 'market' | 'global' | 'pest';
  region: 'india' | 'ap_telangana' | 'global';
  crop?: string;
  type: 'general' | 'pest' | 'disease';
}[] = [
  { q: 'agriculture commodity market India mandi prices', category: 'market', region: 'india', type: 'general' },
  { q: 'crop export import India agriculture trade 2024', category: 'market', region: 'india', type: 'general' },
  { q: 'minimum support price MSP crops India', category: 'market', region: 'india', type: 'general' },
  { q: 'global food security agriculture climate 2024', category: 'global', region: 'global', type: 'general' },
  { q: 'world agriculture production trends FAO', category: 'global', region: 'global', type: 'general' },
  { q: 'precision agriculture smallholder farmers technology', category: 'global', region: 'global', type: 'general' },
  { q: 'rice blast disease Andhra Pradesh Telangana', category: 'pest', region: 'ap_telangana', crop: 'rice', type: 'disease' },
  { q: 'cotton pink bollworm pest management India', category: 'pest', region: 'india', crop: 'cotton', type: 'pest' },
  { q: 'chilli thrips pest Andhra Pradesh', category: 'pest', region: 'ap_telangana', crop: 'chilli', type: 'pest' },
  { q: 'tomato leaf curl virus Telangana', category: 'pest', region: 'ap_telangana', crop: 'tomato', type: 'disease' },
  { q: 'groundnut tikka leaf spot India', category: 'pest', region: 'india', crop: 'groundnut', type: 'disease' },
  { q: 'maize fall armyworm India control', category: 'pest', region: 'india', crop: 'maize', type: 'pest' },
  { q: 'sugarcane red rot disease management', category: 'pest', region: 'india', crop: 'sugarcane', type: 'disease' },
  { q: 'soybean rust fungicide India', category: 'pest', region: 'india', crop: 'soybean', type: 'disease' },
  { q: 'onion thrips pest management', category: 'pest', region: 'india', crop: 'onion', type: 'pest' },
  { q: 'turmeric rhizome rot disease', category: 'pest', region: 'india', crop: 'turmeric', type: 'disease' },
  { q: 'mango hopper pest control India', category: 'pest', region: 'india', crop: 'mango', type: 'pest' },
  { q: 'banana Panama disease India', category: 'pest', region: 'india', crop: 'banana', type: 'disease' },
];

const monthTag = () => {
  const m = new Date().getMonth() + 1;
  return `month_${m}`;
};

/** Daily agriculture digest — market news, global trends, regional pest/disease alerts */
export async function syncAgDailyDigest(perQuery = 4): Promise<{ fetched: number; upserted: number }> {
  let fetched = 0;
  let upserted = 0;
  const year = new Date().getFullYear();

  for (const item of DIGEST_QUERIES) {
    const url =
      `https://api.openalex.org/works?search=${encodeURIComponent(item.q)}` +
      `&filter=type:article,publication_year:${year - 1}-${year}&sort=cited_by_count:desc&per_page=${perQuery}`;

    try {
      const json = await fetchJson<OpenAlexResponse>(url);
      const results = json.results ?? [];
      fetched += results.length;

      for (const work of results) {
        const title = work.title ?? work.display_name;
        const externalId = `digest_${item.category}_${work.id?.replace('https://openalex.org/', '') ?? title?.slice(0, 40)}`;
        if (!title) continue;

        const abstract = invertAbstract(work.abstract_inverted_index);
        const authors =
          work.authorships?.map((a) => a.author?.display_name).filter(Boolean) as string[] ?? [];

        await db
          .insert(agKnowledge)
          .values({
            type: item.type,
            title: title.slice(0, 500),
            summary:
              abstract.slice(0, 700) ||
              `${item.category === 'market' ? 'Market insight' : item.category === 'global' ? 'Global agriculture' : 'Pest/disease alert'}: ${item.q}`,
            content: abstract,
            authors: authors.slice(0, 6),
            source: 'ag_digest',
            externalId: externalId.slice(0, 200),
            url: work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : work.id,
            tags: ['daily_digest', item.category, item.region, monthTag()],
            cropTags: item.crop ? [item.crop] : [],
            citationCount: work.cited_by_count ?? 0,
            metadata: {
              category: item.category,
              region: item.region,
              query: item.q,
              digestDate: new Date().toISOString().slice(0, 10),
            },
            syncedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [agKnowledge.source, agKnowledge.externalId],
            set: {
              summary: sql`excluded.summary`,
              citationCount: sql`excluded.citation_count`,
              tags: sql`excluded.tags`,
              syncedAt: new Date(),
            },
          });

        upserted++;
      }
    } catch (err) {
      console.warn(`Digest skip "${item.q}":`, (err as Error).message);
    }

    await sleep(450);
  }

  return { fetched, upserted };
}
