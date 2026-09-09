# TomProtects — Project Brief for Claude Code (v2)

## What this is

The marketing site for **TomProtects**, the security advisory practice of Tom
Smith. Astro on Cloudflare Pages, deployed from a private GitHub repo. The site's
job is to explain the practice, establish that Tom is credible, and convert
readers to the newsletter.

**Positioning:** the security advisor for a small organization that has nobody
whose job is security. *Fractional CISO* is the name for the larger end of that
work — a secondary descriptor, not the lead. See "Naming the work" under Voice.

**Core message:** *Helping small organizations build their first real security
program.*

**Where the practice is based:** Morgantown, West Virginia.

**The transformation the site sells:** from *"we don't know where to start"* to
*"we understand our risks, have a prioritized roadmap, and know what to do next."*

**Public contact address:** `hello@tomprotects.com` — confirmed and live. Use it
anywhere the site needs one: `/privacy`, `/workwithme`, and the fallback in a
failed newsletter signup.

This is v2 of the site. v1 sold a fixed-price Domain & Deliverability Review and
led with a free email-authentication checker. **That offer is retired.** So is
the separate tomsmithtech.com site, whose content and positioning this site now
carries. See "What was removed in v2" at the end before touching anything that
looks like a leftover.

## Who this is for

Small organizations, roughly **5–25 people**, that:

- depend on technology for nearly everything they do,
- have **no dedicated security leadership** — usually a capable IT provider or
  one internal IT person, but nobody whose job is to decide what the organization
  should do about security and in what order,
- are being asked security questions they can't currently answer, by **clients,
  insurers, regulators, or their own board**.

Concretely, that means three kinds of organization:

- **small professional practices** — dental, medical, legal, accounting,
- **small nonprofits**,
- **small local government agencies**.

What they have in common is more useful than what separates them. Each one holds
data that matters to the people it belongs to — patient records, client files,
donor details, resident information — on a handful of systems that arrived one at
a time and were never looked at together. Each is small enough that the person
who would have to fix a security problem is already doing three other jobs. Each
has reached the point where security clearly matters and no one inside the
organization owns it. A full-time security leader is more than they need or can
justify. Product vendors answer a narrower question than the one being asked.

Write for the office manager, the practice manager, the executive director, the
county or city administrator. They are competent, busy, accountable for the
decision, and not technical. Nothing on the site should assume otherwise.

## Where the work happens

The practice is based in **Morgantown, West Virginia**, and is regionally
anchored: it works with organizations in and around north-central West Virginia,
where being able to turn up in person is part of what makes the advice land. It
also works remotely, and does.

Say this plainly where it belongs. **About is where it is said properly** — a
full paragraph, both halves, part of the story. Home and `/workwithme` each carry
one flat sentence in the body copy, and that is the whole of it; the location is
not a strapline and does not belong in the hero eyebrow, where it was tried and
cut. Geography is a qualifier, not a limitation: it tells a nearby reader this is
someone they can actually sit down with, and it tells a remote reader the door is
open. Never apologize for the location, never hedge it, never bury it in the
footer as if it were a disclosure.

## What this practice is not

Say so plainly on the site where it helps a reader self-qualify. Never as a swipe
at anyone else's work.

- **Advisory, not implementation.** Implementation happens through the client's
  existing IT staff or MSP, who know the environment. Tom's part is making sure
  the right work happens in the right order.
- **Not penetration testing.** No offensive testing, no scanning as a service.
- **Not an MSP or MSSP.** No managed systems, no monitoring, no help desk.
- **Not compliance-only.** Frameworks inform the work; a certificate is not the
  goal. The goal is a business that is genuinely more secure and can explain
  itself.
- **Not a reseller.** No products are sold, referred for commission, or bundled.

## Voice

Trusted, experienced, practical, calm, clear, honest. Plain English throughout.

The reader should finish a page feeling **more confident and better informed**,
never intimidated. Fear is a poor basis for security decisions — it produces
spending on whatever seemed most urgent that week rather than on what actually
reduces risk.

**Never:**

- fear-based marketing, threat statistics as a hook, breach anecdotes used to alarm
- hype, urgency, scarcity, countdowns, "spots filling"
- buzzwords and vendor language: *cutting-edge, next-gen, AI-powered, holistic,
  synergy, best-in-class, military-grade, bulletproof*
