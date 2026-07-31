import { API_CONFIG } from '@/constants/app';
import { ENDPOINTS } from '@/services/api/endpoints';
import { apiClient } from '@/services/api/client';
import type { SyncStatusSummary } from '@/types/alerts';

type RawSyncResponse = {
  sources?: { id: string; name: string; lastSyncAt: string | null }[];
  recentJobs?: { sourceId: string; status: string; startedAt: string; finishedAt?: string }[];
  mandiLastSync?: string | null;
  weatherLastSync?: string | null;
};

export async function fetchSyncStatus(): Promise<SyncStatusSummary | null> {
  if (!API_CONFIG.useBackendData) return null;

  try {
    const res = await apiClient.get<RawSyncResponse>(ENDPOINTS.sync.status, { timeout: 8000 });
    const sources = res.data.sources ?? [];
    const mandi = sources.find((s) => s.id === 'agmarknet');
    const weather = sources.find((s) => s.id === 'open_meteo');

    return {
      mandiLastSync: res.data.mandiLastSync ?? mandi?.lastSyncAt ?? null,
      weatherLastSync: res.data.weatherLastSync ?? weather?.lastSyncAt ?? null,
      sources: sources.map((s) => ({
        id: s.id,
        name: s.name,
        lastSyncAt: s.lastSyncAt,
      })),
    };
  } catch {
    return null;
  }
}

export function formatFreshnessLabel(iso: string | null | undefined): string {
  if (!iso) return 'Not synced yet';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Updated just now';
  if (mins < 60) return `Updated ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days}d ago`;
}

export function freshnessTone(iso: string | null | undefined): 'fresh' | 'stale' | 'unknown' {
  if (!iso) return 'unknown';
  const hours = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (hours <= 6) return 'fresh';
  if (hours <= 48) return 'stale';
  return 'unknown';
}
