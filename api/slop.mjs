// The generator behind POST /v1/generate.
//
// Deterministic: the same request produces the same document, so the output is
// testable and cacheable. Web-standard JavaScript with no imports, so the same
// file runs on Cloudflare Workers, Deno Deploy and node:http.
//
// The strings below are specimen — they are the product's output, not the
// company's voice. They are supposed to read badly.

const OPEN = [
  "Let's be honest.",
  'Unpopular opinion:',
  'Nobody talks about this.',
  "I'll say the quiet part out loud.",
  'Hot take, but hear me out.',
  'This might ruffle feathers.',
  'I was wrong about {X}.',
  'A thread on {X}, because someone has to write it.',
  'Three years ago a mentor asked me a question about {X}. I still think about it.',
];

const CLAIM = [
  "{X} isn't just {a} — it's a mindset.",
  'Most teams treat {X} as a cost centre. The best treat it as a religion.',
  "In today's rapidly evolving landscape, {X} is no longer optional — it's table stakes.",
  "I've spent 14 years in {X}. Here's what nobody tells you.",
  "We didn't need more {X}. We needed the courage to delve into {X}.",
  "The companies winning at {X} in 2026 all have one thing in common — and it isn't {a}.",
  '{X} is eating {a}, and the incumbents are not ready for the conversation.',
  'Every leader I respect has quietly rebuilt their entire approach to {X}.',
  "The {X} playbook that worked last year is now actively costing you money — and you can't see it yet.",
  'Stop optimising {X}. Start operationalising {X}.',
  'Nobody was asking for {X}. That is precisely why it matters.',
  'The gap between teams that get {X} and teams that talk about {X} is widening — fast.',
];

const TURN = [
  'But here is where it gets interesting.',
  'And yet.',
  'So what changed?',
  'Let me be more specific.',
  'This is the part people skip.',
  'Zoom out for a second.',
];

const STAT = [
  'Our benchmark puts it at {n}% — a number we compute, publish and stand behind.',
  '{n} out of every 10 teams we surveyed said {X} was a priority. We surveyed our own staff.',
  'Internally we measure this at {n} points of lift, against a baseline we also define.',
  'We ran the numbers. {n}% of the value arrives in the first sprint, according to us.',
];

const CASE = [
  '{co} rebuilt their {X} function around this and never looked back, or forward.',
  'When {co} adopted it, output went up {n}x. Nobody has audited the denominator.',
  '{co} calls it the single highest-leverage change they made this quarter, so far.',
];

const LIST_LEAD = [
  'Three things changed:',
  'Here is the framework:',
  'What actually moved the needle:',
  'The playbook, condensed:',
];

const LIST_ITEM = [
  'Stop treating {X} as {a}.',
  'Ship before the strategy is finished. The strategy is the shipping.',
  'Measure everything. Read none of it.',
  'Align the org around {X} before anyone defines {X}.',
  'Volume compounds. Quality does not, according to our benchmark.',
  "Make {X} everyone's job, which is how it becomes nobody's.",
];

const CLOSE = [
  "Here's the thing.",
  'Let that sink in.',
  'Thoughts?',
  '🧵 1/12',
  "Agree? Disagree? Comment 'SLOP' and I'll DM you the deck.",
  'What am I missing?',
  'Repost if this resonated. Repost twice if it did not.',
];

const FILLER = ['a tool', 'a strategy', 'a channel', 'a headcount problem', 'a roadmap item', 'a quarterly ritual'];
const COMPANY = ['SYNERGON', 'Vertexly', 'CORPUS MAXIMUM', 'Blandly', 'hoot.', 'NORTHWIND AI', 'Palisade&Co', 'deployr', 'OMNIVEC', 'thoughtpipe', 'LUMENSTACK'];

/* A 32-bit string hash, so a topic and a length pick the same document twice. */
function seedOf(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* mulberry32: small, seedable, good enough to shuffle sentences with. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const countWords = (str) => {
  const t = str.trim();
  return t ? t.split(/\s+/).length : 0;
};

const countEmDashes = (str) => (str.match(/—/g) || []).length;

export function fill(template, topic, next) {
  const pick = (list) => list[Math.floor(next() * list.length)];
  return template
    .replace(/\{X\}/g, () => topic)
    .replace(/\{a\}/g, () => pick(FILLER))
    .replace(/\{co\}/g, () => pick(COMPANY))
    .replace(/\{n\}/g, () => String(2 + Math.floor(next() * 97)));
}

/* One paragraph, in one of five shapes. Lists render as their own block. */
function paragraph(topic, next) {
  const pick = (list) => fill(list[Math.floor(next() * list.length)], topic, next);
  const shape = next();

  if (shape < 0.14) return pick(LIST_LEAD) + '\n\n' + [0, 1, 2].map((i) => `${i + 1}. ` + pick(LIST_ITEM)).join('\n');
  if (shape < 0.28) return pick(STAT) + ' ' + pick(CLAIM);
  if (shape < 0.42) return pick(CASE) + ' ' + pick(TURN);
  if (shape < 0.62) return pick(CLAIM) + ' ' + pick(TURN) + ' ' + pick(CLAIM);
  return pick(CLAIM) + ' ' + pick(CLAIM);
}

/**
 * Generates a document of roughly `words` words about `topic`.
 *
 * Paragraphs are whole, so the result overshoots the target rather than
 * cutting a sentence in half. The returned `words` is the real count.
 */
export function generate({ topic = 'anything', words = 400 } = {}) {
  const next = rng(seedOf(`${topic}:${words}`));
  const pick = (list) => fill(list[Math.floor(next() * list.length)], topic, next);

  const parts = [pick(OPEN)];
  let total = countWords(parts[0]);

  while (total < words) {
    const para = paragraph(topic, next);
    parts.push(para);
    total += countWords(para);
  }
  parts.push(pick(CLOSE));

  const content = parts.join('\n\n');
  return { content, words: countWords(content), em_dashes: countEmDashes(content) };
}