- unexplained jargon and acronyms. If a term is needed, define it in the sentence
  it first appears in
- claims that can't be backed. Certifications are stated because they are
  checkable; judgment is what actually matters and no certification demonstrates
  it

**Prefer:** short sentences. Concrete nouns. Outcomes over technical controls.
The second person. Admitting the limits of what can be known.

### Naming the work

The primary buyer **does not know what a CISO is** and will not look it up.
Leading with the job title asks the reader to decode a job description before
they can tell whether the page is for them, and the ones most likely to give up
are exactly the readers this practice wants.

- **Home and `/workwithme` lead with plain language and the outcome.** What the
  reader gets, in words they already use: knowing where the organization stands,
  knowing what to fix first, having an answer ready when someone asks. The job
  title is not the lead — **not in an h1, not in a page `<title>`, not in a meta
  description.**
- **The home hero eyebrow is the exception, and it reads *Fractional CISO &
  Security Advisor*.** The eyebrow is a kicker above the h1, not the lead: the
  first full line a reader meets is still the plain-language core message. A
  reader who does not know the term loses nothing by skipping four words in small
  caps, and a reader who does know it gets it immediately. This was decided
  deliberately after the narrowing — it is not a leftover, and it is not an
  invitation to move the title into the headline or the `<title>` beneath it.
- **"Fractional CISO" stays as a secondary descriptor.** It is the accurate term
  for the larger end of the work, and it is what a reader who already knows the
  term will search for. It belongs on **About**, where Tom's background is the
  subject and the phrase reads as biography rather than as a demand on the
  reader. Elsewhere it may appear at most once, in a supporting line, after the
  plain-language version has already landed.
- **Define it in the sentence it appears in**, like any other acronym — a
  part-time security leader, shared across a few organizations rather than hired
  full time.
- The same rule applies to *organization* over *business*. A dental practice, a
  nonprofit and a county agency are not businesses, and copy that calls them one
  tells a third of the audience the page is not about them.

## Stack

- **Framework:** Astro 4, `output: 'server'`, `@astrojs/cloudflare` adapter
- **Styling:** **Tailwind CSS 3** — JS config (`tailwind.config.mjs`) + PostCSS
- **Hosting:** Cloudflare Pages, custom domain `tomprotects.com`
- **Email list / newsletter:** Kit (formerly ConvertKit) API v4
- **Repo / deploy:** private GitHub repo → Cloudflare Pages auto-deploy on push
  to `main`. Build and test locally with Wrangler, then commit → push → deploy.

**Do not upgrade to Tailwind 4.** The `@theme` CSS-first syntax, the
`max-w-(--custom-property)` arbitrary-property form, and `@tailwindcss/vite` are
all off-limits. Tokens live in `tailwind.config.mjs` under `theme.extend`.
Anything ported from the retired tomsmithtech.com codebase was written for
Tailwind 4 and its class names must be translated, not copied.

**Do not upgrade Astro or the adapter casually.** They are version-matched; an
adapter/framework major mismatch has bitten this stack before.

## Critical constraints

1. **Environment variables come from the Cloudflare runtime binding, not
   `process.env`.** In an Astro page that is
   `Astro.locals.runtime.env.KIT_API_KEY`; in an endpoint,
   `locals.runtime.env.KIT_API_KEY`. `process.env` is empty at request time on
   the Workers runtime. Getting this wrong fails silently in production.
2. **`KIT_API_KEY` is the only environment variable, and it lives only in
   Cloudflare** — never in the repo, never in this brief, never in client code.
   Set it for **both Production and Preview**.
3. **Server routes do not run under plain `astro dev`.** Use Wrangler local
   emulation to test anything that touches Kit. Local runs read the key from a
   gitignored `.dev.vars` file, not a committed `.env`.
4. **Kit failures must never break a page.** Every Kit call is best-effort: log
   the failure and render something sensible. A newsletter outage must not take
   down the blog or a form.

## Design system

The TomProtects palette is **canonical**. Nothing from the retired site's teal
and amber system carries over.

### Colour (`tailwind.config.mjs`)

