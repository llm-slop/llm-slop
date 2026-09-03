<div align="center">

![llm-slop — Say nothing, at scale.](og.png)

[![SOC 2 Type II](https://img.shields.io/badge/SOC%202%20Type%20II-self--attested-c6ff3f?style=flat-square&labelColor=08070d)](#)
[![Uptime](https://img.shields.io/badge/uptime-99.99%25-c6ff3f?style=flat-square&labelColor=08070d)](#)
[![Accuracy](https://img.shields.io/badge/accuracy-0.01%25-8b6cf6?style=flat-square&labelColor=08070d)](#)
[![Words shipped](https://img.shields.io/badge/words%20shipped-1.2B-8b6cf6?style=flat-square&labelColor=08070d)](#)

**[llm-slop.github.io/llm-slop](https://llm-slop.github.io/llm-slop/)**

</div>

---

Give llm-slop a topic and a word count. It returns thought leadership, README files,
and changelog entries that are functionally indistinguishable from content, in
whatever volume your calendar demands.

Our customers publish forty thousand words a day. None of them have read one.

## About this repository

llm-slop is a parody — a fictional enterprise company that sells AI-generated
content by the word. This repository is its marketing site: one static HTML page.
Nothing in it collects an address, takes a payment, or talks to a model.

Everything below this line is real.

## Contents

| Path | What it is |
| --- | --- |
| `index.html` | The entire site. Markup, CSS and JS, inline, in one file. |
| `404.html` | Not-found page, same style. |
| `og.png` | Social preview card. Generated — see below. |
| `tools/` | The card generator. Not served. |
| `.nojekyll` | Stops Pages running the files through Jekyll. |
| `.claude/skills/slop-brand/` | What llm-slop is and how it is allowed to sound. |

## Running it

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/. There is nothing to install and nothing to build.

## How it is built

One page, inline everything, no framework, no bundler, no committed `package.json`.
The only external request is to Google Fonts. Clone the repo and open `index.html`
and you have the whole thing.

This is a constraint worth keeping. It is what makes the site outlive whatever
tooling would otherwise have been fashionable when it was written.

## Deploying

Pages serves `main` from the repository root. There is no workflow. Enable it once
under **Settings → Pages → Build and deployment → Deploy from a branch**, branch
`main`, folder `/ (root)`; after that every push to `main` republishes within a
minute.

## Attaching a custom domain

1. Point the apex at GitHub Pages with four `A` records for `@`:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, plus
   the matching `AAAA` records for IPv6. Add a `CNAME` for `www` pointing at
   `llm-slop.github.io`. Confirm the addresses against
   [GitHub's docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
   first.
2. Enter the domain under **Settings → Pages → Custom domain**.
3. When the DNS check passes, tick **Enforce HTTPS**.
4. Repoint the four hardcoded absolute URLs — `canonical`, `og:url`, `og:image` and
   `twitter:image`:

   ```bash
   sed -i 's|https://llm-slop.github.io/llm-slop|https://your-domain.com|g' index.html
   ```

   The site works without step 4, because GitHub redirects the old address. Skipping
   it fails silently: social cards and the canonical tag keep pointing at
   `github.io` and nothing looks broken.

## Regenerating the social card

```bash
npm install playwright   # one-off, gitignored
node tools/make-og.mjs
```

Renders `tools/og-template.html` to `og.png` at 1200×630. Regenerate whenever the
hero tagline changes — the card is what people see when the link is shared, so a
stale tagline there is the most visible error the site can have.

## Writing for llm-slop

The joke lives entirely in tone, and tone is easy to break while fixing something
else. Before changing a line of copy, read
[`.claude/skills/slop-brand/SKILL.md`](.claude/skills/slop-brand/SKILL.md) — what
the bit is, how llm-slop talks, and what has to stay true wherever it appears.
Site-specific rules, including where deliberate slop is allowed to live, are in
[`references/website.md`](.claude/skills/slop-brand/references/website.md).

Contributions are welcome. They train the model.
