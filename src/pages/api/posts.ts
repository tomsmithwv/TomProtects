import type { APIRoute } from 'astro';
import { getPublicBroadcasts } from '../../utils/blog';

export const prerender = false;

// Latest public posts for the home "Latest from the newsletter" section. Loaded
// client-side so the home page can stay prerendered/static. Kit data is
// edge-cached ~1h inside getPublicBroadcasts.
export const GET: APIRoute = async ({ locals }) => {
  const apiKey = locals.runtime?.env?.KIT_API_KEY;
  const posts = apiKey ? (await getPublicBroadcasts(apiKey)).slice(0, 3) : [];
  return new Response(
    JSON.stringify({
      posts: posts.map((p) => ({
        subject: p.subject,
        slug: p.slug,
        dateLabel: p.dateLabel,
        excerpt: p.excerpt,
      })),
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