```
ink         #1a1a1a   body copy, headings, dark section grounds
cream       #fdfaf3   page background
accent      #0f5c4c   links, eyebrows, buttons, marks        (7.6:1 on cream)
accent-dark #7FC1A6   the same role on dark grounds          (8.35:1 on ink)
warn        #f59e0b   STATUS ONLY
fail        #ef4444   STATUS ONLY
```

- **There is no amber accent.** `warn` and `fail` are status colours — form
  validation, a required-field marker, a severity pill. They are never a brand
  accent, never a heading colour, never a decorative rule, never a call to
  action.
- `accent` is the only accent. On `bg-ink` sections it becomes `accent-dark`,
  because `accent` fails contrast there (2.2:1).
- Focus rings are `#2f7a66` (clears 3:1 on both cream and ink). One focus
  treatment, applied everywhere, always visible.
- Every text/background pairing on the site meets WCAG AA or better. Check
  before introducing a new one.

### Typography

- **Headings: Fraunces.** A variable serif, carrying h1–h4 and any display-weight
  line (pull quotes, the question list). Self-hosted as a woff2 in `public/fonts/`
  and declared with `@font-face` in `src/styles/global.css`, matching how DM Sans
  is already loaded. No Google Fonts CDN, no third-party request at runtime.
- **Body and UI: DM Sans.** Variable, already self-hosted and preloaded. All body
  copy, navigation, form controls, buttons, captions.
- **Caveat**, the handwritten face, is **retained** — scoped to exactly one line,
  the "Hi, I'm Tom!" caption beside the hero photograph. It is decorative and
  deliberately informal, and it appears nowhere else. Do not extend it to
  headings, pull quotes, or any second caption.
- Register all three in `tailwind.config.mjs` under `theme.extend.fontFamily`
  (`serif`/`display` → Fraunces, `sans` → DM Sans, `handwritten` → Caveat) with
  real fallback stacks. Fraunces is not yet installed — adding it is part of the
  v2 work.

The serif/sans split is what carries the voice: serious in the headings, plain in
the copy. A page set entirely in DM Sans is not this site.

### Layout and components

The site uses Tailwind utilities directly; hand-written CSS is limited to
`global.css` and the blog post prose block. Established patterns to reuse rather
than reinvent:

- **Band** — a `<section>` with a ground (`bg-cream`, `bg-white`, or
  `bg-ink text-cream`), wrapping `<div class="mx-auto max-w-5xl px-4 py-20">`.
  Narrow at `max-w-3xl`; centred single-column at `max-w-2xl`.
- **Eyebrow** — `text-xs font-bold uppercase tracking-[0.14em] text-accent`
  (`text-accent-dark` on dark grounds).
- **Card** — `rounded-xl border border-black/10 bg-white p-6`, flipping to
  `bg-cream` on white grounds.
- **Panel** — `rounded-2xl border border-black/10 bg-white p-8`.
- **Primary button** — `rounded-lg bg-accent px-7 py-3.5 font-semibold
  text-white transition hover:opacity-90`.
- **Secondary action** — a text link, `text-accent underline-offset-4
  hover:underline`. One primary action per view; the secondary never competes.
- **Checklist row** — `flex gap-3` with a `text-accent` check mark.
- **Input** — `rounded-lg border border-black/15 bg-white px-4 py-3
  focus:border-accent focus:ring-2 focus:ring-accent/60`.
- **Prose** — the `.post-content` block in `blog/[slug].astro`, which styles Kit
  post bodies to match the site.

Icons are inline SVG on a 24×24 grid, 1.75 stroke, round caps and joins,
decorative (`aria-hidden`) because every one sits beside a heading that says the
same thing. Emoji are not icons; where v1 used them, replace them.

Motion is restrained: hover states and at most one entrance per page, all inside
a `prefers-reduced-motion` guard.

## Pages

`/` · `/about` · `/blog` · `/blog/{slug}` · `/workwithme` · `/privacy` · 404

There is **no pricing anywhere on the site**. No price, no range, no "starting
at", no packages with figures. Engagements are scoped in conversation. The site's
job is to make someone want that conversation.

### Home

The primary conversion is the newsletter. Section order:

