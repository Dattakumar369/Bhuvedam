import { API_CONFIG } from '@/constants/app';
import { wantsWebSearch } from '@/services/ai/farmerKnowledge';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';

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

/** Fetch agriculture knowledge from Neon (research, books, diseases, pesticides) for AI RAG */
export async function fetchKnowledgeContext(
  userQuery: string,
  cropIds: string[] = [],
): Promise<string> {
  if (!API_CONFIG.useBackendData || !userQuery.trim()) return '';

  try {
    const response = await apiClient.get<{ context?: string; data?: KnowledgeHit[] }>(
      ENDPOINTS.knowledge.ask,
      {
        params: {
          q: userQuery.slice(0, 200),
          crop: cropIds.slice(0, 2).join(',') || undefined,
        },
        timeout: 5000,
      },
    );
    return response.data.context ?? '';
  } catch {
    return 'Farming library could not be loaded. Check internet and answer from your expertise.';
  }
}

/** Bulk ag catalog (850+ fertilizers, 2500+ pesticides, 6000+ diseases) for AI */
export async function fetchAgCatalogContext(
  userQuery: string,
  cropIds: string[] = [],
): Promise<string> {
  if (!API_CONFIG.useBackendData) return '';

  try {
    const response = await apiClient.get<{ context?: string }>(ENDPOINTS.knowledge.catalog, {
      params: {
        q: userQuery.slice(0, 200),
        crop: cropIds.slice(0, 2).join(',') || undefined,
      },
      timeout: 5000,
    });
    return response.data.context ?? '';
  } catch {
    return '';
  }
}

export async function searchKnowledge(query: string): Promise<KnowledgeHit[]> {
  if (!API_CONFIG.useBackendData) return [];

  try {
    const response = await apiClient.get<{ data: KnowledgeHit[] }>(ENDPOINTS.knowledge.search, {
      params: { q: query, limit: 15 },
    });
    return response.data.data ?? [];
  } catch {
    return [];
  }
}

/** True when DB had no useful match — AI answer should be cached for reuse. */
export function isThinDbContext(context: string): boolean {
  const t = context.trim();
  if (!t) return true;
  if (/no matching entries in bhuvedam farming library/i.test(t)) return true;
  if (/no library match/i.test(t)) return true;
  if (/farming library could not be loaded/i.test(t)) return true;
  if (/library not loaded/i.test(t)) return true;
  if (/ONLINE AGRICULTURE SOURCES/i.test(t)) return false;
  return t.length < 120;
}

/** Client should fetch web research when DB is thin or web sources not yet loaded. */
export function shouldFetchWebResearch(context: string, userQuery: string): boolean {
  if (wantsWebSearch(userQuery)) return true;
  if (isThinDbContext(context)) return true;
  if (!/ONLINE AGRICULTURE SOURCES/i.test(context)) return true;
  return false;
}

/** When DB had no answer, save AI reply for other farmers (fire-and-forget). */
export async function cacheAiKnowledgeAnswer(
  query: string,
  answer: string,
  opts: { cropIds?: string[]; dbContext?: string } = {},
): Promise<void> {
  if (!API_CONFIG.useBackendData || !query.trim() || !answer.trim()) return;

  try {
    await apiClient.post(
      ENDPOINTS.knowledge.cache,
      {
        query: query.slice(0, 500),
        answer: answer.slice(0, 8000),
        cropIds: opts.cropIds?.slice(0, 5),
        dbContext: opts.dbContext?.slice(0, 4000),
      },
      { timeout: 8000 },
    );
  } catch {
    /* non-blocking — chat already succeeded */
  }
}

/** Search online agriculture sources when DB is empty or farmer says answer was wrong. */
export async function fetchWebResearchContext(
  userQuery: string,
  opts: { cropIds?: string[]; correction?: boolean; priorQuery?: string } = {},
): Promise<string> {
  if (!API_CONFIG.useBackendData || !userQuery.trim()) return '';

  try {
    const response = await apiClient.get<{ context?: string }>(ENDPOINTS.knowledge.research, {
      params: {
        q: userQuery.slice(0, 200),
        crop: opts.cropIds?.slice(0, 2).join(',') || undefined,
        correction: opts.correction ? 'true' : undefined,
        priorQuery: opts.priorQuery?.slice(0, 200) || undefined,
      },
      timeout: 20000,
    });
    return response.data.context ?? '';
  } catch {
    return '';
  }
}
