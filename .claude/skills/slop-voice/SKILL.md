---
name: slop-voice
description: The source of truth for what llm-slop is, why it's funny, and how its copy and design must read. Use this skill for ANY work on this repository — editing or adding site copy, writing a new section, changing design or layout, writing the README, reviewing a PR, or naming anything. The site is a parody whose whole joke depends on tone, and tone is easy to break by accident, so consult this before writing a single line of user-visible text, even for a change that seems purely technical.
---

# llm-slop house style

## What this is

`llm-slop` is a one-page parody of a Series B SaaS company that sells AI-generated
content by the word. It is a joke about the economics of slop: a business whose
product is volume, whose customers want volume, and whose output nobody reads.

There is no product. Every CTA is inert. The site is the entire artifact.

## The joke, precisely

The company is completely honest and completely unashamed. It never winks, never
apologises, and never acknowledges that anything is wrong. It states its worst
qualities as achievements, in the confident register of a real launch:

> Words emitted per original idea. Higher is better, according to the methodology
> we also wrote.

Nobody on the page thinks this is bad. That gap — between the cheerful delivery
and what is actually being said — is where all the comedy lives. The reader
supplies the horror; the site supplies only the brag.

**This means the site must never editorialise about slop.** A line like "AI content
is ruining the internet" would be the site stepping outside itself to agree with
the reader, and the joke dies on contact. Stay inside the fiction.

## The rule that protects everything else

**The site is about slop. It must never be slop.**

If the copy gets bloated, hedged, padded or emoji-bulleted, the page stops being a
parody of slop and simply becomes slop — indistinguishable from its target, and no
longer funny. The satire only reads as satire because the writing is sharper than
what it mocks.

So the prose is tight. Short sentences. Concrete nouns. Every line load-bearing.
When in doubt, cut words. A section that says one thing well beats a section that
says three things adequately.

## Two registers — do not mix them

This is the single most common way to break the page.

**House voice** is the company talking about itself: nav, headings, feature cards,
pricing, footer, the 404. Tight, deadpan, confident, clean. Reads like a real
company that has had a good copywriter.

**Specimen** is the product's own output, quarantined to exactly two places: the
rotating post strings in the generator JS (`open`/`mid`/`close` arrays) and the
sample API response. This text is *deliberately* slop — "In today's rapidly
evolving landscape", "Let that sink in", "🧵 1/12" — because we're exhibiting it.

Quoting a tell as a specimen is the joke. Using that tell in house voice is the
failure. The Features section names tells as product features ("Dashformer™",
"Delve Mode") — that is house voice *describing* slop, which is correct.

## How a line is built

Set it up in flat corporate register, then turn it in the last few words. Never
explain the turn; the reader gets there faster than you can tell them.

> Simple, transparent pricing. Straightforward tiers with no hidden costs, which is
> why every one of them requires a forty minute call.

> Upload three documents that represent your tone. We store them. We do not read
> them. The onboarding checklist turns green, which is the actual product.

> Dedicated CSM named Kyle · Kyle is also generated

Two things make these work:

**Specificity.** "Kyle" is funny; "dedicated support" is not. "Forty minute call"
is funny; "a lengthy sales process" is not. Reach for the concrete detail — a
number, a name, a job title, a real artifact like a Slack channel or a checklist.

**Restraint.** One turn per line. A joke that lands twice in one sentence lands
zero times. If a section already has its laugh, the next line should be straight.

A useful test: delete the final clause. If what remains reads as unremarkable real
SaaS copy, and the clause you deleted quietly indicts it, the line is right.

## Not in house voice

These are the tells the site *sells* as features, so using them sincerely in our
own prose is self-defeating:

- em dash pile-ups, and "not X, but Y" constructions
- delve, leverage, robust, seamless, "in today's landscape", "it's not just X"
- emoji bullets, or emoji as decoration
- rule-of-three padding ("faster, smarter, and more efficient")
- hedging: "arguably", "in many ways", "can help you"
- exclamation marks, outside the chat widget's "You're absolutely right!"

Also avoid: explaining a joke, breaking character to reassure the reader, and
"(this is satire)" in any form. The footer's "This entire site was written by a
human, which we consider a failure of process" is the outer limit of self-awareness
allowed, and it works because it is *still in character*.

## What stays true, no matter who asks

These are what keep this a joke rather than a problem. Treat them as fixed:

- **Invented brands only.** The logo wall (SYNERGON, Vertexly, Blandly…) and the
  customer names are invented. Never substitute a real company. Naming a real firm
  as a customer of a fake company is both defamatory and less funny than a good
  made-up name.
- **Invented people only.** Testimonials come from people who do not exist. Never
  attribute a quote to a real person.
- **Nothing collects anything.** Every CTA is `href="#"`. No email capture, no
  payment, no signup, no analytics. The moment the page takes an address or a card
  it stops being satire and becomes a deceptive product.
- **The absurdity stays legible.** The fabricated statistics are absurd on their
  face and belong to the page's own fiction. Never cite a real study, agency or
  publication for a fake number — an invented benchmark is funny, a fake citation
  to a real institution is disinformation.
- **It reads as parody within one screen.** The hero has to land the joke on its
  own for someone who never scrolls.

Punch at the practice, and at buyers who want volume instead of ideas. Never at a
person.

## Technical constraints

The point of the build is that there isn't one.

- **One page, no build, no dependencies.** `index.html` holds markup, CSS and JS
  inline. Do not add a framework, a bundler, or a committed package.json. Someone
  should be able to clone the repo and open the file. (`tools/make-og.mjs` wants a
  locally installed Playwright, which is gitignored along with the package.json npm
  creates for it — that's a one-off on your machine, not a project dependency.)
- **Use the design tokens.** The CSS custom properties at the top of the `<style>`
  block (`--void`, `--slop`, `--hype`, `--line`…) are the palette. Don't hardcode
  hex values; a stray colour is visible immediately on a page this dark.
- **No horizontal scroll at 390px.** The layout is checked at mobile width; the
  benchmark bar's deliberate overflow is contained and should stay that way.
- **Every animation needs a static fallback.** `prefers-reduced-motion` is honoured
  throughout — the typing generator renders a complete post instead of typing, and
  the counter holds still. New motion needs the same treatment.
- **External requests: Google Fonts only.** Everything else is inline or committed.
- **The four absolute URLs move together.** `canonical`, `og:url`, `og:image` and
  `twitter:image` are hardcoded. Change one, change all four.
- **Deploys are branch-based.** Pages serves `main` from the repo root; there is no
  workflow, and `.nojekyll` keeps the files unprocessed.

## Adding or changing a section

1. Read the neighbouring sections first and match their rhythm — most are an
   eyebrow, a two-line heading, a one-sentence lede, then the content.
2. Write the straight corporate version of the copy first. Then find the turn.
3. Keep the section to one idea. The page is already long.
4. Give it an `id` only if something links to it.
5. Check it at 1280px and 390px, and with reduced motion on.

## Regenerating og.png

The social card is generated, not hand-drawn, so it stays consistent with the site:

```bash
node tools/make-og.mjs
```

It renders `tools/og-template.html` at 1200×630 to `og.png`. If the tagline in the
hero changes, regenerate the card so the two agree — the card is what people
actually see when the link is shared, so a stale tagline is the most visible
possible error. `tools/` is not part of the site.

## Before you commit

- Read your new copy aloud. If a sentence takes a breath in the middle, cut it.
- Did you write in house voice, or did you accidentally write specimen?
- Is there exactly one turn, and is it in the last few words?
- Would this line be funnier with a specific number, name or object in it?
- Is anything real being named as a customer, a source, or a quote?
