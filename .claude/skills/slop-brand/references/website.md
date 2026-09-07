# The website

Read this when working on the marketing site (`llm-slop/llm-slop`). For what
llm-slop is and how it talks, see `../SKILL.md` — the voice rules there govern every
line of copy on the page.

The site is currently llm-slop's largest surface, but it is one surface. Nothing
here should be mistaken for the definition of the project.

## Running it

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/. Nothing to install, nothing to build.

The README is deliberately not the place to look for this. It is a specimen of
llm-slop's own output, so it documents nothing on purpose; these notes are the real
ones.

## Shape

`index.html` is the home page: markup, CSS and JS inline, in that one file.
`404.html` is a small standalone page in the same style.

Every page loads `site.js`, which is only the nav menu behaviour (open, close on
Escape or an outside click, return focus). Every other page shares one stylesheet,
`site.css`, instead of inlining a copy each.
Its tokens are duplicated from `index.html` — change the palette in one and change it
in the other. A new sub-page links `../site.css` and copies the nav and footer markup
from an existing one; the footer is the same three columns everywhere, so a new
surface gets linked from every other page by adding it there.

- `careers/index.html` — careers landing page and job board. All listings are static
  markup; the JS only filters them.
- `careers/job.html` — one template for every listing, rendered from `?role=<slug>`.
  The job descriptions live in the `ROLES` object at the top of its script.
  An unknown or missing slug renders a "not open" page rather than an empty one.
- `status/index.html` — status page. Component rows are static; the JS only draws the
  90-day strips, from the `data-down` and `data-part` day indices on each row (a range
  is `55-89`), so the picture is the same on every load.
- `changelog/index.html` — releases. Static markup; the JS only filters on
  `data-desc="1"`, which marks a release whose notes say something.
- `feed/index.html` — the blog. Page one is static markup; the JS regenerates the list
  procedurally on Next, so the page still shows ten posts without it.
- `glossary/index.html` — the glossary. Eighteen terms in three `<dl class="gloss">`
  lists, entirely static, no script beyond the shared nav. It is the page that
  carries the phrase "LLM slop" as body copy, and its `DefinedTerm` structured
  data mirrors the visible definitions — change one and change the other.
- `faq/index.html` — the FAQ. Thirteen questions in three sections, static, and
  its `FAQPage` structured data repeats each answer verbatim. Google discards the
  markup if the two disagree, so edit them together.
- `trust/index.html` — the trust centre: certifications, subprocessors, controls,
  vendor assessment, disclosure. Entirely static; the only script it loads is the
  shared nav.
- `deck/index.html` — the Series B deck. Fourteen full-height slides in ordinary
  markup, snapped with `scroll-snap-type` on `<html class="deckdoc">`. Its inline
  script only adds the arrow keys, the two pager buttons and the counter, all of
  which live in `.deck-ctl`, which stays `hidden` until the script removes it. The
  slide number and the Confidential stamp are written into each `.sl-top`, so the
  deck reads correctly with no JavaScript at all.

Every page works with JavaScript disabled — scripts only add filtering, paging and the
status strips. Keep it that way; a job board that renders nothing without JS is worse
than one that cannot filter.

## Discoverability

The footer is not a navigation system. It carries around twenty links, most of them
jokes that go nowhere on purpose, and a reader cannot tell which of them are pages.
That is fine for a footer and useless as a way in.

So the nav carries the real pages, and the nav is the thing to update when you add
one. It has two parts, both repeated in the markup of all ten pages:

- Four inline links — Product, Pricing, Careers, Status — which hide below 720px.
- A **Menu** button, visible at every width, opening a panel that lists every page
  that exists. On a phone this is the only navigation there is, so it is not
  optional decoration.

A new page is discoverable when it is in that panel and in the footer of every page.
Adding it to the footer alone buries it among the jokes. Mark the current page with
`aria-current="page"` in both the inline links and the panel.

