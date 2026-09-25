// Transparent reference implementation for early Civics model packages.
// It does not select an option or turn incomplete source evidence into a number.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const MODEL_VERSION = '1.0.0-draft';
const perspectives = new Set(['operator-financial', 'government-fiscal', 'social-economic']);
const directions = new Set(['benefit', 'cost', 'transfer']);
const fail = message => { throw new Error(`Economic/statistical model: ${message}`); };
const stableHash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const finiteMoneyOrNull = value => value === null || (typeof value === 'number' && Number.isFinite(value));

export function validateModelPackage(input) {
  if (input?.modelId !== 'community-grounds-economic-statistical-v1') fail('unsupported modelId');
  const c = input.case;
  for (const field of ['id', 'title', 'valuationDate', 'priceBasis', 'discountRate', 'analysisYears', 'decision']) if (c?.[field] === undefined || c[field] === '') fail(`case lacks ${field}`);
  if (!Number.isFinite(c.discountRate) || c.discountRate <= -1 || c.discountRate > 1) fail('discountRate must be finite, greater than -1 and no more than 1');
  if (!Number.isInteger(c.analysisYears) || c.analysisYears < 1) fail('analysisYears must be a positive integer');
  if (!['real', 'nominal'].includes(c.priceBasis?.basis) || !c.priceBasis?.currency || !Number.isInteger(c.priceBasis?.priceYear)) fail('priceBasis must declare currency, priceYear and real or nominal basis');
  if (!Array.isArray(input.alternatives) || input.alternatives.length < 2) fail('at least two alternatives are required');
  const alternativeIds = new Set();
  for (const alternative of input.alternatives) {
    for (const field of ['id', 'label', 'cashFlows', 'outcomeMeasures']) if (alternative?.[field] === undefined || alternative[field] === '') fail(`alternative lacks ${field}`);
    if (alternativeIds.has(alternative.id)) fail(`duplicate alternative ${alternative.id}`); alternativeIds.add(alternative.id);
    const flowIds = new Set();
    for (const flow of alternative.cashFlows) {
      for (const field of ['id', 'perspective', 'year', 'direction', 'amountAud', 'category', 'sourceId', 'limitation']) if (flow?.[field] === undefined) fail(`flow lacks ${field}`);
      if (flowIds.has(flow.id)) fail(`duplicate flow ${alternative.id}/${flow.id}`); flowIds.add(flow.id);
      if (!perspectives.has(flow.perspective)) fail(`invalid perspective ${flow.perspective}`);
      if (!directions.has(flow.direction)) fail(`invalid direction ${flow.direction}`);
      if (!Number.isInteger(flow.year) || flow.year < 0 || flow.year > c.analysisYears) fail(`invalid flow year ${alternative.id}/${flow.id}`);
      if (!finiteMoneyOrNull(flow.amountAud)) fail(`invalid AUD amount ${alternative.id}/${flow.id}`);
      if (flow.perspective === 'social-economic' && flow.direction === 'transfer') fail(`social-economic transfer is not countable: ${alternative.id}/${flow.id}`);
    }
    for (const measure of alternative.outcomeMeasures) {
      for (const field of ['id', 'label', 'unit', 'series', 'sourceId', 'limitation']) if (measure?.[field] === undefined) fail(`outcome measure lacks ${field}`);
      if (!Array.isArray(measure.series)) fail(`outcome series must be an array: ${measure.id}`);
      for (const point of measure.series) if (!Number.isFinite(point?.value) || !Number.isFinite(point?.time)) fail(`outcome series needs finite time/value: ${measure.id}`);
    }
  }
  for (const sensitivity of input.sensitivityCases ?? []) for (const override of sensitivity.overrides ?? []) {
    if (!alternativeIds.has(override.alternativeId)) fail(`sensitivity references unknown alternative ${override.alternativeId}`);
    if (!finiteMoneyOrNull(override.amountAud)) fail(`invalid sensitivity amount ${sensitivity.id}/${override.flowId}`);
  }
}

export function describe(values) {
  if (!Array.isArray(values) || values.some(value => !Number.isFinite(value))) return { status: 'unresolved', reason: 'No complete finite series.' };
  if (!values.length) return { status: 'unresolved', reason: 'No observations.' };
  const sorted = [...values].sort((a, b) => a - b); const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.length > 1 ? values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1) : null;
  const median = values.length % 2 ? sorted[(values.length - 1) / 2] : (sorted[values.length / 2 - 1] + sorted[values.length / 2]) / 2;
  return { status: 'estimated', count: values.length, minimum: sorted[0], maximum: sorted.at(-1), mean, median, sampleVariance: variance, sampleStandardDeviation: variance === null ? null : Math.sqrt(variance) };
}

