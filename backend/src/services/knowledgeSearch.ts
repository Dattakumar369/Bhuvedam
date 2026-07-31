import { desc, ilike, or, sql } from 'drizzle-orm';

import { db } from '../db';
import { agKnowledge, agrochemicals, diseases, diseaseSprays } from '../db/schema';
import { buildAgCatalogContextForAI } from './agCatalogSearch';

export interface KnowledgeHit {
  type: string;
  title: string;
  summary: string | null;
  authors: string[];
  url: string | null;
  source: string;
  citationCount: number | null;
  tags: string[];
}

export async function searchKnowledge(query: string, limit = 20): Promise<KnowledgeHit[]> {
  const q = query.trim();
  if (!q) return [];

  const pattern = `%${q}%`;
  const words = q.split(/\s+/).filter((w) => w.length > 2).slice(0, 4);

  const rows = await db
    .select({
      type: agKnowledge.type,
      title: agKnowledge.title,
      summary: agKnowledge.summary,
      authors: agKnowledge.authors,
      url: agKnowledge.url,
      source: agKnowledge.source,
      citationCount: agKnowledge.citationCount,
      tags: agKnowledge.tags,
    })
    .from(agKnowledge)
    .where(
      or(
        ilike(agKnowledge.title, pattern),
        ilike(agKnowledge.summary, pattern),
        sql`${agKnowledge.tags}::text ilike ${pattern}`,
        ...words.map((w) => ilike(agKnowledge.title, `%${w}%`)),
      ),
    )
    .orderBy(desc(agKnowledge.citationCount))
    .limit(limit);

  const hits: KnowledgeHit[] = rows.map((r) => ({
    type: r.type,
    title: r.title,
    summary: r.summary,
    authors: (r.authors as string[]) ?? [],
    url: r.url,
    source: r.source,
    citationCount: r.citationCount,
    tags: (r.tags as string[]) ?? [],
  }));

  if (hits.length < limit) {
    const diseaseRows = await db
      .select()
      .from(diseases)
      .where(or(ilike(diseases.name, pattern), ilike(diseases.symptoms, pattern)))
      .limit(5);

    for (const d of diseaseRows) {
      const sprays = await db
        .select()
        .from(diseaseSprays)
        .where(sql`${diseaseSprays.diseaseId} = ${d.id}`)
        .limit(3);
      hits.push({
        type: 'disease',
        title: d.name,
        summary: `${d.symptoms ?? ''} → ${sprays.map((s) => s.productName).join(', ')}`,
        authors: [],
        url: null,
        source: 'database',
        citationCount: null,
        tags: [d.cropId],
      });
    }

    const chemRows = await db
      .select()
      .from(agrochemicals)
      .where(or(ilike(agrochemicals.name, pattern), ilike(agrochemicals.target, pattern)))
      .limit(5);

    for (const c of chemRows) {
      hits.push({
        type: c.type,
        title: c.name,
        summary: [c.dose, c.timing, c.target].filter(Boolean).join(' '),
        authors: [],
        url: null,
        source: c.source,
        citationCount: null,
        tags: [],
      });
    }
  }

  return hits.slice(0, limit);
}

export function formatKnowledgeForAI(hits: KnowledgeHit[], query: string, catalogContext = ''): string {
  const sections: string[] = [];

  if (catalogContext.trim()) {
    sections.push(catalogContext.trim(), '');
  }

  if (!hits.length && !catalogContext.trim()) {
    return `No knowledge DB hits for "${query}" — use live data + general expertise.`;
  }

  if (hits.length) {
    const lines = [`Agriculture knowledge for: "${query}" (${hits.length} research/sources)`, ''];

    for (const h of hits) {
      const auth = h.authors.length ? ` — ${h.authors.slice(0, 3).join(', ')}` : '';
      const cite = h.citationCount ? ` [${h.citationCount} citations]` : '';
      lines.push(`[${h.type.toUpperCase()}] ${h.title}${auth}${cite}`);
      if (h.summary) lines.push(`  ${h.summary.slice(0, 450)}`);
      if (h.url) lines.push(`  Link: ${h.url}`);
      lines.push('');
    }

    lines.push(
      'Use research above + DB products when helpful. Reason naturally — do not read like a fixed script.',
    );
    sections.push(lines.join('\n'));
  }

  return sections.join('\n\n') || catalogContext;
}

/** Full AI context: bulk ag catalog + research knowledge */
export async function buildKnowledgeContextForAI(
  query: string,
  cropIds: string[] = [],
): Promise<string> {
  const [hits, catalogContext] = await Promise.all([
    searchKnowledge(query, 15),
    buildAgCatalogContextForAI(query, cropIds),
  ]);
  return formatKnowledgeForAI(hits, query, catalogContext);
}
