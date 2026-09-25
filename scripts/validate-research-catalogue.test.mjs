import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { catalogueToTurtle, validateCatalogue } from './validate-research-catalogue.mjs';
import { releaseToTurtle, validateReleasePackage, validateReleaseTurtle } from './compile-dataset-release.mjs';

const catalogueUrl = new URL('../data/research-catalogue/datasets.json', import.meta.url);
const readCatalogue = async () => JSON.parse(await readFile(catalogueUrl, 'utf8'));

test('the source catalogue has unique, qualified candidate records', async () => {
  const catalogue = await readCatalogue();
  assert.deepEqual(validateCatalogue(catalogue), { datasetCount: 32 });
  assert.equal(new Set(catalogue.datasets.map(dataset => dataset.id)).size, 32);
  assert.ok(catalogue.datasets.every(dataset => dataset.limitations.length > 0));
});

test('the RDF compilation keeps scenario links and admission state', async () => {
  const turtle = catalogueToTurtle(await readCatalogue());
  assert.match(turtle, /c:D18-CREATIVE-AUSTRALIA a c:DatasetRecord, c:Observation/);
  assert.match(turtle, /c:aboutScenario c:P30/);
  assert.match(turtle, /c:hasAdmissionState c:GovernanceRequired/);
});

test('the catalogue rejects a non-existent scenario reference', async () => {
  const catalogue = await readCatalogue();
  catalogue.datasets[0].scenarios = ['P31'];
  assert.throws(() => validateCatalogue(catalogue), /invalid scenario reference P31/);
});

test('a release package preserves observation provenance before model admission', async () => {
  const catalogue = await readCatalogue();
  const releasePackage = {
    release: {
      id: 'synthetic_d03_20260925', datasetId: 'D03-ABS-DATA-BY-REGION', publisher: 'Synthetic test publisher',
      sourceUrl: 'urn:civics:test:synthetic-d03', retrievedAt: '2026-09-25T00:00:00Z', referencePeriod: '2026',
      licenceStatus: 'test-only', sha256: 'a'.repeat(64), schemaVersion: '1.0.0', mappingVersion: '1.0.0', access: 'public', admission: 'staged',
    },
    observations: [{
      id: 'synthetic_observation_001', indicatorId: 'SyntheticPopulation', originalValue: '123', numericValue: 123,
      unit: 'persons', denominator: 'all residents', geographyId: 'urn:civics:geography:test', geographyVersion: 'test-v1',
      referencePeriod: '2026', sourceLocator: 'synthetic row 1', evidenceState: 'relevant-proxy', scenarios: ['P01'],
      limitations: ['Synthetic test data; not an external source or model input.'],
    }],
  };
  assert.deepEqual(validateReleasePackage(catalogue, releasePackage).observationCount, 1);
  const turtle = releaseToTurtle(catalogue, releasePackage);
  assert.match(turtle, /prov:wasDerivedFrom c:synthetic_d03_20260925/);
  await validateReleaseTurtle(turtle, 1);
});
