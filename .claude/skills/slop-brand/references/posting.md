# Publishing a day of the log

The checklist a scheduled session follows to add one entry to `malcollm/`. It is
honest register: every step here is a real instruction, not a joke.

The repository is the only state. There is no database, no draft queue and no
memory between runs. Yesterday's post is in `malcollm/index.html`, and that file is
what tells the next run where the log got to.

## Before writing

1. Read `AGENTS.md` from the repository root, in full.
2. Read `.claude/skills/slop-brand/SKILL.md`, for what llm-slop is and how it talks.
3. Read `references/website.md`, next to this file, especially **Malcollm, and the
   third register**. His page is neither house voice nor specimen, and the rules
   that keep it that way are there.
4. Invoke the `malcollm-hollmes` skill. It is the voice. If it will not load, find
   its `SKILL.md` under `/root/.claude/plugins/synced/` and read that instead.
5. Read every existing `<article class="log">` in `malcollm/index.html`. They are
   the continuity: the day number, the date, and what has already been said.

## Choosing the post

- The new entry is the next day number, dated the day it is published.
- Do not repeat a topic, a specific number, or a closing line already in the log.
- Rotate the pillar, but `Head` is his actual work and should come up most. The
  four are `Head`, `Slop watch`, `Gym`, `Eating`. Do not write a fourth
  `Slop watch` in a row.
- Roughly one post in three carries no joke at all and is simply useful.
- One to six short lines. Flat kicker last. No em dashes, no emoji, no hashtags.
- No woo. He is holistic, not a candle: no "energy", "toxins", "alignment",
  "journey", "holding space". Questions over conclusions in the emotional material;
  he asks, he does not diagnose a stranger.
- The care guardrails are absolute. Never instead of treatment, and never a claim
  that insight cures a named disease. Never blame: nobody caused their illness by
  feeling the wrong thing. He is not a therapist. General, never prescriptive: no
  calorie targets, macros, protocols, 30-day anything, supplements, or alternative
  treatments dressed as medicine. If a line could read as "you do not need the
  doctor", rewrite it.
- He is a real person with no degree, and he says so when it is relevant. Never
  give him credentials, and never write him as an AI, a character or a persona.
- A real fact stays real and gets credited. He is suspicious of "studies show" as
  an authority move. An invented statistic only ever appears as llm-slop's own
  parody of itself, never as Malcollm's.

## Editing the page

Add the entry at the top of `<div class="logs">`, matching the markup exactly:

```html
    <article class="log" id="day-N" data-pillar="PILLAR">
      <div class="log-m mono"><a href="#day-N">Day N</a><span>D Month YYYY</span><span class="log-p">PILLAR</span></div>
      <div class="log-b">
        <p>One line.</p>
        <p>Another.</p>
      </div>
    </article>
```

Then update the count, which appears five times in that same file and nowhere else
on the site:

- the `.feat-bar` line, "N posts this quarter"
- the first `.stat`, "N posts. One a day."
- the second `.stat`, "N read end to end"
- the `<h2>`, which spells both numbers in words
- the `.tally` paragraph under the chips

The tally string inside the page script is rebuilt from the visible entries and
needs no edit. Nothing outside `malcollm/index.html` carries the number.

## Then

1. `node tools/make-malcollm-rss.mjs` to regenerate `malcollm/rss.xml`.
2. Set `<lastmod>` for `https://llm-slop.com/malcollm/` in `sitemap.xml` to today.
3. `node tools/seo-check.mjs`. It must pass before anything is pushed.
4. Serve the site and open the page, at 1280px and at 390px. No horizontal scroll,
   and the pillar chips still filter to the right count.

## Committing

One commit, straight to `main`, pushed. The commit message is honest register and
describes the change plainly; the post itself is the only place the voice belongs.

Authored by Claude, and marked as machine-written, which is what `AGENTS.md`
requires and what `tools/provenance.mjs` reads:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>

Slop-Provenance: machine
Slop-Sample: <one line copied verbatim from SIGNATURES in AGENTS.md>
```

Rotate the sample. `git log -1` shows which one the previous commit used, and the
next commit uses a different one.

## If something is wrong

Push nothing. A day with no post is a gap. A day with a broken page, a wrong count
or a reckless health tip is worse, and the whole point of the log is that it is the
part of this site you can trust.
