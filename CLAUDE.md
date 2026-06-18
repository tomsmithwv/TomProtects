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

---

# Appendix: Claude Code prompt sequence

Give these to Claude Code one at a time, in order. Verify each stage builds and runs locally under Wrangler before moving on — same build → test → commit → push rhythm as InboxTom. Each prompt assumes this file is `CLAUDE.md` in the repo root.

**Before you start, three reminders:**
- Don't paste the Kit API key into Claude Code or the repo. Set it as `KIT_API_KEY` in the Cloudflare Pages dashboard. Generate a fresh key from the **TomProtects** Kit account (the key pasted in chat earlier still needs rotating regardless).
- Before Prompt 4, create the finding/source tags in Kit and have their IDs ready (Kit v4 tags by ID, not name).
- Before testing Prompt 5, flip the three existing broadcasts to `public: true` in Kit, or you'll test against an empty feed.
- There's no deploy prompt — deploy happens through the existing GitHub → Cloudflare Pages connection. Test locally, then push when a stage works.

## Prompt 0 — Setup

> Read CLAUDE.md in full. This is the project brief for the TomProtects site. It's a port of my existing InboxTom site — same stack: Astro + Cloudflare Pages Functions + Tailwind, deployed from a private GitHub repo to Cloudflare Pages. Don't write any code yet. Confirm you understand the brief, then give me: (1) the exact Astro + adapter versions you'll use and why, (2) the folder structure you'll create, and (3) the list of Cloudflare environment variables I need to set. Flag anything in the brief that's ambiguous before we start.

## Prompt 1 — Scaffold + layout

> Scaffold the Astro project with the Cloudflare adapter and Tailwind. Create the base layout, shared header/nav (links: How It Works, About, Blog, Tools, Get Started), and footer. Set up the routes as empty stubs: home, /audit, /blog, /blog/[slug], /tools, /bookaconsultation, /privacy. No content yet — just structure that builds and runs locally under Wrangler. Tell me the exact command to run it locally.

## Prompt 2 — The checker API

> Build the /api/check Pages Function per the brief's "checker API" section. Critical: DNS lookups must use DNS-over-HTTPS (cloudflare-dns.com/dns-query), not the Node dns module, because this runs on the Workers runtime. Read the Kit API key from context.env.KIT_API_KEY, never process.env. Implement SPF, DKIM (best-effort selector probing), and DMARC checks, freemail rejection, and a 5/min IP rate limit. Return a graded JSON report. Don't wire up Kit tagging yet — just the checks and the graded response. Write it so I can test it locally with Wrangler and show me a sample curl command.

## Prompt 3 — Checker UI in the hero

