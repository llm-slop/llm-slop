// Checks the parts of the site that search engines read and nobody looks at.
//
// It catches the failures that are invisible in a browser: a page missing from
// sitemap.xml, a canonical pointing at the wrong path, structured data that
// stopped being JSON, an internal link to a file that is not there.
//
//   node tools/seo-check.mjs            # report and exit 1 on any failure
//   node tools/seo-check.mjs --summary  # also write a GitHub job summary
//
// No dependencies. The site has none and neither does this.

import { appendFileSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const ORIGIN = 'https://llm-slop.com';

const problems = [];
const fail = (file, message) => problems.push({ file, message });

/* Every .html in the repo except tools/, which is not part of the site. */
function pages(dir = root, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === 'node_modules' || entry === 'tools') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) pages(full, out);
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

const read = (p) => readFileSync(p, 'utf8');
const attr = (html, re) => (html.match(re) || [])[1] ?? null;

const canonicalOf = (html) => attr(html, /<link rel="canonical" href="([^"]+)"/);
const ogUrlOf = (html) => attr(html, /<meta property="og:url" content="([^"]+)"/);
const titleOf = (html) => attr(html, /<title>([^<]*)<\/title>/);
const descOf = (html) => attr(html, /<meta name="description" content="([^"]*)"/);
const isNoindex = (html) => /<meta name="robots" content="[^"]*noindex/.test(html);

/* The URL a file is served at: index.html is the directory itself. */
function urlFor(file) {
  const rel = relative(root, file).split('\\').join('/');
  return rel === 'index.html' ? `${ORIGIN}/`
    : rel.endsWith('/index.html') ? `${ORIGIN}/${rel.slice(0, -'index.html'.length)}`
    : `${ORIGIN}/${rel}`;
}

const files = pages().sort();
const indexable = files.filter((f) => !isNoindex(read(f)));

for (const file of files) {
  const html = read(file);
  const name = relative(root, file);
  const title = titleOf(html);
  const desc = descOf(html);

  if (!title) fail(name, 'no <title>');
  else if (title.length > 65) fail(name, `title is ${title.length} chars, over the 65 Google shows`);
  if (!desc) fail(name, 'no meta description');
  else if (desc.length > 160) fail(name, `meta description is ${desc.length} chars, over 160`);

  /* Structured data has to parse, or the page has none rather than some. */
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(json);
    } catch (err) {
      fail(name, `JSON-LD does not parse: ${err.message}`);
    }
  }

  if (isNoindex(html)) {
    if (canonicalOf(html)) fail(name, 'noindex page carries a canonical');
    continue;
  }

  const want = urlFor(file);
  const canonical = canonicalOf(html);
  const ogUrl = ogUrlOf(html);
  if (canonical !== want) fail(name, `canonical is ${canonical}, expected ${want}`);
  if (ogUrl !== want) fail(name, `og:url is ${ogUrl}, expected ${want}`);
  if (!html.includes(`<meta property="og:image" content="${ORIGIN}/og.png">`)) {
    fail(name, 'og:image is missing or not the absolute card URL');
  }
  if (!/<meta name="robots" content="index/.test(html)) {
    fail(name, 'no robots directives (index, follow, max-snippet:-1, …)');
  }
  if (!html.includes('application/ld+json')) fail(name, 'no structured data');
}

/* sitemap.xml and the indexable pages have to be the same set. */
const sitemap = read(join(root, 'sitemap.xml'));
const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const expected = indexable.map(urlFor);

for (const url of expected) {
  if (!listed.includes(url)) fail('sitemap.xml', `does not list ${url}`);
}
for (const url of listed) {
  if (!expected.includes(url)) fail('sitemap.xml', `lists ${url}, which is not an indexable page`);
}
for (const file of files) {
  if (isNoindex(read(file)) && listed.includes(urlFor(file))) {
    fail('sitemap.xml', `lists ${urlFor(file)}, which is noindex`);
  }
}

const robots = read(join(root, 'robots.txt'));
if (!robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) {
  fail('robots.txt', 'does not point at the sitemap');
}

/* Internal links resolve to something on disk. href="#" is a footer joke and
   is left alone; so is anything off-site. */
for (const file of files) {
  const html = read(file);
  const name = relative(root, file);
  const dir = dirname(file);
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|data:|mailto:|#|\/\/)/.test(href)) continue;
    const path = href.split('#')[0].split('?')[0];
    if (!path) continue;
    const target = join(dir, path);
    let ok = false;
    try {
      ok = statSync(target).isDirectory() ? statSync(join(target, 'index.html')).isFile() : true;
    } catch {
      ok = false;
    }
    if (!ok) fail(name, `link to ${href} resolves to nothing`);
  }
}

const lines = problems.map((p) => `${p.file}: ${p.message}`);
const checked = `${files.length} pages, ${indexable.length} indexable`;

if (lines.length === 0) console.log(`seo-check: ${checked}, no problems.`);
else {
  console.error(`seo-check: ${lines.length} problem(s) across ${checked}.\n`);
  for (const line of lines) console.error(`  ${line}`);
}

if (process.argv.includes('--summary') && process.env.GITHUB_STEP_SUMMARY) {
  const body = lines.length === 0
    ? `## SEO check\n\n${checked}. No problems.\n`
    : `## SEO check\n\n${lines.length} problem(s) across ${checked}.\n\n`
      + lines.map((l) => `- ${l}`).join('\n') + '\n';
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, body);
}

process.exit(lines.length === 0 ? 0 : 1);
