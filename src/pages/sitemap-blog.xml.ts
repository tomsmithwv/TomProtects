import type { APIRoute } from 'astro';
import { getPublicBroadcasts } from '../utils/blog';

// Blog posts are server-rendered from Kit at request time, so the build-time
// @astrojs/sitemap can't list them. This endpoint emits them dynamically —
// new public broadcasts appear here within the ~1h Kit edge-cache window.
// Registered via a second Sitemap line in public/robots.txt.
export const prerender = false;

const SITE = 'https://tomprotects.com';

export const GET: APIRoute = async ({ locals }) => {
  const apiKey = locals.runtime?.env?.KIT_API_KEY;
  const posts = apiKey ? await getPublicBroadcasts(apiKey).catch(() => []) : [];

  const urls = posts
    .map((p) => {
      const lastmod = p.date ? `<lastmod>${p.date.slice(0, 10)}</lastmod>` : '';
      return `<url><loc>${SITE}/blog/${p.slug}</loc>${lastmod}</url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
