import { getBrandPackImage, getManufacturerPage } from '../data/manufacturerProductPages';
import { lookupCuratedImage, slugActiveIngredient } from '../data/curatedProductImages';

export interface ProductImageInput {
  id?: string;
  image?: string | null;
  type?: string;
  category?: string | null;
  activeIngredient?: string | null;
  sourceUrl?: string | null;
}

const ogCache = new Map<string, { url: string; expires: number }>();
const OG_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function absolutize(url: string, pageUrl: string): string {
  if (url.startsWith('http')) return url;
  try {
    return new URL(url, pageUrl).href;
  } catch {
    return url;
  }
}

function extractOgImage(html: string): string | null {
  const patterns = [
    /property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/i,
    /name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    /"image"\s*:\s*"(https?:[^"]+)"/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]?.startsWith('http') && !/logo|icon|banner|menu|footer|ticker/i.test(m[1])) {
      return m[1];
    }
  }
  return null;
}

function extractIffcoProductImage(html: string): string | null {
  const assets = [...html.matchAll(/https?:\/\/iffco-public-assets[^"'\s]+\.(?:png|jpg|webp)/gi)].map(
    (m) => m[0],
  );
  const product = assets.find(
    (u) =>
      !/logo|menu|banner|slide|save_the|farmers|reach|who-we|footer|ticker|inside-Page-N/i.test(u),
  );
  return product ?? null;
}

function scoreCoromandelPackshot(url: string, pageUrl: string): number {
  const slug = pageUrl.toLowerCase();
  const file = decodeURIComponent(url).toLowerCase();
  let score = 0;
  if (/packshot|c_[a-z0-9_-]+\.(webp|png|jpg)/i.test(file)) score += 10;
  if (/logo|icon|favicon|banner|strip|download|elementor|css/i.test(file)) score -= 20;

  const hints: Array<[RegExp, RegExp]> = [
    [/dap/, /dap/],
    [/mop/, /mop/],
    [/paramfos/, /paramfos/],
    [/10-26-26|10--26-26/, /10-10-26|10-26-26/],
    [/ultra-10/, /10-10-26-zn/],
    [/28-28-0/, /28-28-0/],
    [/20-20-0-13/, /20-20-0-13/],
    [/15-15-15-09/, /15-15-15-09/],
    [/12-32-16/, /12-32-16/],
    [/ssp/, /ssp|urea/],
    [/gromor-urea/, /urea/],
  ];
  for (const [pageRe, fileRe] of hints) {
    if (pageRe.test(slug) && fileRe.test(file)) score += 15;
  }
  return score;
}

function extractCoromandelPackshot(html: string, pageUrl: string): string | null {
  const candidates = [
    ...html.matchAll(/https:\/\/www\.coromandel\.biz\/wp-content\/uploads\/[^"'\s]+\.(?:webp|png|jpg)/gi),
  ].map((m) => m[0]);

  let best: { url: string; score: number } | null = null;
  for (const url of new Set(candidates)) {
    const score = scoreCoromandelPackshot(url, pageUrl);
    if (score > 0 && (!best || score > best.score)) best = { url, score };
  }
  return best?.url ?? null;
}

function extractProductImageFromHtml(html: string, pageUrl: string): string | null {
  const og = extractOgImage(html);
  if (og) return og;

  const host = new URL(pageUrl).hostname;
  if (host.includes('iffco.in')) {
    const iffco = extractIffcoProductImage(html);
    if (iffco) return iffco;
  }
  if (host.includes('coromandel.biz')) {
    const coro = extractCoromandelPackshot(html, pageUrl);
    if (coro) return coro;
  }

  return null;
}

function isProductPageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, '');
    if (!path || path === '/en') return false;
    const segments = path.split('/').filter(Boolean);
    return segments.length >= 2;
  } catch {
    return false;
  }
}

/** Fetch pack-shot from manufacturer product page (cached 7 days). */
export async function fetchLiveProductImage(sourceUrl: string): Promise<string | null> {
  const key = sourceUrl.trim();
  if (!key.startsWith('http')) return null;

  const cached = ogCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.url;

  try {
    const res = await fetch(key, {
      headers: {
        'User-Agent': 'BhuvedamBot/1.0 (+https://bhuvedam.vercel.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(9000),
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const html = await res.text();
    const raw = extractProductImageFromHtml(html, key);
    const url = raw ? absolutize(raw, key) : null;
    if (url) {
      ogCache.set(key, { url, expires: Date.now() + OG_CACHE_TTL_MS });
      return url;
    }
  } catch {
    /* ignore network errors */
  }
  return null;
}

/** Sync resolve — brand pack URL, then curated map. */
export function resolveProductImageUrl(input: ProductImageInput): string | null {
  const raw = input.image?.trim();
  if (raw?.startsWith('http://') || raw?.startsWith('https://')) return raw;

  const brand = getBrandPackImage(input.id);
  if (brand) return brand;

  return lookupCuratedImage({
    id: input.id,
    imagePath: raw,
    type: input.type,
    activeIngredient: input.activeIngredient,
    category: input.category,
  });
}

/** Async resolve — brand pack, live manufacturer page, then curated fallback. */
export async function resolveProductImageUrlAsync(input: ProductImageInput): Promise<string | null> {
  const brand = getBrandPackImage(input.id);
  if (brand) return brand;

  const sourceUrl =
    input.sourceUrl?.trim() ||
    getManufacturerPage(input.id)?.sourceUrl ||
    null;

  if (sourceUrl && isProductPageUrl(sourceUrl)) {
    const live = await fetchLiveProductImage(sourceUrl);
    if (live) return live;
  }

  return resolveProductImageUrl({ ...input, sourceUrl });
}

export function enrichProductImage<T extends ProductImageInput>(product: T): T & { image: string | null } {
  const resolved = resolveProductImageUrl(product);
  return {
    ...product,
    image: resolved ?? product.image ?? null,
  };
}

export async function enrichProductImageAsync<T extends ProductImageInput>(
  product: T,
): Promise<T & { image: string | null }> {
  const sourceUrl =
    product.sourceUrl ?? getManufacturerPage(product.id)?.sourceUrl ?? null;
  const resolved = await resolveProductImageUrlAsync({ ...product, sourceUrl });
  return {
    ...product,
    image: resolved ?? product.image ?? null,
  };
}

export function enrichProductsWithImages<T extends ProductImageInput>(
  products: T[],
): Array<T & { image: string | null }> {
  return products.map(enrichProductImage);
}

export async function enrichProductsWithImagesAsync<T extends ProductImageInput>(
  products: T[],
): Promise<Array<T & { image: string | null }>> {
  const out: Array<T & { image: string | null }> = [];
  const batchSize = 6;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const resolved = await Promise.all(
      batch.map((p) =>
        enrichProductImageAsync({
          ...p,
          sourceUrl: p.sourceUrl ?? getManufacturerPage(p.id)?.sourceUrl ?? null,
        }),
      ),
    );
    out.push(...resolved);
  }
  return out;
}

/** Image path for bulk catalog rows — one photo per active ingredient. */
export function imageUrlForActive(type: 'pesticide' | 'fungicide', activeName: string): string {
  const slug = slugActiveIngredient(activeName);
  return (
    lookupCuratedImage({ imagePath: `ag/${type}/${slug}.png`, type, activeIngredient: activeName }) ??
    lookupCuratedImage({ type }) ??
    ''
  );
}

export { getManufacturerPage, mergeManufacturerSourceUrl } from '../data/manufacturerProductPages';
