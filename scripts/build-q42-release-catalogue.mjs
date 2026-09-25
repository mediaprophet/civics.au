// Builds provenance-bearing RDF and Q42 v3 volumes for every acquired public
// source artifact. It intentionally does not infer spreadsheet column meaning:
// observation-level Q42 products require a reviewed, source-specific mapping.
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const rawDirectory = join(root, 'data', 'raw-releases');
const outputDirectory = join(root, 'data', 'derived-releases');
const defaultCli = 'C:/Projects/qualia-27062026/target/debug/qualia-cli.exe';
const defaultWasmDirectory = 'C:/Projects/qualia-27062026/docs/pkg/webcivics';
const recordedRetrieval = '2026-09-25T00:00:00Z';
const iri = value => `<${String(value).replace(/[<>"{}|^`\\]/g, encodeURIComponent)}>`;
const literal = value => JSON.stringify(String(value));
const localName = value => String(value).replace(/[^A-Za-z0-9_]/g, '_').replace(/^([^A-Za-z_])/, '_$1');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const mediaTypes = {
  '.csv': 'text/csv', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel', '.zip': 'application/zip', '.pdf': 'application/pdf',
};

const sourceFamilies = [
  [/^abs-data-by-region-/, 'D03-ABS-DATA-BY-REGION', 'Australian Bureau of Statistics', 'https://www.abs.gov.au/methodologies/data-region-methodology/2011-25', '2011–2025'],
  [/^abs-business-counts-/, 'D11-ABS-BUSINESS-COUNTS', 'Australian Bureau of Statistics', 'https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits/jul2022-jun2026', '2022–2026'],
  [/^abs-characteristics-australian-business-/, 'D25-ABS-BUSINESS-CHARACTERISTICS', 'Australian Bureau of Statistics', 'https://www.abs.gov.au/statistics/industry/technology-and-innovation/characteristics-australian-business/2024-25', '2024–2025'],
  [/^abs-estimating-homelessness-/, 'D15-ABS-HOMELESSNESS', 'Australian Bureau of Statistics', 'https://www.abs.gov.au/statistics/people/housing/estimating-homelessness-census/2021', '2021 Census'],
  [/^abs-overseas-arrivals-departures-/, 'D09-ABS-OAD', 'Australian Bureau of Statistics', 'https://www.abs.gov.au/statistics/industry/tourism-and-transport/overseas-arrivals-and-departures-australia/jul-2026', 'July 2026'],
  [/^abs-quarterly-tourism-/, 'D10-TRA-TOURISM-LABOUR', 'Australian Bureau of Statistics', 'https://www.abs.gov.au/statistics/economy/national-accounts/quarterly-tourism-labour-statistics/latest-release', 'June quarter 2026'],
  [/^abs-retirement-and-retirement-intentions-/, 'D21-ABS-RETIREMENT-WEALTH', 'Australian Bureau of Statistics', 'https://www.abs.gov.au/statistics/labour/employment-and-unemployment/retirement-and-retirement-intentions-australia/2024-25', '2024–2025'],
  [/^aihw-shs-/, 'D14-AIHW-SHS', 'Australian Institute of Health and Welfare', 'https://www.aihw.gov.au/reports/homelessness-services/specialist-homelessness-services-data', 'June 2026'],
  [/^aihw-family-domestic-sexual-violence-/, 'D33-AIHW-FDSV', 'Australian Institute of Health and Welfare', 'https://www.aihw.gov.au/family-domestic-and-sexual-violence', '2026 release'],
  [/^education-higher-education-/, 'D05-HESSC', 'Australian Government Department of Education', 'https://www.education.gov.au/higher-education-statistics/resources/2024-section-2-all-students', '2024'],
  [/^home-affairs-working-holiday-maker-/, 'D07-HOME-AFFAIRS-WHM', 'Australian Government Department of Home Affairs', 'https://www.homeaffairs.gov.au/research-and-statistics/statistics/visa-statistics/visit', 'June 2025'],
  [/^jsa-internet-vacancies-/, 'D17-JSA-OCCUPATIONS', 'Jobs and Skills Australia', 'https://www.jobsandskills.gov.au/data/internet-vacancy-index', 'August 2026'],
  [/^pc-rogs-/, 'D32-PC-ROGS-HOUSING-HOMELESSNESS', 'Productivity Commission', 'https://www.pc.gov.au/ongoing/report-on-government-services/housing-homelessness/', '2026 release'],
];

export function sourceDefinition(fileName) {
  const found = sourceFamilies.find(([pattern]) => pattern.test(fileName));
  if (!found) throw new Error(`No source-family definition for ${fileName}. Add a reviewed definition before semantic compilation.`);
  const [, datasetId, publisher, sourceUrl, referencePeriod] = found;
  return { datasetId, publisher, sourceUrl, referencePeriod };
}

export function createReleasePackage({ fileName, byteSize, hash }) {
  const definition = sourceDefinition(fileName);
  const stem = fileName.replace(extname(fileName), '');
  const id = `raw_${localName(stem)}`;
  const sourceId = `source_${localName(stem)}`;
  const volumeId = `q42_${localName(stem)}`;
  const mediaType = mediaTypes[extname(fileName).toLowerCase()] ?? 'application/octet-stream';
  return {
    release: {
      id, ...definition, fileName, byteSize, hash, mediaType,
      retrievedAt: recordedRetrieval,
      retrievalTimestampPrecision: 'day; acquisition log records 2026-09-25 but no original clock time',
      licenceStatus: 'Public release; licence and reuse terms require review before public redistribution.',
      access: 'public', admission: 'governance-required',
      parserProfile: `release-provenance/${mediaType}`, mappingVersion: 'release-provenance/1.0.0',
      mappingStatus: 'release-provenance-complete; observation mapping not yet reviewed',
      contentScope: 'release-provenance-only', sourceId, volumeId,
    },
  };
}

export function releaseToRdf({ release }) {
  const releaseIri = `https://civics.au/dataset-releases/${release.id}`;
  const sourceIri = `https://civics.au/source-artifacts/${release.sourceId}`;
  const mappingIri = `https://civics.au/semantic-mappings/${release.id}/release-provenance-1.0.0`;
  const volumeIri = `https://civics.au/q42/${release.volumeId}`;
  const c = 'https://civics.au/ns/evaluation#';
  const triples = [
    [releaseIri, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', `${c}DatasetRelease`, 'iri'],
    [releaseIri, 'http://purl.org/dc/terms/publisher', release.publisher],
    [releaseIri, `${c}catalogueId`, release.datasetId],
    [releaseIri, `${c}referencePeriod`, release.referencePeriod],
    [releaseIri, `${c}licenceStatus`, release.licenceStatus],
    [releaseIri, `${c}hasAccessClass`, `${c}Public`, 'iri'],
    [releaseIri, `${c}hasAdmissionState`, `${c}GovernanceRequired`, 'iri'],
    [releaseIri, `${c}hasSourceArtifact`, sourceIri, 'iri'],
    [releaseIri, `${c}hasContentScope`, `${c}ReleaseProvenanceOnly`, 'iri'],
    [releaseIri, 'http://www.w3.org/ns/prov#wasDerivedFrom', sourceIri, 'iri'],
    [sourceIri, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', `${c}SourceArtifact`, 'iri'],
    [sourceIri, 'http://www.w3.org/ns/dcat#downloadURL', release.sourceUrl, 'iri'],
    [sourceIri, `${c}sourceUrl`, release.sourceUrl, 'iri'],
    [sourceIri, `${c}sourceFileName`, release.fileName],
    [sourceIri, `${c}mediaType`, release.mediaType],
    [sourceIri, `${c}byteSize`, String(release.byteSize), 'integer'],
    [sourceIri, `${c}sha256`, release.hash],
    [sourceIri, `${c}retrievedAt`, release.retrievedAt, 'dateTime'],
    [sourceIri, `${c}retrievalTimestampPrecision`, release.retrievalTimestampPrecision],
    [sourceIri, `${c}parserProfile`, release.parserProfile],
    [sourceIri, `${c}mappingVersion`, release.mappingVersion],
    [sourceIri, `${c}mappingStatus`, release.mappingStatus],
    [mappingIri, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', `${c}SemanticMapping`, 'iri'],
    [mappingIri, `${c}mappingVersion`, release.mappingVersion],
    [mappingIri, `${c}mappingStatus`, release.mappingStatus],
    [volumeIri, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', `${c}Q42Volume`, 'iri'],
    [volumeIri, `${c}mediaType`, 'application/q42'],
    [volumeIri, `${c}q42FormatVersion`, '3', 'integer'],
    [volumeIri, 'http://www.w3.org/ns/prov#wasDerivedFrom', releaseIri, 'iri'],
  ];
  // Native `ingest semantic` currently rejects typed N-Triples literals. Keep
  // lexical values in the compile input; the audit view and manifest retain
  // their declared semantics and a future compiler can add datatype quins.
  const asNt = ([subject, predicate, object, kind]) => `${iri(subject)} ${iri(predicate)} ${kind === 'iri' ? iri(object) : literal(object)} .`;
  const nquads = `${triples.map(asNt).join('\n')}\n`;
  const turtle = [
    '@prefix c: <https://civics.au/ns/evaluation#> .', '@prefix dcat: <http://www.w3.org/ns/dcat#> .',
    '@prefix dct: <http://purl.org/dc/terms/> .', '@prefix prov: <http://www.w3.org/ns/prov#> .', '@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .', '',
    `# Canonical N-Quads is the compilation input. This audit view is release provenance only.`,
    `# A reviewed table/row/cell mapping is required before observations are emitted.`, '',
    `# Release: ${release.id}; source SHA-256: ${release.hash}`,
    ...triples.map(asNt), '',
  ].join('\n');
  return { nquads, turtle };
}

const command = async (file, args, cwd) => execFileAsync(file, args, { cwd, windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
let wasmModule;
async function loadWebCivicsWasm() {
  if (wasmModule) return wasmModule;
  const module = await import(pathToFileURL(join(defaultWasmDirectory, 'qualia.js')).href);
  module.initSync({ module: await readFile(join(defaultWasmDirectory, 'qualia_webcivics_bg.wasm')) });
  wasmModule = module;
  return module;
}

async function pipeRdfThroughWasm({ directory, ntriples }) {
  const wasm = await loadWebCivicsWasm();
  const parsed = wasm.parse_rdf_document_wasm('application/n-triples', ntriples);
  if (!Array.isArray(parsed.quins) || parsed.quin_count !== parsed.quins.length) throw new Error(`WASM parse receipt has inconsistent Quin count for ${directory}.`);
  const quinsPerBlock = 850;
  const blocks = [];
  for (let blockNumber = 0; blockNumber * quinsPerBlock < parsed.quins.length; blockNumber += 1) {
    const rows = parsed.quins.slice(blockNumber * quinsPerBlock, (blockNumber + 1) * quinsPerBlock);
    const raw = new Uint8Array(rows.length * 48);
    const view = new DataView(raw.buffer);
    rows.forEach((quin, row) => quin.forEach((value, field) => view.setBigUint64((row * 48) + (field * 8), BigInt(value), true)));
    const block = wasm.pack_quins_into_superblock(BigInt(blockNumber + 1), 0n, raw);
    const file = `wasm-superblock-${String(blockNumber).padStart(6, '0')}.bin`;
    await writeFile(join(directory, file), block);
    blocks.push({ file, byteSize: block.length, quinCount: rows.length, sha256: sha256(block) });
  }
  const receipt = {
    profile: 'web-civics-wasm-quin-pack/0.1.0-draft', engineVersion: wasm.get_engine_version(),
    compiledProfile: wasm.get_engine_info().profile, inputContentType: 'application/n-triples',
    quinCount: parsed.quin_count, blocks, ownerDid: '0 (unassigned; no identity data was supplied)',
    limitation: 'These are WASM-packed Qualia SuperBlocks, not a standalone Q42 v3 volume. Native Q42 finalisation remains quarantined pending QW-10.',
  };
  await writeFile(join(directory, 'wasm-parse-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  return receipt;
}

async function compileQ42({ directory, cli, verify }) {
  // QW-10 makes the native writer take an explicit access policy. Keep the
  // original N-Quads as the compiler input: the provenance graph must not be
  // silently downgraded into a separate N-Triples-only pathway.
  const source = join(directory, 'canonical.nq');
  await command(cli, [
    'ingest', 'semantic',
    '--access-policy', 'public-not-for-redistribution',
    '--mapping-version', 'civics-release-provenance-v1',
    '--context-digest', 'https://civics.au/ontology/evaluation.ttl',
    source,
  ], directory);
  const output = join(directory, 'canonical.q42');
  const inspection = await command(cli, ['q42', 'inspect', output], directory);
  let fullVerification = 'not-requested';
  if (verify) {
    try {
      await command(cli, ['q42', 'verify', output, '--level', 'full'], directory);
      fullVerification = 'passed';
    } catch (error) {
      fullVerification = /overall=Incomplete/.test(`${error.stdout ?? ''}${error.stderr ?? ''}`) ? 'incomplete' : 'failed';
    }
  }
  const bytes = await readFile(output);
  const inspectText = `${inspection.stdout ?? ''}${inspection.stderr ?? ''}`;
  const lexicalEntries = Number(/lexicon\s+\d+ bytes, (\d+) entries/.exec(inspectText)?.[1] ?? -1);
  const permissiveCommons = /publication permissive-commons/i.test(inspectText);
  const completeAndReviewGated = fullVerification === 'passed' && lexicalEntries > 0 && !permissiveCommons;
  return {
    file: 'canonical.q42', sha256: sha256(bytes), byteSize: bytes.length,
    q42Version: Number(/version\s+(\d+)/.exec(inspectText)?.[1] ?? 0), lexicalEntries,
    fullVerification,
    publicationStatus: completeAndReviewGated ? 'review-gated-local-only' : 'quarantined-not-for-publication',
    knownEngineGaps: [
      ...(lexicalEntries === 0 ? ['standalone lexicon is empty; full verification is incomplete'] : []),
      ...(permissiveCommons ? ['writer defaulted to permissive-commons despite unresolved licence review'] : []),
      ...(!completeAndReviewGated && !permissiveCommons && lexicalEntries > 0 && fullVerification === 'passed'
        ? ['volume must remain local and review-gated under its public-not-for-redistribution policy'] : []),
    ],
  };
}

export async function buildReleaseCatalogue({ compile = false, verify = false, cli = defaultCli } = {}) {
  const fileNames = (await readdir(rawDirectory)).filter(name => name !== 'README.md').sort();
  const report = [];
  for (const fileName of fileNames) {
    const rawPath = join(rawDirectory, fileName);
    const [bytes, metadata] = await Promise.all([readFile(rawPath), stat(rawPath)]);
    const packageData = createReleasePackage({ fileName, byteSize: metadata.size, hash: sha256(bytes) });
    const { nquads, turtle } = releaseToRdf(packageData);
    const directory = join(outputDirectory, packageData.release.id);
    await mkdir(directory, { recursive: true });
    await Promise.all([
      writeFile(join(directory, 'release-provenance.ttl'), turtle),
      writeFile(join(directory, 'canonical.nq'), nquads),
      writeFile(join(directory, 'canonical.nt'), nquads),
    ]);
    const wasm = await pipeRdfThroughWasm({ directory, ntriples: nquads });
    await writeFile(join(directory, 'release-manifest.json'), `${JSON.stringify({ profile: 'web-civics-q42-release/0.1.0-draft', source: packageData.release, products: { turtle: 'release-provenance.ttl', canonicalNQuads: 'canonical.nq', nativeCompileInput: 'canonical.nq', wasmQuinPack: { receipt: 'wasm-parse-receipt.json', quinCount: wasm.quinCount, superblocks: wasm.blocks.map(block => block.file) }, q42: compile ? 'pending' : 'not-compiled' }, limitation: 'This product records release provenance only. It does not assert workbook/CSV/PDF observations until a reviewed source-specific semantic mapping is applied.' }, null, 2)}\n`);
    const q42 = compile ? await compileQ42({ directory, cli, verify }) : null;
    if (q42) {
      const manifestPath = join(directory, 'release-manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      manifest.products.q42 = q42;
      await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    }
    report.push({ id: packageData.release.id, fileName, datasetId: packageData.release.datasetId, q42: q42?.file ?? 'not-compiled' });
  }
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(join(outputDirectory, 'catalogue-manifest.json'), `${JSON.stringify({ profile: 'web-civics-q42-release/0.1.0-draft', generatedAt: new Date().toISOString(), q42Compiler: compile ? { executable: relative(root, cli).replaceAll('\\', '/'), mode: 'native-build-time', verify } : null, releases: report, nextStage: 'Review a source-specific mapping and emit observation-level RDF/Q42; do not infer spreadsheet columns from headers alone.' }, null, 2)}\n`);
  return report;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const unsupported = [...args].filter(arg => !['--compile', '--verify'].includes(arg));
  if (unsupported.length) throw new Error(`Usage: node scripts/build-q42-release-catalogue.mjs [--compile] [--verify]`);
  if (args.has('--verify') && !args.has('--compile')) throw new Error('--verify requires --compile.');
  const result = await buildReleaseCatalogue({ compile: args.has('--compile'), verify: args.has('--verify') });
  console.log(`Built provenance products for ${result.length} raw releases${args.has('--compile') ? ', including native Q42 v3 volumes' : ''}.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error); process.exitCode = 1; });