1. **Hero.** Eyebrow (*Fractional CISO & Security Advisor*), then an h1 that
   names the three kinds of organization outright, so a visitor knows within a
   second or two whether the page is about them. The core message did not
   survive as the h1 and does not need to — it is the first thing the lede says,
   which is where it now lives. The lede states the reader's situation and the
   promise; a separate flat line gives Morgantown and the region; then the
   newsletter offer in prose and the signup field. The job title lives in the
   eyebrow and nowhere else above the fold. A quiet secondary link to `/about`.
   The photograph of Tom, the handwritten "Hi, I'm Tom!" caption, and the
   hand-drawn arrow between them are **kept** — they are what stops a calm page
   reading as an impersonal one. Photo cluster above the headline on mobile,
   right-hand column on desktop.
2. **Who this is for.** Four cards, a heading and one line each: *small
   professional practices* (dental, medical, legal, accounting), *small
   nonprofits*, *local government agencies*, and *anyone with no security owner*.
   The fourth exists because the first three are examples, not a gate — an
   organization that is none of them and in exactly the same position should not
   read three cards and conclude the page is not for it. A line above the cards
   gives the size, five to twenty-five people, since the h1 no longer does.
   This band sits before the questions on purpose: a reader confirms the page is
   about them before being asked to recognise themselves in a list.
3. **The questions you're already asking.** The list of questions a reader in this
   situation already has, in the words they would actually use — *Are we secure
   enough? How do we stop someone falling for a phishing email? What should we fix
   first? Are we spending money on the right things? Do we really need this
   security product? Is our IT provider doing enough? What happens if we lose
   access to our systems for a week? Who is supposed to be in charge of all this?*
   — then a line noting that working through them in order is most of what a
   security program is.

   **Phishing sits second because it is what people actually ask first.** It is
   the one part of security a reader has already seen with their own eyes, and a
   list that omits it reads as written by someone who has not been asked. The
   last question is the people question in a practice owner's register; anything
   built around a job title belongs nowhere near this list.
4. **How I help.** Four cards, each an outcome first and a service second:
   *Understand where you stand* (security foundation and maturity assessment,
   most often identity and access plus the email and productivity platform),
   *Know what to do next* (a prioritized roadmap, policies people will follow,
   answers ready for an insurance renewal or a customer security review, and a
   note that grant-based funding can carry security expectations of its own —
   **stated in general terms only.** Naming a specific program, regulation or
   requirement would be a claim about someone's funding that this site is not
   in a position to make, and it dates badly),
   *Keep it moving* (month-to-month advisory: roadmap upkeep, vendor and SaaS
   review, backup verification, useful security awareness — this is the card that
   may name *fractional CISO*, once, in a supporting line, defined where it
   stands), and
   *Newer risks, handled calmly* (AI governance as a plain question about which
   tools are in use and what data goes into them). Follow the cards with the
   advisory-not-implementation note.
5. **How I think about security.** The philosophy in prose: security should leave
   an organization more confident, not more anxious; good security is practical
   and sustainable and fits how the place already works; it should be explainable
   to a board, an insurer, or a client without a translator. Close on the line
   that a small organization does not need enterprise security — it needs
   experienced guidance applied to its actual situation.
6. **Latest from the newsletter.** The three most recent `/blog` posts.
7. **Newsletter signup.** The closing panel, in its **concise** form — heading,
   a one-line offer, the field, and one line of microcopy. The hero at the top of
   this page has already named the checklist and made the promise in full, and
   repeating either verbatim two screens later reads as filler rather than as a
   second chance to convert. Home is the only page where that is true, so it is
   the only page that passes `concise`; About and every blog post carry the full
   version, because there the panel is the only signup on the page.

Certifications appear as a quiet row of badges, not as a banner.

### About

Tom's background, and why the practice exists. More than twenty years keeping
organizations secure, much of it as the sole security and systems lead for a group
of affiliated operating companies — responsible for both the systems people used
daily and the security decisions nobody else was going to make, including real
incidents rather than only plans for them. That history is the point: it is
straightforward to recommend good security when someone else has to find the time
and money for it.

**This is the page where *fractional CISO* belongs.** Here it is biography rather
than a label the reader has to decode: the title for the ongoing end of the work,
defined in the sentence it appears in, for the reader who already knows the term
and for the one meeting it for the first time.

