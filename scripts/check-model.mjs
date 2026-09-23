// check-model.mjs — recompute every formula cell with model-engine.js and
// compare against the values Excel cached in the workbook.
// Usage: node scripts/check-model.mjs [--verbose]
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Workbook } from '../assets/model-engine.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'assets', 'model-data.json'), 'utf8'));
const wb = new Workbook(data);
const verbose = process.argv.includes('--verbose');

let checked = 0, mismatched = 0, errored = 0;
const mismatches = [];

const close = (a, b) => {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') {
    const tol = Math.max(1e-9, Math.abs(b) * 1e-9);
    return Math.abs(a - b) <= tol;
  }
  if (typeof a === 'string' && typeof b === 'string') return a === b;
  if (a === null && (b === 0 || b === '' || b === null)) return true;
  if (b === null && (a === 0 || a === '')) return true;
  return false;
};

for (const [sheet, cells] of Object.entries(data.sheets)) {
  for (const [addr, cell] of Object.entries(cells)) {
    if (cell === null || typeof cell !== 'object' || !('f' in cell)) continue;
    checked++;
    const got = wb.get(sheet, addr);
    const want = cell.v;
    const isE = got && typeof got === 'object' && 'err' in got;
    if (isE) {
      // Excel cached an error string like '#DIV/0!' as a string value
      if (typeof want === 'string' && want.startsWith('#')) { continue; }
      errored++;
      mismatches.push(`${sheet}!${addr}: got ${got.err}, want ${JSON.stringify(want)} :: =${cell.f.slice(0, 110)}`);
    } else if (!close(got, want)) {
      mismatched++;
      mismatches.push(`${sheet}!${addr}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)} :: =${cell.f.slice(0, 110)}`);
    }
  }
}

console.log(`Checked ${checked} formula cells across ${Object.keys(data.sheets).length} sheets.`);
console.log(`Matches: ${checked - mismatched - errored} | Value mismatches: ${mismatched} | Errors: ${errored}`);
const show = verbose ? mismatches.length : Math.min(40, mismatches.length);
for (const m of mismatches.slice(0, show)) console.log('  ' + m);
if (mismatches.length > show) console.log(`  …and ${mismatches.length - show} more (run with --verbose)`);
process.exit(mismatched + errored === 0 ? 0 : 1);
