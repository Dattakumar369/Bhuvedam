import { createHash } from 'node:crypto';

import { sql } from 'drizzle-orm';

import { db } from '../db';
import { agKnowledge } from '../db/schema';

const SOURCE = 'ai_cache';
const MIN_ANSWER_LEN = 80;
const MAX_QUERY_LEN = 500;
const MAX_ANSWER_LEN = 8000;

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, MAX_QUERY_LEN);
}

function queryExternalId(query: string): string {
  return createHash('sha256').update(normalizeQuery(query)).digest('hex').slice(0, 40);
}

/** True when DB RAG returned nothing useful for this question. */
export function isDbContextThin(context: string): boolean {
  const t = context.trim();
  if (!t) return true;
  if (/no matching entries in bhuvedam farming library/i.test(t)) return true;
  if (/no library match/i.test(t)) return true;
  if (/farming library could not be loaded/i.test(t)) return true;
  if (/backend catalog not loaded/i.test(t)) return true;
  if (/backend unreachable/i.test(t)) return true;
  return t.length < 120;
}

export function shouldCacheAiAnswer(query: string, answer: string, dbContext = ''): boolean {
  const q = query.trim();
  const a = answer.trim();
  if (q.length < 8 || a.length < MIN_ANSWER_LEN) return false;
  if (/^(sorry|error|failed|unavailable)/i.test(a)) return false;
  if (!isDbContextThin(dbContext)) return false;
  return true;
}

/** Store AI answer in ag_knowledge so the next farmer with the same question gets DB context. */
export async function cacheAiKnowledgeAnswer(
  query: string,
  answer: string,
  opts: { cropIds?: string[]; provider?: string; dbContext?: string } = {},
): Promise<{ stored: boolean; id?: string }> {
  const q = query.trim().slice(0, MAX_QUERY_LEN);
  const a = answer.trim().slice(0, MAX_ANSWER_LEN);
  if (!shouldCacheAiAnswer(q, a, opts.dbContext ?? '')) return { stored: false };

  const externalId = queryExternalId(q);
  const title = q.length > 200 ? `${q.slice(0, 197)}...` : q;
  const cropTags = (opts.cropIds ?? []).slice(0, 5);

  const [row] = await db
    .insert(agKnowledge)
    .values({
      type: 'general',
      title,
      summary: a.slice(0, 600),
      content: a,
      authors: ['Bhuvedam AI'],
      source: SOURCE,
      externalId,
      tags: ['ai_answer', 'farmer_qa'],
      cropTags,
      citationCount: 1,
      metadata: {
        provider: opts.provider ?? 'ai',
        query: q,
        cachedAt: new Date().toISOString(),
      },
    })
    .onConflictDoUpdate({
      target: [agKnowledge.source, agKnowledge.externalId],
      set: {
        summary: a.slice(0, 600),
        content: a,
        cropTags,
        citationCount: sql`COALESCE(${agKnowledge.citationCount}, 0) + 1`,
        syncedAt: new Date(),
        metadata: {
          provider: opts.provider ?? 'ai',
          query: q,
          cachedAt: new Date().toISOString(),
          updated: true,
        },
      },
    })
    .returning({ id: agKnowledge.id });

  return { stored: true, id: row?.id };
}
