import { readFile } from 'node:fs/promises';
import init, { WasmHealthStore } from '../assets/qualia/qualia_core_db.js';
import { assessCommunityOpportunity, validateCommunityOpportunity } from './community-opportunity-model.mjs';

const templateUrl = new URL('../data/community-opportunity/scenario-template.json', import.meta.url);
const baseOntologyUrl = new URL('../ontology/evaluation.ttl', import.meta.url);
const extensionOntologyUrl = new URL('../ontology/community-opportunity.ttl', import.meta.url);
const wasmUrl = new URL('../assets/qualia/qualia_core_db_bg.wasm', import.meta.url);

async function main() {
  const [templateRaw, baseOntology, extensionOntology, wasm] = await Promise.all([
    readFile(templateUrl, 'utf8'), readFile(baseOntologyUrl, 'utf8'), readFile(extensionOntologyUrl, 'utf8'), readFile(wasmUrl),
  ]);
  const template = JSON.parse(templateRaw).scenario;
  validateCommunityOpportunity(template);
  const assessment = assessCommunityOpportunity(template);
  if (assessment.readiness.status !== 'not-ready-for-pilot') throw new Error('The template must remain unready until a real local agreement resolves its safeguards.');
  await init({ module_or_path: wasm });
  const store = new WasmHealthStore();
  try {
    store.load_turtle(baseOntology);
    store.load_turtle(extensionOntology);
    const result = JSON.parse(store.query(`
      PREFIX c: <https://civics.au/ns/evaluation#>
      SELECT (COUNT(?class) AS ?count) WHERE { ?class a <http://www.w3.org/2000/01/rdf-schema#Class> . }
    `));
    if (Number(result.results.bindings[0].count.value) < 30) throw new Error('Expected the evaluation and community-opportunity vocabularies to define their classes.');
  } finally {
    store.free();
  }
  console.log('Validated community-opportunity template, readiness gates and RDF ontology with QualiaDB.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
