# TomProtects — Project Brief for Claude Code (v1)

## What this is

A marketing site for **TomProtects**, a security review service for online businesses, deployed on Cloudflare Pages. The site sells a fixed-price, asynchronous **Domain & Deliverability Review** and uses a free email-authentication checker as the top-of-funnel lead magnet.

Positioning: *Protect the business behind the brand.* Calm, practical, no fear-mongering. The audience is creators, consultants, and online business owners who earn through platforms like Stripe, Kit, Kajabi, and Circle.

This rebuild moves the site off Framer onto the same stack as InboxTom, and adds two features ported from InboxTom:
1. A `/blog` that renders from Kit newsletter broadcasts.
2. The email-deliverability checker tool, hosted **on this site** (previously it linked out to inboxtom.com).

## Relationship to InboxTom

TomProtects and InboxTom are **separate businesses with separate Kit newsletters**. Do not share or filter a combined feed — this site pulls only from the TomProtects Kit account. The checker and blog code are ported patterns from InboxTom, but every API call uses the TomProtects Kit credentials.

## Stack

- **Framework:** Astro with Cloudflare Pages Functions (checker API + blog rendering)
- **Hosting:** Cloudflare Pages, custom domain tomprotects.com (www canonical)
- **Styling:** Tailwind CSS
- **Email list / newsletter:** Kit (formerly ConvertKit) API v4
- **Repo / deploy:** private GitHub repo → Cloudflare Pages auto-deploy. Build/test locally with Wrangler, then commit → push → deploy.

Reuse InboxTom's components, layout, and config wholesale wherever possible.

## Critical constraints (learned on InboxTom — do not relearn the hard way)

1. **No Node `dns` module on the Workers runtime.** All DNS lookups use DNS-over-HTTPS:
   ```
   GET https://cloudflare-dns.com/dns-query?name={name}&type=TXT
   Header: accept: application/dns-json
   ```
2. **Env vars in Pages Functions are on `context.env`, not `process.env`.** The Kit API key is `context.env.KIT_API_KEY`. Getting this wrong is why the InboxTom integration silently failed in production.
3. **Pages Functions do not run under plain `astro dev`** — use Wrangler local emulation to test the checker and blog locally.
4. **Adapter compatibility:** use a version of `@astrojs/cloudflare` compatible with the installed Astro version (InboxTom hit a v7-adapter / Astro-4 incompatibility).
5. **The Kit API key lives only in the Cloudflare environment variable `KIT_API_KEY`** — never in the repo, this brief, or client code. Use the TomProtects Kit key, freshly generated.

## The checker API (`/api/check`)

Ported from InboxTom. Behavior:

### Input
- POST JSON: `{ "email": "user@example.com" }`
- Validate email format server-side; extract the domain.
- Reject free-mail domains (gmail.com, yahoo.com, outlook.com, hotmail.com, icloud.com, aol.com, etc.) with a friendly message.

### Checks
- **SPF:** TXT lookup on the root domain; detect presence, `~all` vs `-all` vs `+all`, multiple records.
- **DKIM:** best-effort selector probing (common selectors). Use honest "best-effort / not found" language — absence is not proof of misconfiguration.
- **DMARC:** TXT lookup on `_dmarc.{domain}`; detect presence and policy (`none` / `quarantine` / `reject`).

### Output
- A graded report (letter grade or pass/warn/fail per check) with plain-language recommendations.
- Three result cards: SPF / DKIM / DMARC, with status colors.

### Kit integration (checker)
- Add the subscriber via Kit API v4 (`POST /v4/subscribers`), then tag by findings: `spf-missing`, `spf-weak`, `dmarc-missing`, `dmarc-none`, `dkim-not-found`, `all-pass`.
- Also tag by source: `source-checker` (distinguish from newsletter-only and audit-form leads).
- Kit failures must not break the report — log and continue.

### Abuse protection
- Rate limit by IP (~5/min, Cloudflare-native or simple in-memory).
- Do not store emails or results anywhere except Kit.

### Post-result CTA — the key difference from InboxTom
After the report renders, the CTA funnels to the **paid audit**, not an external booking link:
> "This checks your email setup. The full review covers your domain, registrar, WHOIS, and revenue platforms too — every gap, prioritized, with exact fixes."
→ button to `/audit`. Reinforce that they're now on the list and will get the fix-it email series.

## The blog (`/blog`)

Mirrors the TomProtects Kit newsletter so the site has fresh content without a separate CMS.

- **Source:** TomProtects Kit account, API v4 broadcasts (`GET /v4/broadcasts`, `GET /v4/broadcasts/{id}`), using `KIT_API_KEY`. Filter to broadcasts where `public === true`. (Setting `public: true` on a broadcast is what publishes it to the web — it also appears in the Kit Creator Profile feed at articles.tomprotects.com. The canonical tag below makes tomprotects.com the SEO source of truth, so the duplicate URL is not a problem.)
- **Rendering:** server-side via Pages Functions (not build-time) — new newsletters appear without redeploying.
- **Caching:** edge-cache Kit responses ~1 hour (`caches.default`) for speed and to avoid hammering Kit.
- **Routes:**
  - `/blog` — list: title, publish date, excerpt, newest first.
  - `/blog/{slug}` — full post. Slugs from titles; collisions resolved with broadcast ID.
