import type { APIRoute } from 'astro';
import { validateEmail, isFreemailDomain } from '../../utils/email';
import { checkSPF } from '../../utils/checks/spf';
import { checkDKIM } from '../../utils/checks/dkim';
import { checkDMARC } from '../../utils/checks/dmarc';
import { calculateGrade } from '../../utils/grade';
import { generateRecommendations } from '../../utils/recommendations';
import { checkRateLimit, getClientIP } from '../../utils/rateLimit';
import { addSubscriberToKit } from '../../utils/kit';
import type { CheckStatus, CheckerResponse, Grade } from '../../utils/types';

// Server-rendered endpoint — must run on the Workers runtime, never prerendered.
export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// Map check results to Kit tags. Always source-checker; plus one finding tag per
// issue, or all-pass for a clean A/B grade.
function deriveTags(grade: Grade, spf: CheckStatus, dkim: CheckStatus, dmarc: CheckStatus): string[] {
  const tags = ['source-checker'];
  if (grade === 'A' || grade === 'B') tags.push('all-pass');
  if (spf === 'fail' || spf === 'error') tags.push('spf-missing');
  if (spf === 'warn') tags.push('spf-weak');
  if (dmarc === 'fail' || dmarc === 'error') tags.push('dmarc-missing');
  if (dmarc === 'warn') tags.push('dmarc-none');
  if (dkim === 'not-found') tags.push('dkim-not-found');
  return tags;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Rate limit by IP (~5/min)
    const clientIP = getClientIP(request);
    const rl = checkRateLimit(clientIP);
    if (!rl.allowed) {
      return json({ error: rl.message, status: 429 }, 429);
    }

    // 2. Parse JSON body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }

    const email = (body as { email?: unknown } | null)?.email;
    if (!email || typeof email !== 'string') {
      return json({ error: 'Email is required' }, 400);
    }

    // 3. Validate format and extract the domain
    const validation = validateEmail(email);
    if (!validation.valid) {
      return json({ error: validation.error }, 400);
    }
    const domain = validation.domain!;

    // 4. Reject free-mail domains with a friendly message
    if (isFreemailDomain(domain)) {
      const response: CheckerResponse = {
        email,
        domain,
        grade: 'F',
        checks: {
          spf: { status: 'unknown' },
          dkim: { status: 'unknown' },
          dmarc: { status: 'unknown' },
        },
        recommendations: [],
        subscribed: false,
        message:
          "Free email addresses (Gmail, Yahoo, etc.) can't be checked for sending-domain authentication. If you send from a business list, use your own domain — that's the real fix for deliverability, and exactly what the full audit hardens.",
      };
      return json(response);
    }

    // 5. Run SPF / DKIM / DMARC in parallel — all via DNS-over-HTTPS (no Node `dns`)
    const [spf, dkim, dmarc] = await Promise.all([
      checkSPF(domain),
      checkDKIM(domain),
      checkDMARC(domain),
    ]);

    // 6. Grade + plain-language recommendations
    const grade = calculateGrade({
      spf: spf.status,
      dkim: dkim.status,
      dmarc: dmarc.status,
      isFreemail: false,
    });
    const recommendations = generateRecommendations(spf, dkim, dmarc);

    // 7. Kit upsert + tagging. Best-effort: a Kit failure is logged inside
    //    addSubscriberToKit and never thrown, so the report is always returned.
    //    The key lives on the Cloudflare runtime binding `locals.runtime.env`
    //    (the brief calls it "context.env", but an Astro endpoint exposes the
    //    binding via locals.runtime.env — never process.env). With no key set
    //    (local dev) it no-ops as a stub.
    const apiKey = locals.runtime?.env?.KIT_API_KEY;
    const tags = deriveTags(grade, spf.status, dkim.status, dmarc.status);
    const kitResult = await addSubscriberToKit(email, tags, apiKey).catch((err) => {
      console.error('Kit error (non-blocking):', err);
      return { success: false };
    });

    const response: CheckerResponse = {
      email,
      domain,
      grade,
      checks: { spf, dkim, dmarc },
      recommendations,
      // Only claim "on the list" when a real upsert actually succeeded.
      subscribed: Boolean(apiKey) && kitResult.success,
    };
    return json(response);
  } catch (error) {
    console.error('Checker API error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
};
