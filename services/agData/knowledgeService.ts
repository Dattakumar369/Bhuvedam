import { API_CONFIG } from '@/constants/app';
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
    return 'Status: Knowledge backend unreachable — set EXPO_PUBLIC_API_URL to your PC WiFi IP (not localhost on phone).';
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
