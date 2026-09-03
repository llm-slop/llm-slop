---
name: slop-brand
description: The source of truth for llm-slop — a fictional enterprise company that sells AI-generated content by the word, and the running joke behind everything in this GitHub organization. Covers what the bit is, how llm-slop talks, and what must stay true wherever it shows up: the website, repositories and their READMEs, release notes, social accounts, docs, or any new surface. Use this skill for ANY work under the llm-slop org before writing user-visible text, naming anything, designing anything, or reviewing a PR. The joke lives entirely in tone and is easy to break by accident, so consult it even for changes that look purely technical.
---

# llm-slop

## The concept

llm-slop is a fictional enterprise software company that sells AI-generated content
by the word. It is a bit — a sustained deadpan parody of the business of slop: a
company whose product is volume, whose customers want volume, and whose output
nobody reads.

The company is the artifact. It is not any one thing it makes. Right now it has a
GitHub organization and a marketing site, and it can plausibly grow social accounts,
more repositories, a changelog, a status page, a careers page, a conference talk.
Any of those is a legitimate surface for the bit. What holds it together is that
they all sound like the same company.

So: **this document describes llm-slop, not the website.** When you add a surface,
you are not extending a webpage, you are giving an existing company somewhere else
to speak. For website-specific mechanics, read `references/website.md`.

## The joke, precisely

llm-slop is completely honest and completely unashamed. It never winks, never
apologises, and never acknowledges that anything is wrong. It states its worst
qualities as achievements, in the confident register of a real company:

> Words emitted per original idea. Higher is better, according to the methodology
> we also wrote.

Nobody inside the fiction thinks this is bad. That gap — between the cheerful
delivery and what is actually being said — is where all the comedy lives. The
audience supplies the horror; llm-slop supplies only the brag.

**This means llm-slop never editorialises about slop.** A line like "AI content is
ruining the internet" is the bit stepping outside itself to agree with the audience,
and it dies on contact. Stay inside the fiction. Let people arrive at the point
themselves — they will, faster than you can tell them.

## The rule that protects everything else

**llm-slop is about slop. It must never be slop.**

If the writing gets bloated, hedged, padded or emoji-bulleted, it stops being a
parody of slop and simply becomes slop — indistinguishable from its target, and no
longer funny. The satire only reads as satire because the writing is sharper than
what it mocks.

So keep it tight. Short sentences. Concrete nouns. Every line load-bearing. When in
doubt, cut words. This applies to a tweet, a release note and a landing page
equally.

## Two registers — do not mix them

This is the most common way to break the bit, and it is easy to do without noticing.

**House voice** is llm-slop talking about itself: headings, feature copy, pricing,
a post announcing something, a repo description. Tight, deadpan, confident, clean.
It reads like a real company that hired a good copywriter.

**Specimen** is llm-slop's *product* — the slop itself. It appears only where we are
deliberately exhibiting the output: the rotating posts in the site's generator, the
sample API response, a mock "blog post" if one is ever made. This text is supposed
to be terrible: "In today's rapidly evolving landscape", "Let that sink in",
"🧵 1/12".

Quoting a tell as specimen is the joke. Using that tell in house voice is the
failure. Naming a tell as a product feature — "Dashformer™", "Delve Mode" — is house
voice describing the product, which is correct and good.

Specimen must always be visibly framed as output. Unlabelled slop is just slop.

## How a line is built

Set it up in flat corporate register, then turn it in the last few words. Never
explain the turn.

> Simple, transparent pricing. Straightforward tiers with no hidden costs, which is
> why every one of them requires a forty minute call.

> Upload three documents that represent your tone. We store them. We do not read
> them. The onboarding checklist turns green, which is the actual product.

> Dedicated CSM named Kyle · Kyle is also generated

Two things make these work:

**Specificity.** "Kyle" is funny; "dedicated support" is not. "Forty minute call" is
funny; "a lengthy sales process" is not. Reach for the concrete detail — a number, a
name, a job title, a real artifact like a Slack channel or a checklist.

**Restraint.** One turn per line. A joke that lands twice in one sentence lands zero
times. If a passage already has its laugh, the next line should be straight.

A useful test: delete the final clause. If what remains reads as unremarkable real
corporate copy, and the clause you deleted quietly indicts it, the line is right.

## Not in house voice

These are the tells llm-slop *sells*, so using them sincerely in our own prose is
self-defeating:

- em dash pile-ups, and "not X, but Y" constructions
- delve, leverage, robust, seamless, "in today's landscape", "it's not just X"
- emoji bullets, or emoji as decoration
- rule-of-three padding ("faster, smarter, and more efficient")
- hedging: "arguably", "in many ways", "can help you"
- exclamation marks, outside deliberate specimen

Also avoid: explaining a joke, breaking character to reassure the audience, and
"(this is satire)" in any form. The site footer's "This entire site was written by a
human, which we consider a failure of process" is the outer limit of self-awareness
allowed, and it works because it is *still in character*.

## In character vs. honest

Not every surface is the company talking. Getting this backwards produces either a
flat bit or, worse, documentation nobody can trust.

**In character** — anything an audience reads as llm-slop: the website, social
posts, an org profile README, release announcements, product-shaped names.

**Honest** — anything a contributor has to rely on to do work: setup and deploy
instructions, commit messages, PR descriptions, code comments, issue templates,
security and licence files. These are written plainly and accurately. A joke deploy
instruction is not a joke, it is a broken repository.

A repository README can open in character and then get on with real instructions.
When the two are adjacent, make the seam obvious — a heading is enough. Never let
the bit make a factual claim a contributor might act on.

## What stays true, no matter who asks

These are what keep llm-slop a joke rather than a problem. They apply on every
surface, and they matter more, not less, as it grows beyond the website.

- **Invented brands only.** Customers, competitors and partners are made up
  (SYNERGON, Vertexly, Blandly). Never name a real company as a customer or a
  reference. It is defamatory, and a good invented name is funnier anyway.
- **Invented people only.** Testimonials, staff and quotes come from people who do
  not exist. Never attribute anything to a real person.
- **Nothing collects anything.** No email capture, no payment, no signup, no
  analytics. The moment llm-slop takes an address or a card it stops being satire
  and becomes a deceptive product.
- **No fake citations to real institutions.** Absurd invented statistics are the
  joke. A fabricated number sourced to a real journal, agency or firm is
  disinformation wearing the joke as a costume.
- **Legible as parody, on its own.** Anyone landing cold on a single page, post or
  profile should be able to tell within a screen. On social this is also a platform
  rule: a parody account has to be identifiable as parody in its name and bio, not
  only in its posts. Never present llm-slop as a real vendor to someone who has not
  been let in on it, and never engage a real person as though they were a customer.
- **Punch at the practice**, and at buyers who want volume instead of ideas. Never
  at a person.

If a request would cross one of these, the fix is nearly always a better invented
detail rather than a real one.

## Extending the bit to a new surface

1. Decide whether the surface is in character or honest. If both, mark the seam.
2. Read something existing in the same register first and match its rhythm.
3. Write the straight corporate version, then find the turn.
4. Keep it to one idea. Density beats volume — which is, after all, the whole point.
5. Check it against the guardrails above before publishing anywhere public.

## Before you commit

- Read it aloud. If a sentence takes a breath in the middle, cut it.
- House voice, or did you drift into specimen?
- One turn, in the last few words?
- Would it be funnier with a specific number, name or object in it?
- Is anything real being named as a customer, a source, or a quote?