Morgantown belongs here too, as part of the story rather than a location stamp —
where Tom is, and that the practice is deliberately anchored in the region while
working remotely as well.

Certifications: **CISSP, CISM, CDPSE, PMP**, each badge linking to its Credly
record so the claim is checkable in one click. State plainly that they show the
work has been measured against a standard, and that judgment matters more.

Close with what makes the advice different: most security advice fails by being
too generic to act on or written for an organization ten times the size. Ends
with the newsletter.

### Blog

Mirrors the TomProtects Kit newsletter so the site has fresh content with no
separate CMS. Its framing follows the audience: notes on building a security
program in a small organization, in plain language.

- **Source:** TomProtects Kit account, API v4 broadcasts (`GET /v4/broadcasts`,
  `GET /v4/broadcasts/{id}`), authenticated with `X-Kit-Api-Key`. Filtered to
  broadcasts where `public === true` — setting `public: true` on a broadcast is
  what publishes it to the web.
- **Rendering:** server-side at request time, so a new newsletter appears without
  a redeploy. Kit responses are edge-cached ~1 hour in `caches.default`.
- **Routes:** `/blog` (title, date, excerpt, newest first) and `/blog/{slug}`
  (full post). Slugs derive from subjects; collisions resolve deterministically
  so the list and the post page always agree.
- **Content cleanup:** Kit's HTML is sanitized before rendering — tracking pixels,
  view-in-browser preheaders, unsubscribe and preferences links, and the Kit
  footer are stripped, along with Kit's own inline styles and classes, so a post
  inherits this site's typography instead of fighting it. Any `h1` Kit sends is
  demoted to `h2`; the page's own title is the `h1`. External links get
  `target="_blank" rel="noopener noreferrer"`.
- **SEO:** each post sets a canonical link to its `tomprotects.com/blog/{slug}`
  URL, plus title, meta description, and OpenGraph tags. Posts are listed in the
  dynamic blog sitemap. Public broadcasts also appear in the Kit Creator Profile
  feed at `articles.tomprotects.com`; the canonical tag keeps tomprotects.com the
  SEO source of truth, so the duplicate URL is not a problem.
- **Empty state:** a friendly "first issue coming soon" panel with the signup form.
- **Per-post CTA:** the newsletter signup, tagged `source-blog`.

### /workwithme

This is `/bookaconsultation` **renamed**. The route becomes `/workwithme` and the
old path is retired with no redirect — it was never circulated, so nothing points
at it.

The page keeps its structure and its calendar. **What changes is the copy**: v1
framed the call around scoping a fixed-price domain and deliverability review,
and all of that framing goes. Rewrite it around the advisory practice.

What the page should say now:

- **What the work is**, in plain language and no job title: helping a small
  organization build its first real security program — work out where it stands,
  decide what to do first, and keep it moving. Advisory, not implementation — the
  work happens through the IT staff or provider already in place, and Tom's part
  is making sure the right things happen in the right order. Point at the four
  areas from the home page's "How I help" rather than restating them at length.
- **Who it fits.** The ICP above, stated so a reader can self-qualify out as
  easily as in: 5–25 people, dependent on technology, nobody owning security, and
  questions arriving from clients, insurers, regulators or a board. Name the three
  kinds of organization — small professional practices, small nonprofits, small
  local government agencies — because a reader recognizes their own kind faster
  than they recognise a headcount range.
- **Where.** Based in Morgantown, working across the region, and working remotely
  too. One flat sentence, no apology.
- **What the first conversation covers.** Where the organization stands today,
  what is already being asked of it, and whether an engagement makes sense. No
  obligation either way.
- **No pricing.** Engagements are scoped in conversation.

Kept from the existing page, with only the wording updated:

- The founder photo beside a line confirming the reader is talking to Tom
  directly — CISSP, CISM, CDPSE, PMP, 20+ years.
- The short expectation-setting list: a short call with no pressure and no pitch;
  plain-English answers to security questions; a clear sense of whether an
  engagement would help and what it would involve. The last of those replaced a
  promise about "what the full review would cover".

  **No duration on this page.** The v1 copy said 15–20 minutes while the calendar
  below it books a 30-minute slot — the two contradicted each other in a single
  viewport. The length belongs in TidyCal, where it is set; stating it here as
  well is what let it drift.
