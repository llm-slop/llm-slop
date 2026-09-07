# api

The service behind `https://api.llm-slop.com`, which is the address the code
sample on the home page tells people to call.

These notes are honest, like the rest of the contributor documentation. The
strings the service returns are not: those are the product's output, and they
live in `slop.mjs`.

`api/` is not part of the website. GitHub Pages serves the repository root, so
these files are published as text and never executed there. The service runs
somewhere that can run code — see **Deploying**.

## Files

| File | What it is |
| --- | --- |
| `slop.mjs` | The generator. Pure functions, deterministic, no I/O. |
| `handler.mjs` | Routing, auth, limits, errors. One `fetch` handler, Web APIs only. |
| `serve.mjs` | A local server, so the thing can be run without deploying it. |
| `test.mjs` | The test suite. Runs on every pull request. |
| `wrangler.toml` | Cloudflare Workers deploy config. Ignored by every other host. |

No dependencies and no build step, matching the site. Node 18+ for the globals.

## Running it

```bash
node api/serve.mjs                       # http://localhost:8787
node --test api/test.mjs                 # the suite
```

```bash
curl -X POST http://localhost:8787/v1/generate \
  -H 'Authorization: Bearer anything' \
  -d '{"topic": "onboarding", "words": 300}'
```

## The contract

`POST /v1/generate` — and `GET`, with the same names as query parameters.

| Parameter | Default | Notes |
| --- | --- | --- |
| `topic` | `anything` | Substituted into the output. Trimmed to 200 characters. |
| `words` | `400` | Capped at 40,000. Paragraphs are whole, so the count overshoots. |
| `insight` | — | Accepted and ignored. The response says so. |

The response is the object printed on the home page: `content`, `words`,
`tokens_billed`, `em_dashes`, `original_thoughts`, `warning`. **Changing it
means changing the sample in the `#api` section of `index.html` in the same
commit** — the sample's numbers are a real response to the request above.

Also `GET /` (what this is) and `GET /v1/status` (that it is up).

Errors are `{ "error", "detail" }` with a real status code: 400 for a body that
does not parse, 401 without a bearer token, 404, 405 with an `Allow` header, 429
over the rate limit.

## What it deliberately does not do

llm-slop collects nothing, and an API is the easiest place to break that rule by
reflex. So:

- **No keys are issued and none are checked.** `Authorization: Bearer` is
  required because the home page says it is; any non-empty value passes. There
  is no account, no signup, no key endpoint, and there should never be one.
- **Nothing is stored.** No database, no request log, no analytics. The only
  state is an in-memory rate-limit counter, keyed by address, discarded after a
  minute and lost whenever the runtime recycles.
- **No model is called.** The output is assembled from templates, so the service
  costs nothing to run and cannot be prompted into saying anything we did not
  write.

The rate limit is 30 requests a minute per address, per instance. It is there to
blunt an accidental loop, not to enforce a quota.

## Deploying

The handler is a standard `export default { fetch }` module, so it runs on any
of the Web-API runtimes unchanged. Two that need no build step:

**Deno Deploy** — the entry point is `api/handler.mjs`. Link the repository, or:

```bash
deployctl deploy --project=llm-slop-api --entrypoint=api/handler.mjs
```

**Cloudflare Workers** — `wrangler.toml` is here for this:

```bash
npx wrangler deploy
```

Workers attaches a custom domain only for a zone Cloudflare hosts, which means
moving `llm-slop.com`'s nameservers and re-creating the Pages records. Deno
Deploy takes a `CNAME` at the current registrar and leaves the site's DNS alone,
which is why it is listed first.

## The domain

`api.llm-slop.com` is a subdomain, not the Pages site: the apex belongs to the
website and GitHub Pages serves one domain per repository.

1. Deploy, and note the hostname the platform gives you.
2. Add one DNS record at the registrar: `CNAME`, name `api`, pointing at that
   hostname.
3. Add the custom domain in the platform's dashboard so it issues a certificate.
4. Check it end to end, with the exact command the home page prints:

   ```bash
   curl -X POST https://api.llm-slop.com/v1/generate \
     -H "Authorization: Bearer $SLOP_KEY" \
     -d '{"topic": "anything", "words": 40000, "insight": false}'
   ```

Until step 3 finishes, that command fails and the sample on the home page is a
promise rather than a fact.
