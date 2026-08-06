import { sql } from 'drizzle-orm';

import { db } from '../../db';
import { agKnowledge } from '../../db/schema';
import { ANGRAU_PUBLICATIONS } from '../data/angrauPublications';
import { DOA_ADVISORIES } from '../data/doaAdvisories';
import { FAO_PUBLICATIONS } from '../data/faoPublications';
import { ICAR_GUIDELINES } from '../data/icarGuidelines';
import { ICAR_PUBLICATIONS } from '../data/icarPublications';
import { PJTSAU_PUBLICATIONS } from '../data/pjtsauPublications';
import type { PublicationEntry } from '../data/publicationTypes';
import { publicationPriority } from '../data/publicationTypes';
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
  return pairs
    .map((p) => p[1])
    .join(' ')
    .slice(0, 2000);
}

function icarGuidelinesToPublications(): PublicationEntry[] {
  return ICAR_GUIDELINES.map((g) => ({
    id: g.id,
    source: 'icar',
    type:
      g.category === 'disease'
        ? 'disease'
        : g.category === 'pest'
          ? 'pest'
          : g.category === 'fertilizer'
            ? 'fertilizer'
            : 'guide',
    title: g.title,
    titleTe: g.titleTe,
    summary: g.content.slice(0, 300),
    content: g.content,
    url: g.sourceUrl,
    cropTags: g.cropId ? [g.cropId] : [],
    tags: g.tags,
    season: g.season,
    state: g.region,
    publisher: 'ICAR',
    documentType: 'publication' as const,
  }));
}

function doaAdvisoriesToPublications(): PublicationEntry[] {
  return DOA_ADVISORIES.map((a) => ({
    id: a.id,
    source: 'gov_advisory',
    type:
      a.type === 'advisory'
        ? 'guide'
        : a.type === 'fertilizer'
          ? 'fertilizer'
          : a.type === 'crop'
            ? 'guide'
            : 'general',
    title: a.title,
    titleTe: a.titleTe,
    summary: a.description.slice(0, 300),
    content: a.description,
    url: a.sourceUrl,
    cropTags: a.cropTags,
    tags: [a.type, a.source],
    season: a.season,
    state: a.state,
    publisher: a.source === 'moa' ? 'Ministry of Agriculture' : 'Department of Agriculture',
    documentType: 'advisory' as const,
  }));
}

function allCuratedPublications(): PublicationEntry[] {
  return [
    ...ICAR_PUBLICATIONS,
    ...icarGuidelinesToPublications(),
    ...PJTSAU_PUBLICATIONS,
    ...ANGRAU_PUBLICATIONS,
    ...FAO_PUBLICATIONS,
    ...doaAdvisoriesToPublications(),
  ];
}

async function upsertPublication(entry: PublicationEntry): Promise<void> {
  const priority = publicationPriority(entry.source);
  const type =
    entry.type === 'guide' ? 'guide' : entry.type;

  await db
    .insert(agKnowledge)
    .values({
      type,
      title: entry.title.slice(0, 500),
      summary: entry.summary.slice(0, 800),
      content: entry.content,
      authors: entry.authors ?? [entry.publisher ?? entry.source],
      source: entry.source,
      externalId: entry.id,
      url: entry.url,
      tags: [...(entry.tags ?? []), entry.documentType ?? 'publication'],
      cropTags: entry.cropTags ?? [],
      publishedAt: entry.publishedYear
        ? new Date(`${entry.publishedYear}-06-01`)
        : undefined,
      citationCount: 100 - priority,
      metadata: {
        priority,
        titleTe: entry.titleTe,
        season: entry.season,
        state: entry.state,
        publisher: entry.publisher,
        documentType: entry.documentType,
      },
      syncedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [agKnowledge.source, agKnowledge.externalId],
      set: {
        title: sql`excluded.title`,
        summary: sql`excluded.summary`,
        content: sql`excluded.content`,
        tags: sql`excluded.tags`,
        cropTags: sql`excluded.crop_tags`,
        citationCount: sql`excluded.citation_count`,
        metadata: sql`excluded.metadata`,
        syncedAt: new Date(),
      },
    });
}

