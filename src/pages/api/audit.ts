import type { APIRoute } from 'astro';
import { validateEmail } from '../../utils/email';
import { addSubscriberToKit } from '../../utils/kit';
import { checkRateLimit, getClientIP } from '../../utils/rateLimit';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export const POST: APIRoute = async ({ request, locals }) => {
  if (!checkRateLimit(getClientIP(request)).allowed) {
    return json({ error: 'Too many requests. Please wait a moment and try again.' }, 429);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const email = str(body?.email, 200);
  if (!email) return json({ error: 'Email is required' }, 400);
  const validation = validateEmail(email);
  if (!validation.valid) return json({ error: validation.error }, 400);

  const name = str(body?.name, 120);
  const domain = str(body?.domain, 200);
  const platforms = Array.isArray(body?.platforms)
    ? body.platforms.map((p: unknown) => str(p, 60)).filter(Boolean).join(', ')
    : str(body?.platforms, 300);
  const message = str(body?.message, 2000);

  // Best-effort custom fields (created on the Kit side; the upsert falls back to
  // a fields-free create if they don't exist yet, so the lead always lands).
  const fields: Record<string, string> = {};
  if (domain) fields.audit_domain = domain;
  if (platforms) fields.audit_platforms = platforms;
  if (message) fields.audit_notes = message;

  const apiKey = locals.runtime?.env?.KIT_API_KEY;
  const result = await addSubscriberToKit(email, ['source-audit-form'], apiKey, {
    firstName: name || undefined,
    fields,
  }).catch(() => ({ success: false }));

  // Always acknowledge receipt to the visitor; Kit failures are logged server-side.
  return json({ received: true, subscribed: Boolean(apiKey) && result.success });
};
