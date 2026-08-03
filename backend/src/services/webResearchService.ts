import { fetchJson } from '../ingestion/utils';
import { buildKnowledgeContextForAI } from './knowledgeSearch';
import { isCorrectionMessage } from './correctionDetect';

export interface WebSnippet {
  title: string;
  snippet: string;
  url: string;
  source: 'openalex' | 'wikipedia' | 'duckduckgo' | 'serper' | 'db';
}

export interface WebResearchResult {
  query: string;
  snippets: WebSnippet[];
  formattedContext: string;
  dbContext: string;
}

const AG_SUFFIX = ' agriculture India farmer';

type OpenAlexWork = {
  id?: string;
  title?: string;
  display_name?: string;
  cited_by_count?: number;
  doi?: string;
  abstract_inverted_index?: Record<string, number[]>;
};

type OpenAlexResponse = { results?: OpenAlexWork[] };

type WikiSearchResponse = {
  query?: { search?: { title?: string }[] };
};

type WikiSummary = {
  title?: string;
  extract?: string;
  content_urls?: { desktop?: { page?: string } };
};

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
    .slice(0, 500);
}

function buildSearchQuery(query: string, correctionNote?: string): string {
  const base = query.trim().slice(0, 180);
  if (correctionNote && isCorrectionMessage(correctionNote)) {
    return `${base} verified agriculture information`.slice(0, 200);
  }
  return `${base}${AG_SUFFIX}`.slice(0, 200);
}

async function searchOpenAlex(query: string): Promise<WebSnippet[]> {
  try {
    const url =
      `https://api.openalex.org/works?search=${encodeURIComponent(query)}` +
      '&filter=type:article&sort=cited_by_count:desc&per_page=4';
    const json = await fetchJson<OpenAlexResponse>(url);
    return (json.results ?? [])
      .map((work) => {
        const title = work.title ?? work.display_name ?? '';
        if (!title) return null;
        const abstract = invertAbstract(work.abstract_inverted_index);
        const doi = work.doi?.replace('https://doi.org/', '');
        return {
          title,
          snippet: abstract || `Research article (${work.cited_by_count ?? 0} citations)`,
          url: doi ? `https://doi.org/${doi}` : (work.id ?? ''),
          source: 'openalex' as const,
        };
      })
      .filter(Boolean) as WebSnippet[];
  } catch {
    return [];
  }
}

async function searchWikipedia(query: string): Promise<WebSnippet[]> {
  try {
    const searchUrl =
      `https://en.wikipedia.org/w/api.php?action=query&list=search` +
      `&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=2`;
    const search = await fetchJson<WikiSearchResponse>(searchUrl);
    const titles = search.query?.search?.map((s) => s.title).filter(Boolean) ?? [];
    const snippets: WebSnippet[] = [];

    for (const title of titles.slice(0, 2)) {
      if (!title) continue;
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
      const summary = await fetchJson<WikiSummary>(summaryUrl);
      if (!summary.extract) continue;
      snippets.push({
        title: summary.title ?? title,
        snippet: summary.extract.slice(0, 500),
        url: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        source: 'wikipedia',
      });
    }
    return snippets;
  } catch {
    return [];
  }
}

async function searchDuckDuckGo(query: string): Promise<WebSnippet[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' agriculture')}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Bhuvedam/1.0 (agriculture assistant)',
        Accept: 'text/html',
      },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const snippets: WebSnippet[] = [];
    const resultRe =
      /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;
    while ((match = resultRe.exec(html)) && snippets.length < 4) {
      const rawUrl = match[1]?.replace(/&amp;/g, '&') ?? '';
      const title = match[2]?.replace(/<[^>]+>/g, '').trim() ?? '';
      const snippet = match[3]?.replace(/<[^>]+>/g, '').trim() ?? '';
      if (!title || !snippet) continue;
      snippets.push({
        title,
        snippet: snippet.slice(0, 400),
        url: rawUrl,
        source: 'duckduckgo',
      });
    }
    return snippets;
  } catch {
    return [];
  }
}