> Build the hero section on the home page with the checker form as the primary CTA: single email field + button. On submit, call /api/check, show a "checking…" state, then render the graded report inline below the form with three status-colored cards (SPF / DKIM / DMARC) and plain-language recommendations. Below the report, add the audit CTA that funnels to /audit (use the wording in the brief's "Post-result CTA" section). Make "See how it works" a secondary text link, not a competing button.

## Prompt 4 — Kit integration for the checker

> Now wire the checker to Kit. After a successful check, upsert the subscriber via Kit API v4 (POST /v4/subscribers) and apply tags: the relevant finding tags (spf-missing, spf-weak, dmarc-missing, dmarc-none, dkim-not-found, all-pass) plus source-checker. Use context.env.KIT_API_KEY. Kit failures must NOT break the report — log and continue so the user always sees their results. Confirm how you're handling the tag IDs (Kit v4 tags by ID, so tell me if I need to create these tags in Kit first and give you the IDs).

## Prompt 5 — The Kit-powered blog

> Build /blog and /blog/[slug] per the brief. Source is the TomProtects Kit account broadcasts (GET /v4/broadcasts, GET /v4/broadcasts/{id}), filtered to public === true. Render server-side via Pages Functions, not at build time, so new public broadcasts appear without redeploying. Edge-cache Kit responses ~1 hour with caches.default. Strip email-only artifacts (unsubscribe links, view-in-browser, footers, tracking pixels). Generate slugs from titles, resolving collisions with the broadcast ID. Each post must set a canonical link to its tomprotects.com/blog/{slug} URL, plus title/meta/OpenGraph. Add the empty-state page if no public broadcasts exist. End every post with a newsletter signup (tagged source-blog) and a link to the checker.

## Prompt 6 — Remaining pages and content

> Build out the rest of the home page sections in the order specified in the brief: Sample Audit Findings (right after the checker result), The Reality (3 risk cards), Who This Is For, How It Works, What You Get, Pricing, About, Latest from the Newsletter (3 most recent /blog posts), final CTA + newsletter signup. Then build the /audit intake form page, /tools, /bookaconsultation, and /privacy. For the newsletter signup forms on the homepage and footer, tag subscribers source-newsletter; the audit form tags source-audit-form. Pull the existing copy from the current site where the brief references it; I'll give you anything you're missing.

## Prompt 7 — Pricing block

> Build the pricing section using launch-pricing-with-runway framing: show the current price as a launch/introductory price with urgency ("Launch price — going up as spots fill"), and optionally show the next tier so the runway is visible. Keep the no-retainers/no-upsells/fixed-price promise and the included-items list from the brief. Leave the actual price numbers as clearly-marked placeholders at the top of the file so I can set them in one place.

## Prompt 8 — Pre-deploy review

> Before I deploy: audit the whole project against CLAUDE.md's "Definition of done" checklist and report pass/fail on each item. Specifically verify: no process.env anywhere (should all be context.env), no DNS module usage, the Kit API key only read from env and never logged or committed, canonical tags present on blog posts, all source tags wired correctly, and sitemap includes blog posts. List anything incomplete.

---

# Appendix: GitHub and Cloudflare setup

Mirrors the InboxTom setup. Order matters in a few places — noted below.

## GitHub

1. **Create a new private repo** on github.com (e.g. `tomprotects` or `tomprotects-site`). Don't initialize with a README — the scaffold populates it.
2. **Connect the local project** after Claude Code scaffolds (Prompt 1):
   ```
   git init
   git add .
   git commit -m "Initial scaffold"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tomprotects.git
   git push -u origin main
   ```
   (Skip `git init` if Claude Code already ran it.)
3. **Verify `.gitignore` covers `node_modules`, `.env`, `.dev.vars`, and `dist`** before the first push, so secrets and build output never get committed. The Astro scaffold should include most of this — confirm.
4. **Ongoing rhythm:** `git add . → git commit → git push`. Each push to `main` triggers a Cloudflare deploy once the connection below exists.

## Cloudflare Pages

Do this once the scaffold is pushed to GitHub.

1. **Dashboard → Workers & Pages → Create → Pages → Connect to Git.** Authorize GitHub access if needed, then select the `tomprotects` repo.
2. **Build settings:**
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - (Confirm against what Claude Code reports in Prompt 0 — adapter setup can affect these.)
3. **Set the environment variable.** Settings → Environment variables → add `KIT_API_KEY` = the fresh TomProtects Kit key. Add it to **both Production and Preview** so the checker/blog work on preview deploys too. This is the only place the key should live.
4. **First deploy** runs automatically → gives a `tomprotects.pages.dev` URL. Test everything there first (checker, blog, forms).
5. **Custom domain.** Pages project → Custom domains → add `tomprotects.com` and `www.tomprotects.com`. The domain is already on Cloudflare, so DNS records are added automatically — just confirm. Brief specifies www as canonical; let the other redirect.
6. **Cut over from Framer.** Adding the custom domain to Pages takes `tomprotects.com` off Framer with no overlap window. So fully verify the `.pages.dev` site **before** attaching the custom domain. The swap is near-instant but there's no period where both serve.

## Two ordering notes

- **`KIT_API_KEY` must be set in Cloudflare (step 3) before the checker or blog work even on `.pages.dev`** — both call Kit server-side at request time. A blog error on the preview URL almost always means a missing/wrong env var.
- **Local testing needs the key too.** For Wrangler local runs, put `KIT_API_KEY=...` in a `.dev.vars` file in the project root — Wrangler reads it automatically and it's gitignored. Don't use a committed `.env`.
