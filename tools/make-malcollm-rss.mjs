// Regenerates malcollm/rss.xml from the log entries in malcollm/index.html.
//
// The page is the source of truth. Add an entry there, run this, commit both.
//
//   node tools/make-malcollm-rss.mjs
//
// No dependencies. The site has none and neither does this.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://llm-slop.com';
const PAGE = join(root, 'malcollm', 'index.html');
const OUT = join(root, 'malcollm', 'rss.xml');

const html = readFileSync(PAGE, 'utf8');

const unescape = (s) => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

const escape = (s) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const text = (s) => unescape(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/* Each entry is one <article class="log">, newest first, as it reads on the page. */
const entries = [...html.matchAll(
  /<article class="log" id="(day-\d+)" data-pillar="([^"]+)">([\s\S]*?)<\/article>/g,
)].map(([, id, pillar, body]) => {
  const day = text((body.match(/<a href="#day-\d+">([^<]+)<\/a>/) || [])[1] ?? id);
  const date = text((body.match(/<\/a><span>([^<]+)<\/span>/) || [])[1] ?? '');
  const lines = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => text(m[1]));
  return { id, pillar, day, date, lines };
});

if (entries.length === 0) {
  console.error('make-malcollm-rss: no log entries found in malcollm/index.html');
  process.exit(1);
}

/* "13 November 2026" at 08:00 UTC, which is when a post goes up. */
function pubDate(human) {
  const at = new Date(`${human} 08:00:00 GMT`);
  if (Number.isNaN(at.getTime())) {
    console.error(`make-malcollm-rss: cannot read the date "${human}"`);
    process.exit(1);
  }
  return at.toUTCString();
}

/* Some posts open by naming the day themselves; don't say it twice. */
const headline = (e) => (e.lines[0].startsWith(e.day) ? e.lines[0] : `${e.day}: ${e.lines[0]}`);

const items = entries.map((e) => `    <item>
      <title>${escape(headline(e))}</title>
      <link>${ORIGIN}/malcollm/#${e.id}</link>
      <guid isPermaLink="true">${ORIGIN}/malcollm/#${e.id}</guid>
      <pubDate>${pubDate(e.date)}</pubDate>
      <category>${escape(e.pillar)}</category>
      <description>${escape(e.lines.join(' '))}</description>
    </item>`).join('\n\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Malcollm Hollmes — llm-slop</title>
    <link>${ORIGIN}/malcollm/</link>
    <atom:link href="${ORIGIN}/malcollm/rss.xml" rel="self" type="application/rss+xml"/>
    <description>One post a day by Malcollm Hollmes, who works at llm-slop and reads the output. His work is emotional health: what people carry and where it ends up. He has no degree, and none of this replaces a doctor.</description>
    <language>en</language>
    <copyright>2026 llm-slop, inc. Some rights reserved. These ones are not.</copyright>
    <lastBuildDate>${pubDate(entries[0].date)}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>${ORIGIN}/og.png</url>
      <title>Malcollm Hollmes — llm-slop</title>
      <link>${ORIGIN}/malcollm/</link>
    </image>

${items}

  </channel>
</rss>
`;

writeFileSync(OUT, xml);
console.log(`make-malcollm-rss: wrote ${entries.length} items to malcollm/rss.xml`);
