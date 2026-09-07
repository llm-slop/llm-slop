// The API behind the code sample on llm-slop.com.
//
// One request handler, written against the Fetch API and nothing else, so it
// deploys unchanged to Cloudflare Workers and Deno Deploy and runs locally
// through api/serve.mjs. No dependencies, no build step, same as the site.
//
// It issues no keys, stores nothing and logs nothing: any bearer token is
// accepted because there is no account behind it to check.

import { generate } from './slop.mjs';

const MAX_WORDS = 40000;
const DEFAULT_WORDS = 400;
const MAX_TOPIC = 200;

/* Best-effort, per instance, and reset whenever the runtime recycles it. It is
   here to blunt accidental loops, not to enforce a quota. */
const RATE_LIMIT = { requests: 30, windowMs: 60_000 };
const seen = new Map();

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-max-age': '86400',
};

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body, null, 2) + '\n', {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...CORS, ...headers },
  });

const fail = (status, error, detail, headers) => json({ error, detail }, status, headers);

function rateLimited(ip) {
  const now = Date.now();
  const hits = (seen.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  hits.push(now);
  seen.set(ip, hits);
  if (seen.size > 5000) {
    for (const [key, times] of seen) {
      if (now - times[times.length - 1] > RATE_LIMIT.windowMs) seen.delete(key);
    }
  }
  return hits.length > RATE_LIMIT.requests;
}

/* Any non-empty bearer token is a valid one. There is nothing to look up. */
function bearer(request) {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(\S.*)$/i);
  return match ? match[1] : null;
}

/* Query string or JSON body, whichever the caller used. */
async function params(request, url) {
  if (request.method === 'GET') {
    return {
      topic: url.searchParams.get('topic') ?? undefined,
      words: url.searchParams.get('words') ?? undefined,
      insight: url.searchParams.get('insight') === 'true',
    };
  }
  const raw = (await request.text()).trim();
  if (!raw) return {};
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new SyntaxError('Body is not valid JSON.');
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new SyntaxError('Body is not a JSON object.');
  }
  return body;
}

function clean(input) {
  const topic =
    String(input.topic ?? 'anything')
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .trim()
      .slice(0, MAX_TOPIC) || 'anything';

  const asked = Number(input.words ?? DEFAULT_WORDS);
  if (!Number.isFinite(asked) || asked < 1) throw new RangeError('words must be a positive number.');

  return { topic, words: Math.min(Math.floor(asked), MAX_WORDS) };
}

async function handle(request, ip) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  if (path === '/') {
    if (request.method !== 'GET') return fail(405, 'Method not allowed.', 'GET /', { allow: 'GET, OPTIONS' });
    return json({
      name: 'llm-slop',
      description: 'Enterprise content generation. One endpoint. No parameters that matter.',
      endpoints: {
        'POST /v1/generate': 'Generate content. Requires a bearer token. Any bearer token.',
        'GET /v1/status': 'Operational.',
      },
      docs: 'https://llm-slop.com/#api',
    });
  }

  if (path === '/v1/status') {
    if (request.method !== 'GET') return fail(405, 'Method not allowed.', 'GET /v1/status', { allow: 'GET, OPTIONS' });
    return json({ status: 'operational', measured_against: 'a definition we maintain' });
  }

  if (path === '/v1/generate') {
    if (request.method !== 'POST' && request.method !== 'GET') {
      return fail(405, 'Method not allowed.', 'POST /v1/generate', { allow: 'GET, POST, OPTIONS' });
    }
    if (!bearer(request)) {
      return fail(401, 'Missing bearer token.', 'Send any value. We do not issue keys and we do not check them.', {
        'www-authenticate': 'Bearer',
      });
    }
    if (rateLimited(ip)) {
      return fail(429, 'Too many requests.', `The limit is ${RATE_LIMIT.requests} a minute.`, { 'retry-after': '60' });
    }

    let input;
    try {
      input = clean(await params(request, url));
    } catch (err) {
      return fail(400, 'Bad request.', err.message);
    }

    const { content, words, em_dashes } = generate(input);
    return json({
      content,
      words,
      tokens_billed: Math.ceil(words * 1.28),
      em_dashes,
      original_thoughts: 0,
      warning: 'insight=true is not supported and will not be',
    });
  }

  return fail(404, 'No such endpoint.', 'There is one endpoint. It is POST /v1/generate.');
}

/* The address is only ever compared against itself, for the rate limit above,
   and is never kept beyond the current minute. */
const addressOf = (request) =>
  request.headers.get('cf-connecting-ip') ||
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
  'unknown';

export async function fetchHandler(request, ip = addressOf(request)) {
  try {
    return await handle(request, ip);
  } catch (err) {
    return fail(500, 'Generation failed.', String(err && err.message ? err.message : err));
  }
}

export default { fetch: (request) => fetchHandler(request) };
