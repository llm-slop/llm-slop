// Checks that the endpoint the home page advertises does what the home page
// says it does.
//
//   node --test api/
//
// No test framework beyond the one in Node.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchHandler } from './handler.mjs';
import { generate } from './slop.mjs';

const BASE = 'https://api.llm-slop.com';
let caller = 0;

/* A fresh address per call, so one test's requests never trip another's rate limit. */
const call = (path, init = {}) => fetchHandler(new Request(BASE + path, init), `test-${caller++}`);

const post = (path, body, headers = { authorization: 'Bearer anything' }) =>
  call(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

test('the sample on the home page returns the fields the home page shows', async () => {
  const res = await post('/v1/generate', { topic: 'anything', words: 40000, insight: false });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/json; charset=utf-8');

  const body = await res.json();
  assert.deepEqual(Object.keys(body), [
    'content',
    'words',
    'tokens_billed',
    'em_dashes',
    'original_thoughts',
    'warning',
  ]);
  assert.equal(typeof body.content, 'string');
  assert.equal(body.original_thoughts, 0);
  assert.equal(body.warning, 'insight=true is not supported and will not be');
  assert.ok(body.words >= 40000, `asked for 40000 words, got ${body.words}`);
  assert.equal(body.tokens_billed, Math.ceil(body.words * 1.28));
  assert.equal(body.em_dashes, (body.content.match(/—/g) || []).length);
});

test('the topic appears in the content', async () => {
  const body = await post('/v1/generate', { topic: 'procurement', words: 200 }).then((r) => r.json());
  assert.ok(body.content.includes('procurement'));
});

test('the same request returns the same document', async () => {
  const a = await post('/v1/generate', { topic: 'onboarding', words: 300 }).then((r) => r.json());
  const b = await post('/v1/generate', { topic: 'onboarding', words: 300 }).then((r) => r.json());
  assert.equal(a.content, b.content);
});

test('words defaults, and is capped at 40000', async () => {
  const short = await post('/v1/generate', {}).then((r) => r.json());
  assert.ok(short.words >= 400 && short.words < 700, `the default produced ${short.words} words`);

  const long = await post('/v1/generate', { topic: 'scale', words: 5_000_000 }).then((r) => r.json());
  assert.ok(long.words >= 40000 && long.words < 41000, `the cap produced ${long.words} words`);
});

test('GET works too, with query parameters', async () => {
  const res = await call('/v1/generate?topic=hiring&words=120', { headers: { authorization: 'Bearer anything' } });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.ok(body.content.includes('hiring'));
});

test('a missing bearer token is a 401 that says any token works', async () => {
  const res = await post('/v1/generate', { topic: 'anything' }, {});
  assert.equal(res.status, 401);
  assert.equal(res.headers.get('www-authenticate'), 'Bearer');
  assert.match((await res.json()).detail, /any value/i);
});

test('any bearer token is accepted', async () => {
  for (const token of ['anything', 'sk-not-a-real-key', '.']) {
    const res = await post('/v1/generate', { words: 20 }, { authorization: `Bearer ${token}` });
    assert.equal(res.status, 200, `the token ${token} was rejected`);
  }
});

test('a broken body is a 400, not a 500', async () => {
  const res = await call('/v1/generate', {
    method: 'POST',
    headers: { authorization: 'Bearer anything', 'content-type': 'application/json' },
    body: '{"topic": ',
  });
  assert.equal(res.status, 400);
  assert.match((await res.json()).detail, /JSON/);
});

test('words has to be a number', async () => {
  assert.equal((await post('/v1/generate', { words: 'lots' })).status, 400);
});

test('control characters in the topic do not survive', async () => {
  const body = await post('/v1/generate', { topic: 'a\u0007b\u0000c', words: 20 }).then((r) => r.json());
  assert.ok(body.content.includes('a b c'));
  /* Newlines are the document's own; nothing else in that range should survive. */
  assert.doesNotMatch(body.content, /[\u0000-\u0009\u000b-\u001f\u007f]/);
});

test('the rate limit returns 429 with a retry-after', async () => {
  const ip = 'noisy-neighbour';
  const one = () =>
    fetchHandler(new Request(`${BASE}/v1/generate?words=10`, { headers: { authorization: 'Bearer anything' } }), ip);
  for (let i = 0; i < 30; i++) assert.equal((await one()).status, 200);

  const limited = await one();
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('retry-after'), '60');
});

test('the root describes the endpoint, and the status endpoint answers', async () => {
  const root = await call('/');
  assert.equal(root.status, 200);
  assert.ok((await root.json()).endpoints['POST /v1/generate']);

  const status = await call('/v1/status');
  assert.equal((await status.json()).status, 'operational');
});

test('unknown paths 404 and wrong methods 405', async () => {
  assert.equal((await call('/v2/generate')).status, 404);

  const wrong = await call('/v1/status', { method: 'POST' });
  assert.equal(wrong.status, 405);
  assert.equal(wrong.headers.get('allow'), 'GET, OPTIONS');
});

test('preflight is answered, and every response allows the site to call it', async () => {
  const pre = await call('/v1/generate', { method: 'OPTIONS' });
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get('access-control-allow-origin'), '*');
  assert.equal((await call('/')).headers.get('access-control-allow-origin'), '*');
});

test('the generator leaves no placeholders behind', () => {
  const { content } = generate({ topic: 'anything', words: 20000 });
  assert.doesNotMatch(content, /\{X\}|\{a\}|\{n\}|\{co\}/);
});