- **The TidyCal scheduling embed, exactly as it is today** — `<div
  class="tidycal-embed" data-path="tomsmith/discovery">` with the
  `asset-tidycal.b-cdn.net/js/embed.js` script and the `<noscript>` fallback
  linking to `tidycal.com/tomsmith/discovery`. Same path, same account, same
  markup. Do not rebuild it.

Booking is the contact path, so this page carries **no form** and needs no Kit
source tag. Alongside the calendar, offer `hello@tomprotects.com` for anyone who
would rather write than book.

**`tidycal.com/tomsmith/discovery` is a real entry point, not only a fallback.**
It is what the `noscript` block links to, and it is a public URL that can be
pasted into an email or found on its own. A reader arriving there sees the event
name, the duration and whatever the TidyCal description holds — none of this
page's copy. Whatever that description says is the whole of the framing for those
bookings, so it should say, briefly and in the same voice, what the call is and
who it is for. Empty is safe; it is not the same as sufficient.

The TidyCal account's display name also shows on the card, above the event. It
currently reads *Tom Smith III* while the line directly above the calendar says
*You'll be talking to me directly — Tom*. Both are true and the mismatch is
small, but the calendar is the more formal of the two and it is the one a
stranger reads first.

### /privacy

What the site collects and why, in the same plain voice: newsletter signups are
stored in Kit and tagged by where they subscribed; nothing is sold or rented; no
third-party advertising trackers; unsubscribe or deletion on request, by emailing
`hello@tomprotects.com`. Keep it current with the forms that actually exist —
v1's checker section and its intake-form section are both gone. Note the TidyCal
embed on `/workwithme` as the one third-party script the site loads.

## The newsletter

The site's primary conversion, and the reason most pages end where they do.

- **The offer:** the checklist, *The Security Questions Every Small Organization
  Should Be Able to Answer* — a self-scoring readiness check the reader works
  through on their own to come away with a clear picture of where the
  organization stands. (Renamed with the narrowed audience, and the site already
  says so. The Kit incentive does not exist yet, so there was nothing to keep in
  sync — build it in Kit under this title.)
- **Delivery:** Kit sends the checklist as the signup incentive. **The PDF is
  never hosted on this site.**
- **Cadence and promise, stated at every signup:** one email a week with practical
  security guidance for small organizations. No sales pitches. Unsubscribe at any
  time, and the address goes nowhere else.
- **Mechanics:** the form posts to this site's own `/api/subscribe`, which
  validates the address, rate-limits by IP, and upserts the subscriber into Kit
  via API v4 with a source tag. The endpoint allowlists the tags a client may
  request, so a visitor cannot apply arbitrary tags by editing the request.
- **Failure behaviour:** the reader is told plainly what happened, with
  `hello@tomprotects.com` offered as the fallback. Success and failure differ in
  wording and in shape, not in colour alone, and the status area reserves its
  space so nothing shifts.

### Kit tags

- `source-newsletter` — subscribed from the home page or the footer
- `source-blog` — subscribed from the blog index or a post

Tag names are resolved to Kit IDs at runtime, so no IDs are hardcoded. The lookup
is an exact, case-sensitive match on the tag name, and a tag that does not resolve
is skipped rather than failing the signup — so **a misspelled or missing tag is
invisible from the outside.** The signup succeeds either way; only a server log
line distinguishes them. Both tags now exist in the account.

## Retiring tomsmithtech.com

tomsmithtech.com is being shut down and its content lives here now. Two things
must not be lost:

1. **Redirects.** Map the old URLs to their equivalents here — `/` → `/`,
   `/about/` → `/about`, `/blog/` → `/blog`, `/blog/{slug}` → the matching post —
   so existing links and search equity survive.

   This is the only domain that needs redirects. tomprotects.com's own retired
   routes — `/bookaconsultation`, `/tools`, `/audit` — were never circulated and
   are removed outright, with no 301 and no placeholder.
2. **The Kit lead magnet.** The checklist form and its incentive email live in the
   **tomsmithtech.com Kit account**, which is separate from the TomProtects one.
   They must be rebuilt in the TomProtects Kit account. Until that is done the
   signup on this site will subscribe people but send them no checklist.

