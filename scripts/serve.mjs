// Static dev server for src/. Uses only Node built-ins (zero npm dependencies).
// Needed because browsers block ES module scripts loaded from file:// URLs.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src/', import.meta.url));
const PORT = Number(process.env.PORT) || 8080;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

/**
 * Resolves a URL path to a file inside ROOT.
 * @param {string} urlPath - The request path, e.g. "/js/app.js".
 * @returns {string | null} The absolute file path, or null if it would escape ROOT.
 * @throws {URIError} If `urlPath` contains malformed percent-encoding.
 */
function resolveFile(urlPath) {
  const relative = urlPath === '/' ? 'index.html' : decodeURIComponent(urlPath).slice(1);
  const filePath = resolve(ROOT, relative);
  return filePath.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep) ? filePath : null;
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  let filePath;
  try {
    filePath = resolveFile(pathname);
  } catch {
    // Malformed percent-encoding (e.g. "/%E0%A4%A"): reject the request, don't crash.
    res.writeHead(400).end('Bad request');
    return;
  }
  if (filePath === null) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const body = await readFile(filePath);
    const type = CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type }).end(body);
  } catch {
    // Missing file or a directory: both are a plain 404 for this simple server.
    res.writeHead(404).end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Serving src/ at http://localhost:${PORT}`);
});
