import test from 'node:test';
import assert from 'node:assert/strict';
import { describe, evaluateModel, linearTrend } from './economic-statistical-models.mjs';

test('descriptive statistics and OLS trend are deterministic', () => {
  assert.deepEqual(describe([1, 2, 3]), { status: 'estimated', count: 3, minimum: 1, maximum: 3, mean: 2, median: 2, sampleVariance: 1, sampleStandardDeviation: 1 });
  assert.deepEqual(linearTrend([{ time: 0, value: 1 }, { time: 1, value: 3 }, { time: 2, value: 5 }]), { status: 'estimated', method: 'ordinary-least-squares', intercept: 1, slopePerTimeUnit: 2, observations: 3 });
});

test('economic ledgers remain separate and incomplete inputs do not create results', () => {
  const result = evaluateModel({
    modelId: 'community-grounds-economic-statistical-v1',
    case: { id: 'test', title: 'Test', valuationDate: '2026-07-01', priceBasis: { currency: 'AUD', priceYear: 2026, basis: 'real' }, discountRate: 0, analysisYears: 2, decision: 'Test only.' },
    alternatives: [
      { id: 'baseline', label: 'Baseline', cashFlows: [], outcomeMeasures: [] },
      { id: 'option', label: 'Option', cashFlows: [
        { id: 'op-cost', perspective: 'operator-financial', year: 0, direction: 'cost', amountAud: 100, category: 'cost', sourceId: 'S1', limitation: 'Test.' },
        { id: 'op-income', perspective: 'operator-financial', year: 1, direction: 'benefit', amountAud: 130, category: 'income', sourceId: 'S2', limitation: 'Test.' },
        { id: 'grant', perspective: 'government-fiscal', year: 0, direction: 'cost', amountAud: 50, category: 'grant', sourceId: 'S3', limitation: 'Test.' },
        { id: 'resource-cost', perspective: 'social-economic', year: 0, direction: 'cost', amountAud: null, category: 'resource', sourceId: 'S4', limitation: 'Unknown.' }
      ], outcomeMeasures: [{ id: 'nights', label: 'Nights', unit: 'nights', series: [{ time: 0, value: 2 }, { time: 1, value: 4 }], sourceId: 'S5', limitation: 'Test.' }] }
    ],
    sensitivityCases: [{ id: 'lower-income', label: 'Lower income', overrides: [{ alternativeId: 'option', flowId: 'op-income', amountAud: 110 }] }]
  });
  const option = result.base.find(item => item.id === 'option');
  assert.equal(option.ledgers['operator-financial'].netPresentValueAud, 30);
  assert.equal(option.ledgers['government-fiscal'].netPresentValueAud, -50);
  assert.equal(option.ledgers['social-economic'].status, 'incomplete');
  assert.equal(option.ledgers['social-economic'].netPresentValueAud, null);
  assert.equal(result.sensitivity[0].alternatives.find(item => item.id === 'option').ledgers['operator-financial'].netPresentValueAud, 10);
  assert.equal(result.recommendation.status, 'not-generated');
});