## Out of scope

- Pricing, payment processing, or checkout of any kind
- Customer login or client dashboard
- Storing user data anywhere other than Kit
- A second newsletter, or any combined feed with another Kit account

## Definition of done (v2)

The v2 work was built on the branch `v2-fractional-ciso`. Everything that lives
in this repo is done; what is left is in Kit, in TidyCal, and in DNS, and none of
it can be finished by editing code.

### Done in the repo

- [x] No checker, no audit funnel, no pricing and no deliverability copy anywhere
      in `src/`. The terms survive in this brief on purpose — the removal list
      below is what stops them being reintroduced.
- [x] Positioning, ICP and the core message are consistent across Home, About,
      `/workwithme`, `/privacy`, both blog templates, the header, the footer, and
      every `<title>` and meta description
- [x] Fraunces self-hosted, declared in `global.css`, wired into
      `tailwind.config.mjs`, and carrying every heading through a base-layer rule
- [x] Caveat still loads and still styles exactly one line — the hero caption
- [x] Palette holds: no amber anywhere. `warn` and `fail` are now unused
      entirely, their only callers having gone with the checker and the audit form
- [x] Still Tailwind 3 and Astro 4; no `@theme`, no Tailwind 4 class syntax
- [x] Certifications show all four — CISSP, CISM, CDPSE and PMP — with working
      Credly links, and read correctly on both light and ink bands
- [x] Newsletter signup present on Home (hero and closing panel), the footer, the
      blog index and every post, with the right source tag on each and unique
      field ids where a page carries two
- [x] `.gitignore` still covers `node_modules`, `dist`, `.env` and `.dev.vars`
- [x] The TidyCal embed works on `/workwithme` — calendar loads, `noscript`
      fallback links to `tidycal.com/tomsmith/discovery`
- [x] `hello@tomprotects.com` reaches `/privacy`, `/workwithme`, `/subscribed`
      and the newsletter's failure message, from one constant in `src/consts.ts`
- [x] No redirects or stubs left behind for `/bookaconsultation`, `/tools` or
      `/audit`, and no dead links in the header, footer or 404 page

Routes are `/`, `/about`, `/blog`, `/blog/{slug}`, `/workwithme`, `/privacy`,
`/subscribed` and 404, plus the `/api/subscribe`, `/api/posts` and
`/sitemap-blog.xml` endpoints. `/subscribed` was added during the build as the
landing page for a signup posted without JavaScript; it is `noindex`.

### The narrowed audience, in the copy

The audience narrowed after v2 shipped. The site copy was brought in line in a
single pass, so nothing below is outstanding — it is recorded because it is the
kind of change that gets half-reverted later by someone reaching for the old
words.

- [x] "Growing businesses" is gone; the site says **small organizations**, and
      the headcount is five to twenty-five
- [x] The three kinds of organization are named on Home, About and `/workwithme`
      — small professional practices, small nonprofits, small local government
      agencies — so a reader recognizes their own kind before a headcount range
- [x] Morgantown and the region appear on Home, About and `/workwithme`, stated
      flatly, with remote work in the same sentence — in body copy on Home and
      `/workwithme`, at length on About, and not in the hero eyebrow
- [x] "Fractional CISO" is out of the lead, though not off the page. It appears
      in the home hero eyebrow (a kicker above the plain-language h1, kept on
      purpose), the About meta description, one About paragraph that defines it,
      and the closing line of the "Keep it moving" card on Home. It is in no h1
      and in no `<title>`
- [x] `SITE.positioning` is *Security advice for small organizations*, which is
      what the default `<title>` and the footer copyright line are built from.
      `SITE.location` was added alongside it
- [x] The checklist is *The Security Questions Every Small Organization Should Be
      Able to Answer* everywhere the site offers it

### Not done, and not doable from the repo

- [x] `source-newsletter` and `source-blog` created in the TomProtects Kit
      account. Names must match exactly — the runtime does a case-sensitive
      lookup, so `Source-Newsletter` or an underscore resolves to nothing, the
      signup still succeeds, and the subscriber lands untagged with only a
      `[KIT] Tag not found in account, skipping` line to say so.
