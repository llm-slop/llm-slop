# llm-slop

A one-page parody of a SaaS company that sells AI-generated content by the word.
Static, no build step, no dependencies.

Deploys to https://llm-slop.github.io/llm-slop/

**Before writing or editing any copy, read
[`.claude/skills/slop-voice/SKILL.md`](.claude/skills/slop-voice/SKILL.md).** It is
the source of truth for what the joke is and how the site is allowed to sound. The
page is a parody of slop, which means it can be ruined by writing that is merely
fine — the skill explains how to avoid that, and what must stay true regardless.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site — markup, inline CSS, inline JS. |
| `404.html` | Custom not-found page. |
| `og.png` | 1200×630 social preview image. Generated; see below. |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is instead of running Jekyll. |
| `tools/` | The social card generator. Not part of the site. |
| `.claude/skills/slop-voice/` | Project purpose, voice and guardrails. |

## Running it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/. That's it — there is nothing to install.

## Deploying

Pages serves `main` directly; there is no build step and no workflow. Enable it once:

**Settings → Pages → Build and deployment → Deploy from a branch**, branch `main`,
folder `/ (root)`.

After that every push to `main` republishes within a minute or so. Deploy status
shows up under **Settings → Pages** and in the repository's **Deployments**.

## Attaching llm-slop.com

1. At the DNS provider, point the apex at GitHub Pages with four `A` records for
   `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   (and the matching `AAAA` records if you want IPv6). Add a `CNAME` for `www`
   pointing at `llm-slop.github.io`. Confirm the current addresses against
   [GitHub's docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
   before relying on them.
2. In **Settings → Pages → Custom domain**, enter `llm-slop.com` and save.
3. Wait for the DNS check to pass, then tick **Enforce HTTPS**.
4. Update the four absolute URLs in `index.html` — `canonical`, `og:url`, `og:image`
   and `twitter:image` — which are hardcoded to the `github.io` address:

   ```bash
   sed -i 's|https://llm-slop.github.io/llm-slop|https://llm-slop.com|g' index.html
   ```

   The site works without step 4 (GitHub redirects the old address), but social
   cards and the canonical tag should point at the real domain.

## Editing the page

Sections appear in `index.html` in reading order: nav, hero, logo wall, benchmarks,
features, how-it-works, API, testimonials, pricing, counter, footer. The design
tokens are the CSS custom properties at the top of the `<style>` block — use those
rather than hardcoding colours.

Check changes at 1280px and 390px, and with reduced motion enabled. Every animation
on the page has a static fallback, and new ones need one too.

## Regenerating the social card

`og.png` is rendered from a template so it stays consistent with the site:

```bash
npm install playwright   # one-off, not committed
node tools/make-og.mjs
```

Regenerate it whenever the hero tagline changes. The card is what people see when
the link is shared, so a stale tagline there is the most visible error the site can
have.