Keep the joke links. `href="#"` in the footer is the bit working as intended; the
fix for discoverability is a better nav, not fewer jokes.

Two counts are load-bearing and appear in more than one place. The careers role
count is repeated in page copy, navigation and footers across the site, and again
on the deck's team and ask slides.
The changelog totals 604 releases: thirteen listed individually plus the grouped
"591 releases" entry at the bottom, and the deck quotes both numbers. Changing
either means changing it everywhere.

Adding or removing a role means editing two places: the listing markup in
`careers/index.html` and the matching `ROLES` entry in `careers/job.html`. The
`href` slug and the `ROLES` key have to match, and `data-team` on the listing has
to match one of the filter chips or the role vanishes from every view.

The point of the build is that there isn't one. No framework, no bundler, no
committed `package.json`. Someone should be able to clone the repo and open the
file. (`tools/make-og.mjs` wants a locally installed Playwright, which is gitignored
along with the `package.json` npm creates for it — that is a one-off on your
machine, not a project dependency.)

Sections run in reading order: nav, hero, logo wall, benchmarks, features,
how-it-works, API, testimonials, pricing, resources, counter, footer.

The careers landing page runs: nav, hero, stat strip, principles, benefits, job
board, hiring process, employee quotes, offices, footer.

The trust centre runs: nav, hero, stat strip, certifications, subprocessors, controls,
vendor assessment, disclosure, footer.

The deck runs one idea per slide, in the order a deck runs: title, problem, why now,
category, product, market, traction, benchmark, competition, business model, unit
economics, go to market, team, the ask. Renumbering means editing the `.sl-top` of
every slide after it and the `aria-label` on the section, since both are written out
rather than counted.

The sub-pages cross-reference each other's details on purpose — Kyle is a job listing,
a status component, an incident, a subprocessor's responsibility and the disclosure
channel on the trust page; the deduplication service is a responsibility on one job,
an incident, and two changelog entries. That repetition is what makes the
company read as one company, so check the other surfaces before changing a detail.

## Design

- **Use the tokens.** The CSS custom properties at the top of the `<style>` block
  (`--void`, `--slop`, `--hype`, `--line`, `--dim`…) are the palette. A hardcoded
  hex is immediately visible on a page this dark.
- **No horizontal scroll at 390px.** Check every change at 1280px and 390px. The
  benchmark bar overflows its column on purpose; that overflow is contained and
  should stay that way.
- **Every animation needs a static fallback.** `prefers-reduced-motion` is honoured
  throughout — the generator renders a finished post instead of typing, the counter
  holds still, the logo track stops. New motion needs the same treatment.
- **External requests: Google Fonts only.** Everything else is inline or committed.

## Specimen on this page

Two places hold deliberate slop, and only these two:

- the `open` / `mid` / `close` arrays in the generator script, which assemble the
  rotating fake LinkedIn post
- the sample response in the API section

A third is `feed/index.html`, which is the whole point of that page: the featured post
and the generated titles are product output, framed as output by the bar above them
and the line beneath. The rest of that page — headings, lede, pager — is house voice.
`feed/rss.xml` is the same specimen in a feed reader: the item descriptions are
product output, framed by the channel description above them.

The careers, status, changelog, trust, glossary, FAQ and deck pages hold no specimen. Job descriptions are
house voice, each written as competent copy by a hiring manager who has never spoken to
the other eleven; incident updates, release notes, the trust centre and the deck are the
company writing about itself. The deck sells infrastructure, which is not what the home
page sells; keep each surface internally coherent and leave the mismatch alone.

Both are framed as product output. Everything else on the page is house voice.

## Adding a section

1. Match the neighbours' rhythm — most are an eyebrow, a two-line heading, a
   one-sentence lede, then content.
2. One idea per section. The page is already long.
3. Give it an `id` only if something links to it.
4. Check it at both widths and with reduced motion on.

## Social card

`og.png` is generated, not hand-drawn, so it stays consistent with the site:

