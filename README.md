# llm-slop

A parody landing page for a fictional company that sells AI-generated content by the
word. Static, single page, no build step, no dependencies.

**Live:** https://llm-slop.github.io/llm-slop/

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site — markup, inline CSS, inline JS. |
| `404.html` | Custom not-found page. |
| `og.png` | 1200×630 social preview image. |
| `.github/workflows/pages.yml` | Builds and deploys to GitHub Pages on every push to `main`. |

## Running it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/. That's it — there is nothing to install.

The `__BASE_URL__` placeholder in `index.html` is only used by `<link rel="canonical">`
and the Open Graph tags, so it stays unsubstituted locally without affecting the page.
The deploy workflow replaces it with the live Pages URL.

## Deploying

Merging to `main` deploys. The workflow enables Pages on first run, so no manual
setup is required; if the repository is private, Pages needs a plan that allows it.

Watch the run under the **Actions** tab. First deploy takes a couple of minutes.

## Attaching llm-slop.com

1. At the DNS provider, point the apex at GitHub Pages with four `A` records for
   `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   (and the matching `AAAA` records if you want IPv6). Add a `CNAME` for `www`
   pointing at `llm-slop.github.io`. Confirm the current addresses against
   [GitHub's docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
   before relying on them.
2. In **Settings → Pages → Custom domain**, enter `llm-slop.com` and save.
3. Wait for the DNS check to pass, then tick **Enforce HTTPS**.

No code change is needed. The canonical and Open Graph URLs are derived from the
live Pages URL at deploy time, so they follow the domain automatically on the next
deploy — push any commit to `main` afterwards to refresh them.

## Editing the page

Copy lives in `index.html` in reading order: nav, hero, logo wall, benchmarks,
features, how-it-works, API, testimonials, pricing, counter, footer. The design
tokens are the CSS custom properties at the top of the `<style>` block.

The social image is generated from a separate template rather than by hand; if the
tagline changes, regenerate `og.png` at 1200×630 to match.
