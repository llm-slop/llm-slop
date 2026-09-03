// Renders tools/og-template.html to og.png at 1200x630, the size Open Graph and
// Twitter cards expect. Regenerate whenever the hero tagline changes so the
// shared link and the page agree.
//
// Needs a one-off `npm install playwright` (or a global one). Neither the
// install nor a package.json belongs in the repo — the site itself has no
// dependencies and no build step, and tools/ is not part of the site.
//
//   node tools/make-og.mjs

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const template = join(here, 'og-template.html');
const output = join(here, '..', 'og.png');

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('playwright is not installed. Run: npm install playwright');
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

await page.goto('file://' + template, { waitUntil: 'networkidle' });
// The card is set in Space Grotesk; screenshotting before the webfont lands
// silently produces a card in a fallback face.
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: output });
await browser.close();

console.log('wrote ' + output);