async function searchSerper(query: string): Promise<WebSnippet[]> {
  const key = process.env.SERPER_API_KEY?.trim();
  if (!key) return [];
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 5, gl: 'in' }),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      organic?: { title?: string; snippet?: string; link?: string }[];
    };
    return (json.organic ?? [])
      .slice(0, 5)
      .map((row) => ({
        title: row.title ?? '',
        snippet: row.snippet ?? '',
        url: row.link ?? '',
        source: 'serper' as const,
      }))
      .filter((s) => s.title && s.snippet);
  } catch {
    return [];
  }
}

export function formatWebSnippetsForAI(
  snippets: WebSnippet[],
  query: string,
  dbContext = '',
): string {
  const parts: string[] = [];

  if (dbContext.trim().length >= 80) {
    parts.push('--- BHUvedam LIBRARY ---', dbContext.trim());
  }

  if (snippets.length) {
    parts.push(`--- ONLINE AGRICULTURE SOURCES for "${query}" ---`);
    snippets.forEach((s, i) => {
      parts.push(`${i + 1}. ${s.title} (${s.source})`);
      parts.push(`   ${s.snippet}`);
      if (s.url) parts.push(`   Source: ${s.url}`);
    });
  }

  return parts.join('\n');
}

/** Search trusted online agriculture sources + local DB. Never throws. */
export async function researchAgricultureOnline(
  query: string,
  opts: { correction?: boolean; correctionNote?: string; cropIds?: string[] } = {},
): Promise<WebResearchResult> {
  const q = query.trim();
  if (!q) {
    return { query: q, snippets: [], formattedContext: '', dbContext: '' };
  }

  const searchQuery = buildSearchQuery(q, opts.correctionNote);
  const dbContext = await buildKnowledgeContextForAI(q, opts.cropIds ?? []).catch(() => '');

  const [openAlex, wiki, webResults] = await Promise.all([
    searchOpenAlex(searchQuery),
    searchWikipedia(q),
    searchSerper(searchQuery).then((s) => (s.length ? s : searchDuckDuckGo(searchQuery))),
  ]);

  const seen = new Set<string>();
  const snippets: WebSnippet[] = [];
  for (const list of [openAlex, wiki, webResults]) {
    for (const s of list) {
      const key = s.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) continue;
      seen.add(key);
      snippets.push(s);
    }
  }

  const formattedContext = formatWebSnippetsForAI(snippets, q, dbContext);
  return { query: q, snippets, formattedContext, dbContext };
}

/** Farmer-facing answer when all LLM providers fail — built from web + DB snippets. */
export function buildResearchFallbackAnswer(
  query: string,
  research: WebResearchResult,
  voiceMode = false,
): string {
  if (!research.snippets.length && !research.dbContext.trim()) {
    return voiceMode
      ? 'I could not find exact details right now. Please ask again with crop name and village, or check with your local agriculture officer.'
      : 'I could not find exact details for this question right now.\n\nPlease try again with your **crop name** and **village**, or confirm with your local agriculture officer.';
  }

  const lines: string[] = voiceMode
    ? [`Here is what I found about ${query.slice(0, 80)}:`]
    : [`Here is verified agriculture information for **${query.slice(0, 120)}**:\n`];

  const top = research.snippets.slice(0, voiceMode ? 2 : 4);
  top.forEach((s, i) => {
    if (voiceMode) {
      lines.push(`${s.snippet.slice(0, 220)}`);
    } else {
      lines.push(`${i + 1}. **${s.title}**`);
      lines.push(`   ${s.snippet.slice(0, 350)}`);
    }
  });

  if (!voiceMode) {
    lines.push('\nPlease confirm doses and products for your field with a local agriculture officer.');
  }

  return lines.join(voiceMode ? ' ' : '\n');
}
