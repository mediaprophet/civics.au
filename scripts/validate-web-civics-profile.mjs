import { readFile } from 'node:fs/promises';

const read = async path => JSON.parse((await readFile(new URL(`../${path}`, import.meta.url), 'utf8')).replace(/^\uFEFF/, ''));
const [profile, requirements, catalogue] = await Promise.all([
  read('data/web-civics-profile/profile.json'),
  read('data/web-civics-profile/dataset-requirements.json'),
  read('data/research-catalogue/datasets.json')
]);
const fail = message => { throw new Error(`Web Civics profile: ${message}`); };
for (const key of ['profileId', 'version', 'runtime', 'formats', 'inputs', 'outputs', 'admissionMinimum']) if (!profile[key]) fail(`profile lacks ${key}`);
if (profile.runtime.engine !== 'QualiaDB WASM') fail('engine must identify QualiaDB WASM');
if (!profile.formats.semanticInput.includes('application/ld+json')) fail('JSON-LD must be a semantic input');
if (profile.formats.ordinaryApplicationData !== 'application/json') fail('ordinary state must be JSON');
const known = new Set(catalogue.datasets.map(entry => entry.id));
const ids = new Set();
for (const requirement of requirements.requirements) {
  for (const key of ['id', 'domain', 'dataset', 'stage', 'access', 'sources', 'purpose']) if (!requirement[key]) fail(`${requirement.id ?? 'unknown'} lacks ${key}`);
  if (ids.has(requirement.id)) fail(`duplicate requirement ${requirement.id}`); ids.add(requirement.id);
  for (const source of requirement.sources) if (!known.has(source)) fail(`${requirement.id} references unknown source ${source}`);
}
console.log(`Validated Web Civics profile ${profile.version}: ${requirements.requirements.length} dataset requirements, ${profile.inputs.length} input and ${profile.outputs.length} output types.`);
