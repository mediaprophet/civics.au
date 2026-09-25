import { readFile } from 'node:fs/promises';
const read = async path => JSON.parse((await readFile(new URL(`../${path}`, import.meta.url), 'utf8')).replace(/^\uFEFF/, ''));
const [catalogue, queue] = await Promise.all([read('data/research-catalogue/datasets.json'), read('data/research-catalogue/demographic-acquisition-queue.json')]);
const known = new Set(catalogue.datasets.map(item => item.id)); const seen = new Set();
for (const item of queue.queue) {
  for (const field of ['priority', 'datasetId', 'domain', 'preferredFormats', 'measures', 'geography', 'presentation', 'status']) if (item[field] === undefined || item[field] === '') throw new Error(`Demographic acquisition queue: ${item.datasetId ?? 'unknown'} lacks ${field}`);
  if (!known.has(item.datasetId)) throw new Error(`Demographic acquisition queue: unknown catalogue dataset ${item.datasetId}`);
  if (seen.has(item.datasetId)) throw new Error(`Demographic acquisition queue: duplicate dataset ${item.datasetId}`); seen.add(item.datasetId);
  if (!Array.isArray(item.preferredFormats) || !Array.isArray(item.measures) || !item.preferredFormats.length || !item.measures.length) throw new Error(`Demographic acquisition queue: ${item.datasetId} needs formats and measures`);
}
console.log(`Validated demographic acquisition queue: ${queue.queue.length} public aggregate source families.`);