/** Sync curated ICAR, PJTSAU, ANGRAU, FAO, and government advisory publications. */
export async function syncCuratedPublications(): Promise<{ fetched: number; upserted: number }> {
  const entries = allCuratedPublications();
  let upserted = 0;
  for (const entry of entries) {
    await upsertPublication(entry);
    upserted++;
  }
  return { fetched: entries.length, upserted };
}

const UNIVERSITY_RESEARCH_SOURCES = [
  {
    institution: 'Indian Council of Agricultural Research',
    source: 'university_research',
    tag: 'ICAR',
    queries: [
      'rice blast India',
      'cotton IPM India',
      'groundnut aflatoxin India',
    ],
  },
  {
    institution: 'Acharya N G Ranga Agricultural University',
    source: 'university_research',
    tag: 'ANGRAU',
    queries: ['chilli thrips Andhra Pradesh', 'groundnut tikka AP', 'cotton pink bollworm AP'],
  },
  {
    institution: 'Professor Jayashankar Telangana State Agricultural University',
    source: 'university_research',
    tag: 'PJTSAU',
    queries: ['redgram wilt Telangana', 'cotton pink bollworm Telangana', 'maize fall armyworm Telangana'],
  },
];

/** Fetch top research papers from ICAR / ANGRAU / PJTSAU via OpenAlex. */
export async function syncUniversityResearch(perQuery = 5): Promise<{ fetched: number; upserted: number }> {
  let fetched = 0;
  let upserted = 0;

  for (const uni of UNIVERSITY_RESEARCH_SOURCES) {
    for (const query of uni.queries) {
      const searchText = `${query} ${uni.institution} India`;
      const url =
        `https://api.openalex.org/works?search=${encodeURIComponent(searchText)}` +
        `&filter=type:article&sort=cited_by_count:desc&per_page=${perQuery}`;

      try {
        const json = await fetchJson<OpenAlexResponse>(url);
        const results = json.results ?? [];
        fetched += results.length;

        for (const work of results) {
          const title = work.title ?? work.display_name;
          const externalId =
            work.id?.replace('https://openalex.org/', '') ??
            `${uni.tag}_${query.replace(/\s+/g, '_').slice(0, 40)}`;
          if (!title) continue;

          const abstract = invertAbstract(work.abstract_inverted_index);
          const authors =
            (work.authorships?.map((a) => a.author?.display_name).filter(Boolean) as string[]) ?? [];

          await db
            .insert(agKnowledge)
            .values({
              type: 'research',
              title: title.slice(0, 500),
              summary: abstract.slice(0, 800) || `${uni.tag} research: ${query}`,
              content: abstract,
              authors: authors.slice(0, 10),
              source: uni.source,
              externalId,
              url: work.doi
                ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}`
                : work.id,
              tags: [uni.tag, 'research', ...query.split(' ').slice(0, 4)],
              cropTags: extractCropTags(query),
              publishedAt: work.publication_year
                ? new Date(`${work.publication_year}-01-01`)
                : undefined,
              citationCount: (work.cited_by_count ?? 0) + 50,
              metadata: {
                priority: publicationPriority(uni.source),
                institution: uni.institution,
                query,
                publisher: uni.tag,
              },
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
        console.warn(`University research skip ${uni.tag}/${query}:`, (err as Error).message);
      }

      await sleep(600);
    }
  }

  return { fetched, upserted };
}

function extractCropTags(text: string): string[] {
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
    'chilli',
    'redgram',
    'sorghum',
    'mango',
  ];
  const lower = text.toLowerCase();
  return crops.filter((c) => lower.includes(c));
}

/** Full publication knowledge sync — curated books + university research. */
export async function syncAllPublications(): Promise<{
  curated: { fetched: number; upserted: number };
  research: { fetched: number; upserted: number };
}> {
  const curated = await syncCuratedPublications();
  const research = await syncUniversityResearch();
  return { curated, research };
}
