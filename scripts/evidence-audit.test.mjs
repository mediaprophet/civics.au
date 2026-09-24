import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildEvidenceGraph, openEvidenceStore, select, auditStore } from './evidence-audit.mjs';

test('bundled WASM queries every real register row and preserves critical gaps', async () => {
  const data = JSON.parse(await readFile(new URL('../assets/model-data.json', import.meta.url), 'utf8'));
  const { turtle, records } = buildEvidenceGraph(data, 'test-hash');
  const store = await openEvidenceStore(turtle);
  try {
    const audit = auditStore(store);
    for (const type of ['ResearchRecord', 'QualificationRecord']) {
      assert.equal(Number(audit.registerCounts.find(row => row.type.endsWith(type)).count), records.filter(row => row.type === type).length);
    }
    assert.deepEqual(audit.criticalResearchGaps.map(row => row.id).sort(), records.filter(row => row.type === 'ResearchRecord' && row.reportedStatus === 'Open — critical').map(row => row.id).sort());
    const refs = select(store, 'SELECT ?id ?reference WHERE { ?record c:id ?id ; c:cites ?source . ?source c:reference ?reference }');
    assert.equal(refs.length, records.filter(row => row.sourceReference !== undefined).length);
    for (const row of refs) assert.equal(row.reference, String(records.find(record => record.id === row.id).sourceReference));
  } finally { store.free(); }
});

test('untrusted text round-trips without becoming RDF and missing evidence stays missing', async () => {
  const claim = 'A "claim"\nwith \\ slashes, café and </script> . <urn:evil> <urn:p> <urn:o> .';
  const data = { version: 'fixture', sheets: {
    'Research Inputs': { A6: 'R01', B6: claim, C6: 0, G6: 46246, H6: 'Open — critical' },
    'Qualification Register': { A6: 'Q01', C6: 'Unsupported benefit', D6: 'Rejected' },
  } };
  const { turtle } = buildEvidenceGraph(data, 'fixture-hash');
  const store = await openEvidenceStore(turtle);
  try {
    const rows = select(store, 'SELECT ?claim ?value ?asOf WHERE { c:R01 c:claim ?claim ; c:reportedValue ?value ; c:reportedAsOf ?asOf }');
    assert.deepEqual(rows, [{ claim, value: '0', asOf: '46246' }]);
    assert.deepEqual(auditStore(store).missingSourceReferences.map(row => row.id), ['R01']);
    assert.equal(JSON.parse(store.query('ASK { <urn:evil> <urn:p> <urn:o> }')).boolean, false);
    assert.equal(JSON.parse(store.query('ASK { <urn:civics:evidence:Q01> <urn:civics:evidence:reportedStatus> "Rejected" }')).boolean, true);
  } finally { store.free(); }
});

test('missing registers and duplicate identifiers fail explicitly', () => {
  assert.throws(() => buildEvidenceGraph({ sheets: {} }, 'hash'), /Missing register/);
  assert.throws(() => buildEvidenceGraph({ sheets: { 'Research Inputs': { A6: 'R01', A7: 'R01' } } }, 'hash'), /Duplicate register ID/);
});
