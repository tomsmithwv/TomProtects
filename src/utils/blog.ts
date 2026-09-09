// Blog source: TomProtects Kit account broadcasts (API v4), rendered server-side
// at request time so new public broadcasts appear without a redeploy. Kit
// responses are edge-cached ~1h via caches.default.
import { sanitizePostHtml, excerptFrom } from './sanitize';

const KIT_API = 'https://api.kit.com/v4';
const CACHE_TTL = 3600; // seconds

interface Broadcast {
  id: number;
  subject?: string;
  public?: boolean;
  published_at?: string | null;
  created_at?: string | null;
  description?: string;
  preview_text?: string;
  content?: string;
}

export interface Post {
  id: number;
  subject: string;
  slug: string;
  date: string; // ISO, for <meta> article:published_time
  dateLabel: string; // human-readable
  excerpt: string;
}

export interface PostFull extends Post {
  content: string; // cleaned HTML
}

// GET a Kit endpoint, edge-caching the response in caches.default for ~1h.
// Cache is keyed by URL only (auth header excluded) — the key is constant, so
// this is safe. Falls back to a plain fetch when caches isn't available (e.g.
// a runtime without the Cache API).
async function kitGetCached(path: string, key: string): Promise<any | null> {
  const url = `${KIT_API}${path}`;
  const cache = (globalThis as any).caches?.default;
  const cacheKey = new Request(url);

  if (cache) {
    try {
      const hit = await cache.match(cacheKey);
      if (hit) return await hit.json();
    } catch {
      /* cache miss / unavailable — fall through to network */
    }
  }

  let res: Response;
  try {
    res = await fetch(url, { headers: { 'X-Kit-Api-Key': key, accept: 'application/json' } });
  } catch (err) {
    console.error('[BLOG] Kit fetch threw:', err);
    return null;
  }
  if (!res.ok) {
    console.error(`[BLOG] Kit ${path} -> ${res.status}`);
    return null;
  }

  const text = await res.text();
  if (cache) {
    try {
      await cache.put(
        cacheKey,
        new Response(text, {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_TTL}` },
        }),
      );
    } catch (err) {
      console.error('[BLOG] cache.put failed:', err);
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function slugify(input?: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// Deterministic slug assignment: a title's slug is its base slug unless two or
// more broadcasts share that base, in which case ALL of them get `-{id}`
// appended. Order-independent so /blog and /blog/[slug] always agree.
function assignSlugs(list: Broadcast[]): Map<number, string> {
  const baseCount = new Map<string, number>();
  for (const b of list) {
    const base = slugify(b.subject) || `post-${b.id}`;
    baseCount.set(base, (baseCount.get(base) || 0) + 1);
  }
  const map = new Map<number, string>();
  for (const b of list) {
    const base = slugify(b.subject) || `post-${b.id}`;
    map.set(b.id, (baseCount.get(base) || 0) > 1 ? `${base}-${b.id}` : base);
  }
  return map;
}

// Kit's description and preview_text can carry markup, so this goes through the
// same parser as the post body rather than a tag-stripping regex, and truncates
// on a word boundary.
function makeExcerpt(b: Broadcast): string {
  return excerptFrom(b.description || b.preview_text || '', 180);
}

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(d);
  } catch {
    return iso.slice(0, 10);
  }
}

// List public broadcasts, newest first, with slugs + excerpts. Paginates up to
// 5 pages of 50 (250 posts) defensively.
export async function getPublicBroadcasts(apiKey: string): Promise<Post[]> {
  const all: Broadcast[] = [];
  let after: string | undefined;

  for (let page = 0; page < 5; page++) {
    const path = `/broadcasts?per_page=50${after ? `&after=${encodeURIComponent(after)}` : ''}`;
    const data = await kitGetCached(path, apiKey);
    if (!data || !Array.isArray(data.broadcasts)) break;
    all.push(...(data.broadcasts as Broadcast[]));
    if (data.pagination?.has_next_page && data.pagination?.end_cursor) {
      after = data.pagination.end_cursor as string;
    } else {
      break;
    }
  }

  const publicOnes = all.filter((b) => b.public === true);
  publicOnes.sort(
    (a, b) =>
      (Date.parse(b.published_at || b.created_at || '') || 0) -
      (Date.parse(a.published_at || a.created_at || '') || 0),
  );

  const slugs = assignSlugs(publicOnes);
  return publicOnes.map((b) => ({
    id: b.id,
    subject: b.subject || `Post ${b.id}`,
    slug: slugs.get(b.id)!,
    date: b.published_at || b.created_at || '',
    dateLabel: formatDate(b.published_at || b.created_at),
    excerpt: makeExcerpt(b),
  }));
}

// Resolve a slug to a full post (with cleaned content from the detail endpoint).
export async function getPostBySlug(apiKey: string, slug: string): Promise<PostFull | null> {
  const posts = await getPublicBroadcasts(apiKey);
  const meta = posts.find((p) => p.slug === slug);
  if (!meta) return null;

  const data = await kitGetCached(`/broadcasts/${meta.id}`, apiKey);
  const content: string = data?.broadcast?.content ?? '';
  return { ...meta, content: sanitizePostHtml(content) };
}
