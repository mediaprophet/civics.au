import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJson = async relative => JSON.parse(await readFile(path.join(root, relative), 'utf8'));
const areaName = observation => observation.limitations
  ?.find(value => value.startsWith('Area name in source: '))
  ?.replace('Area name in source: ', '')
  .replace(/\.$/, '') ?? observation.geographyId;

export async function buildEvidenceDashboard() {
  const [catalogue, q42Catalogue, lgaRelease] = await Promise.all([
    readJson('data/research-catalogue/datasets.json'),
    readJson('data/derived-releases/catalogue-manifest.json'),
    readJson('data/staged-releases/abs-seifa-2021-lga-table-1.json'),
  ]);
  const datasets = new Map(catalogue.datasets.map(dataset => [dataset.id, dataset]));
  const releaseDirectories = await readdir(path.join(root, 'data/derived-releases'), { withFileTypes: true });
  const q42 = [];
  for (const directory of releaseDirectories.filter(entry => entry.isDirectory())) {
    try {
      const manifest = await readJson(`data/derived-releases/${directory.name}/release-manifest.json`);
      if (manifest.products?.q42?.file) q42.push(manifest.products.q42);
    } catch {}
  }
  const sourceFamilies = [...new Set(q42Catalogue.releases.map(release => release.datasetId))]
    .map(id => ({ id, title: datasets.get(id)?.title ?? id }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const areas = new Map();
  for (const observation of lgaRelease.observations) {
    const name = areaName(observation);
    const area = areas.get(observation.geographyId) ?? {
      id: observation.geographyId,
      name,
      geographyVersion: observation.geographyVersion,
      referencePeriod: observation.referencePeriod,
    };
    if (observation.indicatorId === 'usual-resident-population') area.population = observation.numericValue;
    if (observation.indicatorId === 'seifa-irsd-score') area.irsd = observation.numericValue;
    if (observation.indicatorId === 'seifa-irsad-score') area.irsad = observation.numericValue;
    if (observation.indicatorId === 'seifa-ier-score') area.ier = observation.numericValue;
    if (observation.indicatorId === 'seifa-ieo-score') area.ieo = observation.numericValue;
    areas.set(observation.geographyId, area);
  }

  const output = {
    profile: 'web-civics-evidence-dashboard/0.1',
    title: 'Community Grounds public evidence view',
    scope: 'Area-level context and release provenance. Not a scoring or eligibility system.',
    q42: {
      releaseCount: q42.length,
      fullVerificationPasses: q42.filter(item => item.fullVerification === 'passed').length,
      reviewGated: q42.filter(item => item.publicationStatus === 'review-gated-local-only').length,
      sourceFamilies,
    },
    seifa: {
      publisher: lgaRelease.release.publisher,
      sourceUrl: lgaRelease.release.sourceUrl,
      referencePeriod: lgaRelease.release.referencePeriod,
      geographyVersion: '2021 Local Government Area',
      areas: [...areas.values()].filter(area => area.population !== undefined).sort((a, b) => a.name.localeCompare(b.name)),
      limitation: 'SEIFA is area-level context. It cannot identify an individual’s circumstances, need, eligibility or likely use of a service.',
    },
  };
  await writeFile(path.join(root, 'assets/evidence-dashboard.json'), `${JSON.stringify(output, null, 2)}\n`);
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildEvidenceDashboard().then(result => console.log(`Built evidence dashboard: ${result.q42.releaseCount} reviewed releases and ${result.seifa.areas.length} local government areas.`));
}
