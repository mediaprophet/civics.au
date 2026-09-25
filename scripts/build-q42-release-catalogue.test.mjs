import test from 'node:test';
import assert from 'node:assert/strict';
import { createReleasePackage, releaseToRdf, sourceDefinition } from './build-q42-release-catalogue.mjs';

test('maps acquired FDSV data to a named catalogue source and records provenance in RDF', () => {
  assert.equal(sourceDefinition('aihw-family-domestic-sexual-violence-all-data-2026.xlsx').datasetId, 'D33-AIHW-FDSV');
  const source = createReleasePackage({ fileName: 'aihw-family-domestic-sexual-violence-all-data-2026.xlsx', byteSize: 12, hash: 'a'.repeat(64) });
  const { nquads } = releaseToRdf(source);
  assert.match(nquads, /SourceArtifact/);
  assert.match(nquads, /Q42Volume/);
  assert.match(nquads, /release-provenance-complete/);
  assert.match(nquads, /retrievalTimestampPrecision/);
});

test('the pinned Web Civics WASM bundle parses the provenance graph into Quins', async () => {
  const source = createReleasePackage({ fileName: 'aihw-family-domestic-sexual-violence-all-data-2026.xlsx', byteSize: 12, hash: 'a'.repeat(64) });
  const { nquads } = releaseToRdf(source);
  const { readFile } = await import('node:fs/promises');
  const { pathToFileURL } = await import('node:url');
  const base = 'C:/Projects/qualia-27062026/docs/pkg/webcivics/';
  const wasm = await import(pathToFileURL(`${base}qualia.js`).href);
  wasm.initSync({ module: await readFile(`${base}qualia_webcivics_bg.wasm`) });
  const parsed = wasm.parse_rdf_document_wasm('application/n-triples', nquads);
  assert.equal(parsed.quin_count, 29);
  assert.equal(parsed.quins.length, 29);
});

test('rejects a raw artifact that has no reviewed source-family definition', () => {
  assert.throws(() => sourceDefinition('unmapped-source.csv'), /No source-family definition/);
});