export function linearTrend(series) {
  if (!Array.isArray(series) || series.length < 2) return { status: 'unresolved', reason: 'At least two observations are required.' };
  const xMean = series.reduce((sum, point) => sum + point.time, 0) / series.length;
  const yMean = series.reduce((sum, point) => sum + point.value, 0) / series.length;
  const denominator = series.reduce((sum, point) => sum + (point.time - xMean) ** 2, 0);
  if (denominator === 0) return { status: 'unresolved', reason: 'Time values do not vary.' };
  const slope = series.reduce((sum, point) => sum + (point.time - xMean) * (point.value - yMean), 0) / denominator;
  return { status: 'estimated', method: 'ordinary-least-squares', intercept: yMean - slope * xMean, slopePerTimeUnit: slope, observations: series.length };
}

function evaluateAlternative(alternative, input, overrides = []) {
  const overrideMap = new Map(overrides.filter(item => item.alternativeId === alternative.id).map(item => [item.flowId, item.amountAud]));
  const ledgers = Object.fromEntries([...perspectives].map(perspective => [perspective, { perspective, presentValueBenefitsAud: 0, presentValueCostsAud: 0, unresolvedFlows: [], excludedTransfers: [], annualNetAud: Array.from({ length: input.case.analysisYears + 1 }, () => 0) }]));
  for (const flow of alternative.cashFlows) {
    const ledger = ledgers[flow.perspective]; const amount = overrideMap.has(flow.id) ? overrideMap.get(flow.id) : flow.amountAud;
    if (amount === null) { ledger.unresolvedFlows.push({ id: flow.id, sourceId: flow.sourceId, limitation: flow.limitation }); continue; }
    if (flow.direction === 'transfer') { ledger.excludedTransfers.push({ id: flow.id, amountAud: amount, category: flow.category }); continue; }
    const pv = amount / ((1 + input.case.discountRate) ** flow.year);
    if (flow.direction === 'benefit') { ledger.presentValueBenefitsAud += pv; ledger.annualNetAud[flow.year] += amount; }
    else { ledger.presentValueCostsAud += pv; ledger.annualNetAud[flow.year] -= amount; }
  }
  for (const ledger of Object.values(ledgers)) {
    ledger.status = ledger.unresolvedFlows.length ? 'incomplete' : 'estimated';
    ledger.netPresentValueAud = ledger.status === 'estimated' ? ledger.presentValueBenefitsAud - ledger.presentValueCostsAud : null;
    ledger.benefitCostRatio = ledger.status === 'estimated' && ledger.presentValueCostsAud > 0 ? ledger.presentValueBenefitsAud / ledger.presentValueCostsAud : null;
    ledger.note = 'This perspective is reported separately. Transfers are retained for reconciliation and excluded from net social-economic resource value.';
  }
  return { id: alternative.id, label: alternative.label, ledgers, outcomes: alternative.outcomeMeasures.map(measure => ({ id: measure.id, label: measure.label, unit: measure.unit, descriptive: describe(measure.series.map(point => point.value)), trend: linearTrend(measure.series), sourceId: measure.sourceId, limitation: measure.limitation })) };
}

export function evaluateModel(input) {
  validateModelPackage(input);
  const base = input.alternatives.map(alternative => evaluateAlternative(alternative, input));
  const sensitivity = (input.sensitivityCases ?? []).map(scenario => ({ id: scenario.id, label: scenario.label, alternatives: input.alternatives.map(alternative => evaluateAlternative(alternative, input, scenario.overrides ?? [])) }));
  const receiptInput = { modelId: input.modelId, modelVersion: MODEL_VERSION, caseId: input.case.id, inputHash: stableHash(input), engine: 'civics-reference-js', generatedAt: new Date().toISOString() };
  return { modelId: input.modelId, modelVersion: MODEL_VERSION, case: input.case, base, sensitivity, runReceipt: { ...receiptInput, receiptHash: stableHash(receiptInput), limitation: 'Reference implementation. Bind matching QualiaDB receipted calculations before making a Qualia execution claim.' }, recommendation: { status: 'not-generated', reason: 'The model reports evidence and calculations. A recorded decision process must assess safeguards, feasibility, distribution and unresolved evidence.' } };
}

async function main() {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath) throw new Error('Usage: node scripts/economic-statistical-models.mjs input.json [output.json]');
  const input = JSON.parse(await readFile(inputPath, 'utf8'));
  const result = evaluateModel(input);
  const output = `${JSON.stringify(result, null, 2)}\n`;
  if (outputPath) await writeFile(outputPath, output); else process.stdout.write(output);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error); process.exitCode = 1; });
