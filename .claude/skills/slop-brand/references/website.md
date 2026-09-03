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

`index.html` is the entire site: markup, CSS and JS inline, in that one file.
`404.html` is a small standalone page in the same style.

The point of the build is that there isn't one. No framework, no bundler, no
committed `package.json`. Someone should be able to clone the repo and open the
file. (`tools/make-og.mjs` wants a locally installed Playwright, which is gitignored
along with the `package.json` npm creates for it — that is a one-off on your
machine, not a project dependency.)

Sections run in reading order: nav, hero, logo wall, benchmarks, features,
how-it-works, API, testimonials, pricing, counter, footer.

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

## URLs and deploys

- **The four absolute URLs move together.** `canonical`, `og:url`, `og:image` and
  `twitter:image` are hardcoded in `index.html`. Change one, change all four. The
  README documents the one-command swap for when a custom domain is attached.
- **Deploys are branch-based.** Pages serves `main` from the repo root. There is no
  workflow and no build step; `.nojekyll` keeps the files unprocessed. Pushing to
  `main` republishes. Enable it once under **Settings → Pages → Build and
  deployment → Deploy from a branch**, branch `main`, folder `/ (root)`.

## Attaching a custom domain

1. Point the apex at GitHub Pages with four `A` records for `@`:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, plus
   the matching `AAAA` records for IPv6. Add a `CNAME` for `www` pointing at
   `llm-slop.github.io`. Confirm the addresses against
   [GitHub's docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
   first.
2. Enter the domain under **Settings → Pages → Custom domain**.
3. When the DNS check passes, tick **Enforce HTTPS**.
4. Repoint the four hardcoded absolute URLs:

   ```bash
   sed -i 's|https://llm-slop.github.io/llm-slop|https://your-domain.com|g' index.html
   ```

   The site works without step 4, because GitHub redirects the old address.
   Skipping it fails silently: the cards and canonical tag keep pointing at
   `github.io` and nothing looks broken.