```bash
npm install playwright   # one-off, not committed
node tools/make-og.mjs
```

It renders `tools/og-template.html` at 1200×630. Regenerate whenever the hero
tagline changes — the card is what people see when the link is shared, so a stale
tagline there is the most visible error the site can have. `tools/` is not part of
the site.

## Search

The site is meant to be found for the term it is named after, so the
machine-readable half is maintained as carefully as the visible half. `node
tools/seo-check.mjs` checks all of it and runs on every pull request; run it
before you push.

What exists, and what a new page owes it:

- `sitemap.xml` lists every indexable URL, with a `lastmod`. A new page is added
  here or it does not exist as far as a crawler is concerned. `404.html` and
  `careers/job.html` are `noindex` and stay out.
- `robots.txt` allows everything and names the sitemap. The named AI crawlers
  are listed individually and allowed on purpose — that is the joke and the
  policy.
- Every indexable page carries, in this order: `<title>` under 65 characters, a
  meta description under 160, the `robots` directives (`max-snippet:-1`,
  `max-image-preview:large`), `canonical`, the four absolute URLs, and one
  `application/ld+json` block. Copy the head of an existing sub-page.
- Structured data is a `@graph`. The home page holds `Organization`, `WebSite`,
  `WebPage`, `SoftwareApplication` and the site navigation list; every sub-page
  holds a page type and a `BreadcrumbList`. `@id`s point back at
  `https://llm-slop.com/#organization`, so keep that node on the home page.
- No `JobPosting`, `Review`, `AggregateRating` or `Offer` markup. Those feed
  Google surfaces that real people act on — a job board, a star rating, a price —
  and an invented company filling them stops being a parody a reader opted into.
  Every other schema type describes the page, which is honest.
- `llms.txt` is the same index for models, in house voice. `manifest.webmanifest`
  and `icon.svg` cover the installed-app metadata. Add a new page to `llms.txt`
  when you add it to the sitemap.
- The glossary and the FAQ carry their visible copy twice, once as markup. Google
  drops structured data that disagrees with the page, so edit both halves in the
  same change.

## URLs and deploys

- **The four absolute URLs move together.** `canonical`, `og:url`, `og:image` and
  `twitter:image` are hardcoded in the head of every indexed page, and all four point
  at `https://llm-slop.com`. Change one, change all four, on every page. A new
  sub-page copies the block and swaps the path in `canonical` and `og:url`;
  `og:image` and `twitter:image` stay on the root `og.png`. `careers/job.html` and
  `404.html` are `noindex` and carry none of them.
- **Deploys are branch-based.** Pages serves `main` from the repo root. There is no
  build step, and no workflow deploys anything — the two workflows in
  `.github/workflows/` report authorship and check the search surfaces, and
  neither publishes. `.nojekyll` keeps the files
  unprocessed. Pushing to
  `main` republishes. Enable it once under **Settings → Pages → Build and
  deployment → Deploy from a branch**, branch `main`, folder `/ (root)`.

## The custom domain

`llm-slop.com` is attached, and `CNAME` in the repo root is what holds it — Pages
rewrites that file from the repository setting, so deleting it drops the domain.
These are the steps it took, kept for the next time:

1. Point the apex at GitHub Pages with four `A` records for `@`:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, plus
   the matching `AAAA` records for IPv6. Add a `CNAME` for `www` pointing at
   `llm-slop.github.io`. Confirm the addresses against
   [GitHub's docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
   first.
2. Enter the domain under **Settings → Pages → Custom domain**.
3. When the DNS check passes, tick **Enforce HTTPS**.
4. Repoint the hardcoded absolute URLs on every page that has them:

   ```bash
   sed -i 's|https://old-address|https://your-domain.com|g' \
     index.html */index.html
   ```

   The site works without step 4, because GitHub redirects the old address.
   Skipping it fails silently: the cards and canonical tags keep pointing at the
   old host and nothing looks broken.