- **Content cleanup:** strip email-only artifacts (unsubscribe links, "view in browser", footers, tracking pixels) before rendering.
- **SEO:** each post sets `<link rel="canonical">` to its `tomprotects.com/blog/{slug}` URL, plus title/meta description and OpenGraph tags. Include posts in the sitemap. Search equity accrues to tomprotects.com, not the Kit-hosted version.
- **Empty state:** if no public broadcasts yet, show a friendly "first issue coming soon" page with the newsletter signup form.
- **Per-post CTA:** every post ends with (a) newsletter subscribe (inline signup → Kit, tagged `source-blog`) and (b) a link to the free checker.

### Migrating existing posts
The current Framer site has three published posts (email-list value, the weekend security checklist, the Kieran Drew phone-theft incident story). These already exist as Kit broadcasts but are currently `public: false`. Flip each to `public: true` (Kit UI per broadcast, or `PUT /v4/broadcasts/{id}`) so they pass the `public === true` filter and appear on `/blog`. They will also surface in the Kit Creator Profile feed at articles.tomprotects.com — the canonical tags keep tomprotects.com as the SEO source of truth. Do not hand-port them as static pages.

## The site — pages and section order

Pages: home, `/audit` (intake form), `/blog`, `/blog/{slug}`, `/tools`, `/bookaconsultation`, `/privacy`.

### Home page sections, in order
1. **Hero with the live checker.** Headline (*Protect the business behind the brand*) + subhead, and the checker form (single email field + button) **is the primary CTA**. Demote "See how it works" to a secondary text link — one primary action only.
2. **Inline result + audit CTA.** Report renders below the form; CTA funnels to `/audit` (see checker CTA above).
3. **Sample Audit Findings.** The concrete "here's what a real audit surfaces" block (no 2FA, shared registrar login, reused breached password, etc.). This is the most persuasive element — keep it high, right after the checker, so a visitor who just saw gaps in their own domain sees how much more the full audit finds.
4. **The Reality.** Three risk cards: email is the master key, your domain is your identity, revenue platforms are targets.
5. **Who this is for.** Creators, consultants, online business owners on Stripe/Kit/Kajabi/Circle.
6. **How it works.** Async by default; calls optional both ends. (1) Start with form or call → (2) I review and report in 5–7 business days → (3) walkthrough or async.
7. **What you get.** The deliverables list (written report, DNS review, email auth, registrar security, WHOIS, subdomain inventory, prioritized action list).
8. **Pricing.** See pricing section below.
9. **About.** Tom, CISSP / CISM / CDPSE, 20+ years.
10. **Latest from the newsletter.** 3 most recent `/blog` posts.
11. **Final CTA + newsletter signup.**

## Pricing — launch pricing with a visible runway

The async audit is intentionally underpriced right now to build reps and testimonials. Frame it so early buyers feel urgency and the price isn't anchored low permanently.

- Display the current price as a **launch / introductory price** (e.g. "Launch price — $297. Going up as spots fill.").
- Optionally show the next tier so the runway is visible (e.g. "$297 now → $497 → standard").
- Keep the no-retainers / no-upsells / fixed-price promise.
- Included: full domain & deliverability report, SPF/DKIM/DMARC review, registrar security review, prioritized fix list with specific values, optional intro + walkthrough calls, 30-day follow-up.
- Payment collected after scope is confirmed via the intake form.

## Kit tagging summary (for clean segmentation)

- `source-checker` + finding tags (`spf-missing`, `dmarc-none`, etc.) — ran the free tool.
- `source-blog` — subscribed from a blog post.
- `source-newsletter` — subscribed from the homepage/footer newsletter form.
- `source-audit-form` — submitted the paid-audit intake form.

These let the checker leads, content subscribers, and buyers be emailed differently.

## Trust elements to carry over
- CISSP / CISM / CDPSE certified · 20+ years.
- 100% satisfaction guarantee.
- Built for online businesses.
- Async by default, calls optional.

## Out of scope for v1
- Payment processing on-site (payment is invoiced after scope confirmation).
- Customer login / dashboard.
- Anything that requires storing user data beyond Kit.

## Definition of done (v1)
- [ ] Site deploys to the `.pages.dev` subdomain, then tomprotects.com.
- [ ] Checker runs end to end: real DNS-over-HTTPS lookups, graded report, Kit subscriber created and tagged, audit CTA shown.
- [ ] `/blog` renders live from TomProtects Kit broadcasts with canonical tags and per-post CTAs.
- [ ] Existing three broadcasts flipped to `public: true` and visible at `/blog` with canonical tags pointing to tomprotects.com.
- [ ] Newsletter signup works from home, footer, and blog posts with correct source tags.
- [ ] `/privacy` page exists.
- [ ] Launch pricing displayed with runway framing.
- [ ] Fresh TomProtects Kit API key stored only as the `KIT_API_KEY` Cloudflare env var.
