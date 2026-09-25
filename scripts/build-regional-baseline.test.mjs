import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildRegionalBaseline } from './build-regional-baseline.mjs';

test('regional baseline preserves source context and does not create scores', async () => {
  const catalogue = JSON.parse(await readFile(new URL('../data/research-catalogue/datasets.json', import.meta.url), 'utf8'));
  const release = { release: { id: 'release_1', datasetId: 'D03-ABS-DATA-BY-REGION', publisher: 'ABS', sourceUrl: 'https://example.test/release', retrievedAt: '2026-09-25T00:00:00Z', referencePeriod: '2025', licenceStatus: 'public', sha256: 'a'.repeat(64), schemaVersion: '1', mappingVersion: '1', access: 'public', admission: 'staged' }, observations: [{ id: 'obs_1', indicatorId: 'population', originalValue: '100', numericValue: 100, unit: 'persons', geographyId: 'https://example.test/area', geographyVersion: 'ASGS', referencePeriod: '2025', sourceLocator: 'row 2', evidenceState: 'direct-count', limitations: ['Aggregate context only.'] }] };
  const output = buildRegionalBaseline(catalogue, [release]);
  assert.equal(output.entries[0].value, 100);
  assert.equal(output.entries[0].presentation.status, 'numeric-context');
  assert.match(output.entries[0].presentation.rule, /Do not infer/);
  assert.equal('score' in output.entries[0], false);
});
