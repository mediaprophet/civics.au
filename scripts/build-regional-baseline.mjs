// Turns reviewed DatasetRelease packages into a display-safe regional baseline.
// It preserves values and limitations; it does not rank places or infer people.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { validateReleasePackage } from './compile-dataset-release.mjs';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function buildRegionalBaseline(catalogue, packages) {
  if (!Array.isArray(packages) || !packages.length) throw new Error('Regional baseline: at least one reviewed release package is required.');
  const entries = [];
  for (const releasePackage of packages) {
    const { dataset } = validateReleasePackage(catalogue, releasePackage);
    if (releasePackage.release.admission !== 'staged') throw new Error(`Regional baseline: ${releasePackage.release.id} is not staged for presentation.`);
    for (const observation of releasePackage.observations) entries.push({
      id: observation.id,
      datasetId: dataset.id,
      datasetTitle: dataset.title,
      releaseId: releasePackage.release.id,
      indicatorId: observation.indicatorId,
      value: observation.numericValue ?? null,
      originalValue: observation.originalValue,
      unit: observation.unit,
      geographyId: observation.geographyId,
      geographyVersion: observation.geographyVersion,
      referencePeriod: observation.referencePeriod,
      evidenceState: observation.evidenceState,
      limitations: observation.limitations,
      source: { publisher: releasePackage.release.publisher, sourceUrl: releasePackage.release.sourceUrl, retrievedAt: releasePackage.release.retrievedAt, licenceStatus: releasePackage.release.licenceStatus, releaseHash: releasePackage.release.sha256, sourceLocator: observation.sourceLocator },
      presentation: { label: `${dataset.title}: ${observation.indicatorId}`, status: observation.numericValue === undefined ? 'reported-text-or-suppressed' : 'numeric-context', rule: 'Area-level context only. Do not infer an individual’s circumstances, eligibility or service demand.' }
    });
  }
  const output = { profile: 'web-civics-regional-baseline/0.1', generatedAt: new Date().toISOString(), entries, presentationRules: ['Show source, period, geography, unit and limitation with every value.', 'Keep source families and measures separate.', 'Do not calculate a composite need, vulnerability or eligibility score.'], provenanceHash: hash(entries) };
  return output;
}

async function main() {
  const [cataloguePath, outputPath, ...packagePaths] = process.argv.slice(2);
  if (!cataloguePath || !outputPath || !packagePaths.length) throw new Error('Usage: node scripts/build-regional-baseline.mjs catalogue.json output.json release-1.json [release-2.json ...]');
  const parse = path => readFile(path, 'utf8').then(text => JSON.parse(text.replace(/^\uFEFF/, '')));
  const [catalogue, ...packages] = await Promise.all([parse(cataloguePath), ...packagePaths.map(parse)]);
  await writeFile(outputPath, `${JSON.stringify(buildRegionalBaseline(catalogue, packages), null, 2)}\n`);
  console.log(`Wrote regional baseline with ${packages.length} release package(s) to ${outputPath}.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error); process.exitCode = 1; });
