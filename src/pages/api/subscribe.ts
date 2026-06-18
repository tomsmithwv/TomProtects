import type { APIRoute } from 'astro';
import { validateEmail } from '../../utils/email';
import { addSubscriberToKit } from '../../utils/kit';
import { checkRateLimit, getClientIP } from '../../utils/rateLimit';

export const prerender = false;

// Only these source tags may be requested by the client. Prevents a visitor
// from applying arbitrary tags by tampering with the request body.
const ALLOWED_SOURCES = new Set(['source-blog', 'source-newsletter']);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request, locals }) => {
  const ip = getClientIP(request);
  if (!checkRateLimit(ip).allowed) {
    return json({ error: 'Too many requests. Please wait a moment and try again.' }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const email = (body as { email?: unknown } | null)?.email;
  const source = (body as { source?: unknown } | null)?.source;
  if (!email || typeof email !== 'string') {
    return json({ error: 'Email is required' }, 400);
  }

  const validation = validateEmail(email);
  if (!validation.valid) {
    return json({ error: validation.error }, 400);
  }

  const tag = typeof source === 'string' && ALLOWED_SOURCES.has(source) ? source : 'source-newsletter';

  // Best-effort: a Kit failure shouldn't surface a scary error to the user.
  const apiKey = locals.runtime?.env?.KIT_API_KEY;
  const result = await addSubscriberToKit(email, [tag], apiKey).catch(() => ({ success: false }));

  return json({ subscribed: Boolean(apiKey) && result.success });
};