- [ ] The checklist incentive live in the TomProtects Kit account — the form and
      its incentive email, rebuilt here rather than carried over from
      tomsmithtech's separate account, under the new title and written for the
      narrowed audience. **This is the one gap with a cost:** the site offers that
      checklist in five places and currently delivers nothing.
- [x] The TidyCal event description no longer sells the Domain Security Review.
      It was removed outright rather than rewritten, so the card now shows the
      event name and the duration and nothing else. On `/workwithme` that is
      right — the page above the calendar already does the expectation-setting,
      and the duration lives in exactly one place. See the note below about the
      direct booking link, where that framing is absent.
- [ ] `KIT_API_KEY` set in Cloudflare for Production **and** Preview; nothing
      else in the environment. Without it on Preview, a preview deploy renders an
      empty blog.
- [ ] tomsmithtech.com redirects in place.
- [ ] Optional Kit housekeeping: the orphaned `source-audit-form` tag and the
      `audit_domain` / `audit_platforms` / `audit_notes` custom fields. Nothing
      writes to them any more; they are harmless, just untidy.

### Verified only against sample data

- [ ] A real Kit broadcast rendered end to end. The sanitizer was proved on the
      Workers runtime against sample markup, and the blog's empty state and miss
      path are both confirmed, but no genuine broadcast has been through it.
      Needs `KIT_API_KEY` in `.dev.vars` and `npm run preview:local`. It is also
      what would settle whether the "view in browser" preheader and the "powered
      by Kit" footer need handling — see the sanitizer's note.

## What was removed in v2 — do not resurrect

If any of this is still in the codebase, it is a leftover, not a feature.

- **The email-authentication checker** in every form: the `/tools` page, the
  `CheckerWidget` component, the `/api/check` endpoint, the SPF/DKIM/DMARC checks,
  the DNS-over-HTTPS client, the grading and recommendation logic, and their types.
  Nav links to `/tools` and the "check your domain free" CTAs go with them.
- **The paid audit funnel, in full.** The `/audit` intake page, the `/api/audit`
  endpoint, the sample-audit-findings section, the deliverables list, and the
  whole "Domain & Deliverability Review" offer. `/audit` is deleted outright — not
  replaced, not redirected, not folded into another page. Because `/workwithme`
  books through TidyCal rather than a form, nothing takes `/api/audit`'s place and
  the site is left with one form endpoint, `/api/subscribe`. This orphans the
  `source-audit-form` tag and the `audit_domain` / `audit_platforms` /
  `audit_notes` custom fields in Kit; they are harmless left in place, but nothing
  writes to them any more.
- **All pricing:** the launch-price block, the price runway, and the
  no-retainers/fixed-price framing.
- **Deliverability as a topic.** It is no longer what this practice is about. It
  may appear in a newsletter post like any other subject, but not in the site's
  own positioning copy.
- **InboxTom positioning and the port-from-InboxTom framing.** InboxTom is a
  separate business with a separate Kit account. This site pulls only from the
  TomProtects Kit account and shares nothing with it.
- **Fear-adjacent v1 copy:** "three things attackers already know about your
  business", risk cards, breach anecdotes used as a hook. See "Voice".

---

# Appendix: deploy and local development

## Local

```
npm install
npm run dev              # Astro dev server — server routes that call Kit will not work
npm run preview:local    # astro build && wrangler pages dev ./dist — use this to test Kit
```

Put `KIT_API_KEY=...` in a gitignored `.dev.vars` in the project root; Wrangler
reads it automatically. Without it, Kit calls no-op as a stub and the blog builds
empty — which is a valid local state, not a bug.

## Deploy

Push to `main` on the private GitHub repo; Cloudflare Pages builds and deploys
automatically.

- Build command `npm run build`, output directory `dist`, framework preset Astro.
- `KIT_API_KEY` is set in **Settings → Environment variables** for **both
  Production and Preview**. A blog error on a preview URL is almost always a
  missing or wrong key.
- The custom domain is `tomprotects.com`. The **apex is canonical** —
  `astro.config.mjs` sets `site: 'https://tomprotects.com'`, and `www` redirects
  to it.
- Verify on the `.pages.dev` URL before anything that changes the custom domain.
