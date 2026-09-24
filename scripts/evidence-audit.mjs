// Read-only semantic spike: expose existing workbook registers as RDF and query
// the bundled QualiaDB runtime. No source claims are independently verified here.
// Usage: node scripts/evidence-audit.mjs [--turtle]
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import init, { WasmHealthStore, get_engine_version } from '../assets/qualia/qualia_core_db.js';

export const PREFIX = 'PREFIX c: <urn:civics:evidence:>\n';
const literal = value => JSON.stringify(String(value));
const cellValue = cell => cell && typeof cell === 'object' ? cell.v : cell;
const digest = text => createHash('sha256').update(text).digest('hex');
const layouts = [
  { sheet: 'Research Inputs', type: 'ResearchRecord', id: /^R\d+$/, columns: {
    B: 'claim', C: 'reportedValue', D: 'reportedUnits', E: 'classification',
    F: 'sourceReference', G: 'reportedAsOf', H: 'reportedStatus', I: 'modelUse', J: 'caveat',
  } },
  { sheet: 'Qualification Register', type: 'QualificationRecord', id: /^Q\d+$/, columns: {
    B: 'domain', C: 'claim', D: 'reportedStatus', E: 'boundary',
    F: 'evidenceRequired', G: 'financialTreatment', H: 'changeIfValidated',
  } },
];

export function buildEvidenceGraph(data, workbookHash) {
  const triples = [
    '@prefix c: <urn:civics:evidence:> .',
    '@prefix prov: <http://www.w3.org/ns/prov#> .',
    'c:workbook a prov:Entity .',
    `c:workbook c:version ${literal(data.version)} .`,
    `c:workbook c:sha256 ${literal(workbookHash)} .`,
    'c:workbook c:interpretation "Register statements as reported by the workbook; not independent source verification." .',
  ];
  const records = [];
  const seen = new Set();
  const sources = new Set();
  for (const layout of layouts) {
    const sheet = data.sheets[layout.sheet];
    if (!sheet) throw new Error(`Missing register: ${layout.sheet}`);
    for (const [address, value] of Object.entries(sheet)) {
      const id = cellValue(value);
      if (!/^A\d+$/.test(address) || !layout.id.test(String(id))) continue;
      if (seen.has(id)) throw new Error(`Duplicate register ID: ${id}`);
      seen.add(id);
      const row = address.slice(1);
      const record = { id, type: layout.type, workbookRow: `${layout.sheet}!${row}` };
      triples.push(`c:${id} a c:${layout.type} ; c:id ${literal(id)} ; prov:wasDerivedFrom c:workbook ; c:workbookRow ${literal(record.workbookRow)} .`);
      for (const [column, predicate] of Object.entries(layout.columns)) {
        const v = cellValue(sheet[column + row]);
        if (v === undefined || v === null || v === '') continue;
        // Preserve dates, values and units as reported. Normalisation belongs in
        // a reviewed mapping step, especially Excel serial dates and percentages.
        record[predicate] = v;
        triples.push(`c:${id} c:${predicate} ${literal(v)} .`);
        if (predicate === 'sourceReference') {
          const sourceId = `source-${digest(String(v))}`;
          triples.push(`c:${id} c:cites c:${sourceId} .`);
          if (!sources.has(sourceId)) {
            sources.add(sourceId);
            triples.push(`c:${sourceId} a c:SourceReference ; c:reference ${literal(v)} .`);
          }
        }
      }
      records.push(record);
    }
  }
  return { turtle: triples.join('\n') + '\n', records };
}

export async function openEvidenceStore(turtle) {
  await init({ module_or_path: await readFile(new URL('../assets/qualia/qualia_core_db_bg.wasm', import.meta.url)) });
  const store = new WasmHealthStore();
  try { store.load_turtle(turtle); } catch (error) { store.free(); throw error; }
  return store;
}

export function select(store, query) {
  const result = JSON.parse(store.query(PREFIX + query));
  if (!result.results?.bindings) throw new Error('Expected SPARQL SELECT bindings');
  return result.results.bindings.map(row => Object.fromEntries(
    Object.entries(row).map(([key, term]) => [key, term.value]),
  ));
}

export function auditStore(store) {
  return {
    status: 'Prototype audit of workbook statements; source validity and model applicability have not been reverified.',
    engineVersion: get_engine_version(),
    registerCounts: select(store, 'SELECT ?type (COUNT(?record) AS ?count) WHERE { ?record a ?type . VALUES ?type { c:ResearchRecord c:QualificationRecord } } GROUP BY ?type ORDER BY ?type'),
    criticalResearchGaps: select(store, 'SELECT ?id ?claim ?use ?caveat WHERE { ?record a c:ResearchRecord ; c:id ?id ; c:claim ?claim ; c:reportedStatus "Open — critical" . OPTIONAL { ?record c:modelUse ?use } OPTIONAL { ?record c:caveat ?caveat } } ORDER BY ?id'),
    qualifications: select(store, 'SELECT ?status (COUNT(?record) AS ?count) WHERE { ?record a c:QualificationRecord ; c:reportedStatus ?status } GROUP BY ?status ORDER BY ?status'),
    missingSourceReferences: select(store, 'SELECT ?id ?claim WHERE { ?record a c:ResearchRecord ; c:id ?id ; c:claim ?claim . FILTER NOT EXISTS { ?record c:cites ?source . ?source c:reference ?reference } } ORDER BY ?id'),
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--turtle')) throw new Error('Usage: node scripts/evidence-audit.mjs [--turtle]');
  const raw = await readFile(new URL('../assets/model-data.json', import.meta.url), 'utf8');
  const graph = buildEvidenceGraph(JSON.parse(raw), digest(raw));
  if (args.includes('--turtle')) { process.stdout.write(graph.turtle); return; }
  const store = await openEvidenceStore(graph.turtle);
  try { console.log(JSON.stringify(auditStore(store), null, 2)); } finally { store.free(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
