import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pages } from '../content/pages.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
let links = 0;
for (const page of pages) {
 const filename = `${page.slug}.html`;
 const html = await readFile(path.join(root, filename), 'utf8');
 assert(html.includes('<html lang="en-AU">'), `${filename}: missing language`);
 assert.equal((html.match(/<h1>/g) || []).length, 1, `${filename}: expected one h1`);
 assert.equal((html.match(/aria-current="page"/g) || []).length, 1, `${filename}: expected active navigation`);
 const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
 assert.equal(new Set(ids).size, ids.length, `${filename}: duplicate IDs`);
 for (const section of page.sections) {
  assert(ids.includes(section.id), `${filename}: missing section ${section.id}`);
  assert(html.includes(section.html), `${filename}: generated content is stale`);
 }
 for (const [, ref] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  if (/^https?:/.test(ref)) continue;
  const [local, anchor] = ref.split('#');
  const target = path.resolve(root, local || filename);
  assert(target.startsWith(root), `${filename}: invalid local path`);
  await access(target);
  if (anchor) {
   const linked = await readFile(target, 'utf8');
   assert(linked.includes(`id="${anchor}"`), `${filename}: missing anchor ${ref}`);
  }
  links++;
 }
 console.log(`Checked ${filename}`);
}

// Verify 404.html
await access(path.join(root, '404.html'));
await access(path.join(root, 'dist', '404.html'));

// Verify dist assets
for (const page of pages) {
 await access(path.join(root, 'dist', `${page.slug}.html`));
}
await access(path.join(root, 'dist', 'assets', 'styles.css'));
await access(path.join(root, 'dist', 'assets', 'site.js'));
await access(path.join(root, 'dist', 'assets', 'favicon.svg'));
await access(path.join(root, 'dist', 'assets', 'grounds.svg'));

console.log(`Passed: ${pages.length} pages, 404 handler, dist bundle integrity, ${links} local links and assets.`);

