// Tiny static file server for trying the guide locally:
//   node serve.ts
// then open http://localhost:8080 in a desktop browser.
// Serves only files under app/, nothing else.

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(fileURLToPath(new URL('.', import.meta.url)), 'app');
const PORT = 8080;
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

createServer((request, response) => {
  const path = normalize(join(appRoot, decodeURIComponent(request.url?.split('?')[0] ?? '/')));
  if (!path.startsWith(appRoot)) {
    response.writeHead(403);
    response.end('forbidden');
    return;
  }
  const file = path.endsWith('/') ? join(path, 'index.html') : path;
  if (!existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404);
    response.end('not found');
    return;
  }
  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
}).listen(PORT, () => console.log(`serving app/ at http://localhost:${PORT}`));
