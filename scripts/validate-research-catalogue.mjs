// Validates the candidate-source catalogue and compiles it to a small RDF graph.
// It deliberately does not download, scrape, licence-check or admit external data.
// Usage: node scripts/validate-research-catalogue.mjs [--turtle]
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import init, { WasmHealthStore } from '../assets/qualia/qualia_core_db.js';

const root = new URL('../', import.meta.url);
const catalogueUrl = new URL('../data/research-catalogue/datasets.json', import.meta.url);
const ontologyUrl = new URL('../ontology/evaluation.ttl', import.meta.url);
const required = ['id', 'title', 'publisher', 'sourceUrl', 'access', 'refresh', 'coverage', 'use', 'packs', 'scenarios', 'admission', 'limitations', 'mapping'];
const allowedAccess = new Set(['public', 'project-internal', 'restricted']);
const allowedAdmission = new Set(['candidate', 'staged', 'governance-required']);
const allowedEntities = new Set(['EvidenceRecord', 'Observation', 'RestrictedCaseEvidence', 'EvidenceArtifact', 'MethodPack']);
const literal = value => JSON.stringify(String(value));
const resource = value => `<${String(value).replace(/[<>"{}|^`\\]/g, encodeURIComponent)}>`;
const pascal = value => value.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('');

export function validateCatalogue(catalogue) {
  const failures = [];
  if (catalogue?.status !== 'candidate-sources-only') failures.push('Catalogue status must be candidate-sources-only.');
  if (!/^\d+\.\d+\.\d+$/.test(catalogue?.version ?? '')) failures.push('Catalogue version must be semantic versioning.');
  if (!Array.isArray(catalogue?.datasets) || catalogue.datasets.length === 0) failures.push('Catalogue must contain datasets.');
  const ids = new Set();
  for (const dataset of catalogue.datasets ?? []) {
    for (const field of required) if (!(field in dataset)) failures.push(`${dataset?.id ?? '<missing id>'}: missing ${field}.`);
    if (!/^D\d{2}-[A-Z0-9-]+$/.test(dataset.id ?? '')) failures.push(`${dataset?.id ?? '<missing id>'}: invalid dataset ID.`);
    if (ids.has(dataset.id)) failures.push(`${dataset.id}: duplicate dataset ID.`);
    ids.add(dataset.id);
    if (!allowedAccess.has(dataset.access)) failures.push(`${dataset.id}: invalid access class.`);
    if (!allowedAdmission.has(dataset.admission)) failures.push(`${dataset.id}: invalid admission state.`);
    if (!Array.isArray(dataset.use) || dataset.use.length === 0) failures.push(`${dataset.id}: must state an intended use.`);
    if (!Array.isArray(dataset.packs)) failures.push(`${dataset.id}: packs must be an array.`);
    if (!Array.isArray(dataset.scenarios)) failures.push(`${dataset.id}: scenarios must be an array.`);
    if (!Array.isArray(dataset.limitations) || dataset.limitations.length === 0) failures.push(`${dataset.id}: must preserve at least one limitation.`);
    if (!allowedEntities.has(dataset.mapping?.entity)) failures.push(`${dataset.id}: mapping.entity is not a known catalogue entity.`);
    if (typeof dataset.mapping?.observationType !== 'string' || dataset.mapping.observationType.length === 0) failures.push(`${dataset.id}: mapping.observationType is required.`);
    if (typeof dataset.sourceUrl !== 'string' || !/^(https?:|urn:|\.\.\/)/.test(dataset.sourceUrl)) failures.push(`${dataset.id}: sourceUrl must be an http(s), urn or relative URI.`);
    for (const scenario of dataset.scenarios ?? []) if (!/^P(?:0[1-9]|[12]\d|30)$/.test(scenario)) failures.push(`${dataset.id}: invalid scenario reference ${scenario}.`);
    for (const pack of dataset.packs ?? []) if (!/^CP-(?:0[1-9]|1[0-2])$/.test(pack)) failures.push(`${dataset.id}: invalid data-pack reference ${pack}.`);
  }
  if (failures.length) throw new Error(`Research catalogue validation failed:\n- ${failures.join('\n- ')}`);
  return { datasetCount: catalogue.datasets.length };
}

export function catalogueToTurtle(catalogue) {
  validateCatalogue(catalogue);
  const triples = [
    '@prefix c: <https://civics.au/ns/evaluation#> .',
    '@prefix dcat: <http://www.w3.org/ns/dcat#> .',
    '@prefix dct: <http://purl.org/dc/terms/> .',
    '',
    `c:catalogue-${catalogue.catalogueId} a dcat:Catalog ;`,
    `  dct:title ${literal(catalogue.description)} ;`,
    `  c:schemaVersion ${literal(catalogue.version)} .`,
    '',
  ];
  for (const dataset of catalogue.datasets) {
    const lines = [
      `c:${dataset.id} a c:DatasetRecord, c:${dataset.mapping.entity} ;`,
      `  c:catalogueId ${literal(dataset.id)} ;`,
      `  dct:title ${literal(dataset.title)} ;`,
      `  c:publisherName ${literal(dataset.publisher)} ;`,
      `  c:sourceUrl ${resource(dataset.sourceUrl)} ;`,
      `  c:hasAccessClass c:${pascal(dataset.access)} ;`,
      `  c:hasAdmissionState c:${pascal(dataset.admission)} ;`,
      `  c:refreshCadence ${literal(dataset.refresh)} ;`,
      `  c:coverageNote ${literal(dataset.coverage)} ;`,
      `  c:declaredObservationType ${literal(dataset.mapping.observationType)} ;`,
    ];
    for (const use of dataset.use) lines.push(`  c:intendedUse ${literal(use)} ;`);
    for (const pack of dataset.packs) lines.push(`  c:feedsPack ${literal(pack)} ;`);
    for (const scenario of dataset.scenarios) lines.push(`  c:aboutScenario c:${scenario} ;`);
    for (const limitation of dataset.limitations) lines.push(`  c:limitation ${literal(limitation)} ;`);
    lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, -1)}.`;
    triples.push(...lines, '');
  }
  return `${triples.join('\n')}\n`;
}

export async function validateTurtle(ontology, catalogueTurtle) {
  await init({ module_or_path: await readFile(new URL('../assets/qualia/qualia_core_db_bg.wasm', import.meta.url)) });
  const store = new WasmHealthStore();
  try {
    store.load_turtle(ontology);
    store.load_turtle(catalogueTurtle);
    const result = JSON.parse(store.query(`
      PREFIX c: <https://civics.au/ns/evaluation#>
      SELECT (COUNT(?dataset) AS ?count) WHERE { ?dataset a c:DatasetRecord . }
    `));
    return Number(result.results.bindings[0].count.value);
  } finally {
    store.free();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--turtle')) throw new Error('Usage: node scripts/validate-research-catalogue.mjs [--turtle]');
  const [raw, ontology] = await Promise.all([readFile(catalogueUrl, 'utf8'), readFile(ontologyUrl, 'utf8')]);
  const catalogue = JSON.parse(raw);
  const { datasetCount } = validateCatalogue(catalogue);
  const turtle = catalogueToTurtle(catalogue);
  const parsedCount = await validateTurtle(ontology, turtle);
  if (parsedCount !== datasetCount) throw new Error(`QualiaDB parsed ${parsedCount} catalogue records; expected ${datasetCount}.`);
  if (args.includes('--turtle')) process.stdout.write(turtle);
  else console.log(`Validated ${datasetCount} candidate source records and parsed the RDF catalogue with QualiaDB.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
