import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.md': 'text/plain; charset=utf-8' };
http.createServer(async (request, response) => {
 try {
  const url = new URL(request.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);

  // Local stub: redirect POST /eoi to success page (no email in dev)
  if (request.method === 'POST' && pathname === '/eoi') {
    response.writeHead(303, { Location: '/eoi-sent.html' });
    response.end();
    return;
  }

  const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (!(relative.match(/^(index|community-grounds|walkabout|infrastructure|digital-economy|cooperative-projects|journey-out|review|eoi|eoi-sent|404)\.html$/) || relative.match(/^assets\/[a-z0-9._-]+\.(css|js|svg)$/))) {
    const notFoundData = await readFile(path.join(root, '404.html'));
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(notFoundData);
    return;
  }
  const data = await readFile(path.join(root, relative));
  response.writeHead(200, { 'Content-Type': types[path.extname(relative)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  response.end(data);
 } catch {
  const notFoundData = await readFile(path.join(root, '404.html')).catch(() => 'Not found');
  response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(notFoundData);
 }
}).listen(4173, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:4173'));
