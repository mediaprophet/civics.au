// Compiles one reviewed release package into provenance-bearing RDF.
// Usage: node scripts/compile-dataset-release.mjs path/to/release.json [--turtle]
// A successful compilation stages evidence; it never admits an input to a model.
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import init, { WasmHealthStore } from '../assets/qualia/qualia_core_db.js';
import { validateCatalogue } from './validate-research-catalogue.mjs';

const catalogueUrl = new URL('../data/research-catalogue/datasets.json', import.meta.url);
const ontologyUrl = new URL('../ontology/evaluation.ttl', import.meta.url);
const literal = value => JSON.stringify(String(value));
const resource = value => `<${String(value).replace(/[<>"{}|^`\\]/g, encodeURIComponent)}>`;
const safeId = value => /^[-A-Za-z_][-A-Za-z0-9_]*$/.test(value);
const stateIri = state => state.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('');
const evidenceStates = new Set(['direct-count', 'relevant-proxy', 'context-only', 'local-primary-research-required', 'not-appropriate-to-count']);

export function validateReleasePackage(catalogue, releasePackage) {
  validateCatalogue(catalogue);
  const failures = [];
  const release = releasePackage?.release;
  const dataset = catalogue.datasets.find(item => item.id === release?.datasetId);
  if (!dataset) failures.push(`Unknown catalogue dataset ID: ${release?.datasetId ?? '<missing>'}.`);
  for (const field of ['id', 'datasetId', 'publisher', 'sourceUrl', 'retrievedAt', 'referencePeriod', 'licenceStatus', 'sha256', 'schemaVersion', 'mappingVersion', 'access', 'admission']) {
    if (!release?.[field]) failures.push(`Release: missing ${field}.`);
  }
  if (!safeId(release?.id ?? '')) failures.push('Release: id must be a safe RDF local name.');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(release?.retrievedAt ?? '')) failures.push('Release: retrievedAt must be a UTC ISO timestamp.');
  if (!/^[a-f0-9]{64}$/i.test(release?.sha256 ?? '')) failures.push('Release: sha256 must be a 64-character hex digest.');
  if (!/^(https?:|urn:)/.test(release?.sourceUrl ?? '')) failures.push('Release: sourceUrl must be an absolute http(s) or urn URI.');
  if (!['public', 'project-internal', 'restricted'].includes(release?.access)) failures.push('Release: invalid access class.');
  if (!['staged', 'governance-required'].includes(release?.admission)) failures.push('Release: admission must remain staged or governance-required.');
  if (!Array.isArray(releasePackage?.observations) || releasePackage.observations.length === 0) failures.push('Release: at least one observation is required.');
  const seen = new Set();
  for (const observation of releasePackage?.observations ?? []) {
    for (const field of ['id', 'indicatorId', 'originalValue', 'unit', 'geographyId', 'geographyVersion', 'referencePeriod', 'sourceLocator', 'evidenceState', 'limitations']) {
      if (observation[field] === undefined || observation[field] === '') failures.push(`Observation ${observation.id ?? '<missing>'}: missing ${field}.`);
    }
    if (!safeId(observation.id ?? '')) failures.push(`Observation ${observation.id ?? '<missing>'}: invalid ID.`);
    if (seen.has(observation.id)) failures.push(`Observation ${observation.id}: duplicate ID.`);
    seen.add(observation.id);
    if (observation.numericValue !== undefined && !Number.isFinite(observation.numericValue)) failures.push(`Observation ${observation.id}: numericValue must be finite when supplied.`);
    if (!evidenceStates.has(observation.evidenceState)) failures.push(`Observation ${observation.id}: invalid evidence state.`);
    if (!Array.isArray(observation.limitations) || observation.limitations.length === 0) failures.push(`Observation ${observation.id}: at least one limitation is required.`);
    for (const scenario of observation.scenarios ?? []) if (!/^P(?:0[1-9]|[12]\d|30)$/.test(scenario)) failures.push(`Observation ${observation.id}: invalid scenario ${scenario}.`);
  }
  if (failures.length) throw new Error(`Dataset-release validation failed:\n- ${failures.join('\n- ')}`);
  return { dataset, observationCount: releasePackage.observations.length };
}

export function releaseToTurtle(catalogue, releasePackage) {
  const { dataset } = validateReleasePackage(catalogue, releasePackage);
  const { release, observations } = releasePackage;
  const lines = [
    '@prefix c: <https://civics.au/ns/evaluation#> .',
    '@prefix dct: <http://purl.org/dc/terms/> .',
    '@prefix prov: <http://www.w3.org/ns/prov#> .',
    '',
    `c:${release.id} a c:DatasetRelease ;`,
    `  c:catalogueId ${literal(dataset.id)} ;`,
    `  dct:publisher ${literal(release.publisher)} ;`,
    `  c:sourceUrl ${resource(release.sourceUrl)} ;`,
    `  c:retrievedAt ${literal(release.retrievedAt)} ;`,
    `  c:referencePeriod ${literal(release.referencePeriod)} ;`,
    `  c:licenceStatus ${literal(release.licenceStatus)} ;`,
    `  c:sha256 ${literal(release.sha256)} ;`,
    `  c:schemaVersion ${literal(release.schemaVersion)} ;`,
    `  c:mappingVersion ${literal(release.mappingVersion)} ;`,
    `  c:hasAccessClass c:${stateIri(release.access)} ;`,
    `  c:hasAdmissionState c:${stateIri(release.admission)} .`,
    '',
  ];
  for (const observation of observations) {
    const observationLines = [
      `c:${observation.id} a c:Observation ;`,
      `  c:hasIndicator c:${observation.indicatorId} ;`,
      `  c:originalValue ${literal(observation.originalValue)} ;`,
      `  c:unit ${literal(observation.unit)} ;`,
      `  c:geographyVersion ${literal(observation.geographyVersion)} ;`,
      `  c:sourceLocator ${literal(observation.sourceLocator)} ;`,
      `  c:referencePeriod ${literal(observation.referencePeriod)} ;`,
      `  c:hasEvidenceState c:${stateIri(observation.evidenceState)} ;`,
      `  c:geography ${resource(observation.geographyId)} ;`,
      `  prov:wasDerivedFrom c:${release.id} ;`,
    ];
    if (observation.numericValue !== undefined) observationLines.push(`  c:numericValue ${observation.numericValue} ;`);
    if (observation.denominator) observationLines.push(`  c:denominator ${literal(observation.denominator)} ;`);
    for (const scenario of observation.scenarios ?? []) observationLines.push(`  c:aboutScenario c:${scenario} ;`);
    for (const limitation of observation.limitations) observationLines.push(`  c:limitation ${literal(limitation)} ;`);
    observationLines[observationLines.length - 1] = `${observationLines[observationLines.length - 1].slice(0, -1)}.`;
    lines.push(...observationLines, '');
  }
  return `${lines.join('\n')}\n`;
}

export async function validateReleaseTurtle(turtle, expectedObservationCount) {
  const [ontology, wasm] = await Promise.all([
    readFile(ontologyUrl, 'utf8'),
    readFile(new URL('../assets/qualia/qualia_core_db_bg.wasm', import.meta.url)),
  ]);
  await init({ module_or_path: wasm });
  const store = new WasmHealthStore();
  try {
    store.load_turtle(ontology);
    store.load_turtle(turtle);
    const result = JSON.parse(store.query(`
      PREFIX c: <https://civics.au/ns/evaluation#>
      SELECT (COUNT(?observation) AS ?count) WHERE { ?observation a c:Observation . }
    `));
    const parsed = Number(result.results.bindings[0].count.value);
    if (parsed !== expectedObservationCount) throw new Error(`QualiaDB parsed ${parsed} observations; expected ${expectedObservationCount}.`);
  } finally {
    store.free();
  }
}

async function main() {
  const [input, ...args] = process.argv.slice(2);
  if (!input || args.some(arg => arg !== '--turtle')) throw new Error('Usage: node scripts/compile-dataset-release.mjs path/to/release.json [--turtle]');
  const [catalogueRaw, releaseRaw] = await Promise.all([readFile(catalogueUrl, 'utf8'), readFile(input, 'utf8')]);
  const releasePackage = JSON.parse(releaseRaw);
  const turtle = releaseToTurtle(JSON.parse(catalogueRaw), releasePackage);
  await validateReleaseTurtle(turtle, releasePackage.observations.length);
  if (args.includes('--turtle')) process.stdout.write(turtle);
  else console.log(`Validated release package ${releasePackage.release.id} and parsed its staged RDF graph with QualiaDB; use --turtle to emit it.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
