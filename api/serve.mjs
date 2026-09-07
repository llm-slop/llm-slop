// Runs the API locally, the way `python3 -m http.server` runs the site.
//
//   node api/serve.mjs            # http://localhost:8787
//   PORT=9000 node api/serve.mjs
//
// Node 18+ only, for the global Request and Response. Nothing to install.

import { createServer } from 'node:http';
import { fetchHandler } from './handler.mjs';

const port = Number(process.env.PORT || 8787);

const server = createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  const request = new Request(new URL(req.url, `http://${req.headers.host || 'localhost'}`), {
    method: req.method,
    headers: req.headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
  });

  const response = await fetchHandler(request, req.socket.remoteAddress || 'local');
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
});

server.listen(port, () => {
  console.log(`llm-slop api on http://localhost:${port}`);
  console.log(`  curl -X POST http://localhost:${port}/v1/generate \\`);
  console.log(`    -H 'Authorization: Bearer anything' \\`);
  console.log(`    -d '{"topic":"onboarding","words":80}'`);
});
