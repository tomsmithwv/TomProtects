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

/**
 * The no-JavaScript path.
 *
 * A browser posting the form directly gets post/redirect/get: a 303 to
 * /subscribed, so a refresh cannot resubmit and the back button behaves. The
 * fetch path never sees this — it sends JSON and reads JSON back.
 */
const redirectTo = (request: Request, ok: boolean) =>
  new Response(null, {
    status: 303,
    headers: { Location: new URL(ok ? '/subscribed' : '/subscribed?error=1', request.url).href },
  });

export const POST: APIRoute = async ({ request, locals }) => {
  // A form post arrives urlencoded; the fetch in NewsletterSignup sends JSON.
  // Which one it is decides the shape of every answer below.
  const contentType = request.headers.get('content-type') ?? '';
  const isForm =
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data');

  const fail = (message: string, status: number) =>
    isForm ? redirectTo(request, false) : json({ error: message }, status);

  if (!checkRateLimit(getClientIP(request)).allowed) {
    return fail('Too many requests. Please wait a moment and try again.', 429);
  }

  let email: unknown;
  let source: unknown;

  if (isForm) {
    try {
      const form = await request.formData();
      email = form.get('email');
      source = form.get('source');
    } catch {
      return redirectTo(request, false);
    }
  } else {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }
    email = (body as { email?: unknown } | null)?.email;
    source = (body as { source?: unknown } | null)?.source;
  }

  if (!email || typeof email !== 'string') {
    return fail('Email is required', 400);
  }

  const validation = validateEmail(email);
  if (!validation.valid) {
    return fail(validation.error ?? 'Invalid email', 400);
  }

  const tag = typeof source === 'string' && ALLOWED_SOURCES.has(source) ? source : 'source-newsletter';

  // Best-effort: a Kit failure shouldn't surface a scary error to the user.
  const apiKey = locals.runtime?.env?.KIT_API_KEY;
  const result = await addSubscriberToKit(email, [tag], apiKey).catch(() => ({ success: false }));

  // The address was accepted either way, so the no-JS path lands on the
  // confirmation page even when Kit itself was unreachable — the failure is
  // logged server-side rather than shown as an error the reader cannot act on.
  if (isForm) return redirectTo(request, true);

  return json({ subscribed: Boolean(apiKey) && result.success });
};
