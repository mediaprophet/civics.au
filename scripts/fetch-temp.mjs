// Build assets/temp-grid.json: monthly mean daily MINIMUM temperature (°C)
// averaged from Bureau of Meteorology AWAP daily minave grids for a calendar year.
// Source: https://www.bom.gov.au/climate/austmaps/metadata-daily-temperature.shtml
// Usage: node scripts/fetch-temp.mjs [year] [cacheDir]
// Re-run with a different year to refresh the climatology; cached .grid files are reused.
// Note: BOM requires a browser User-Agent on the temperature endpoints.
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const YEAR = Number(process.argv[2]) || 2024;
const CACHE = process.argv[3] || join(fileURLToPath(import.meta.url), '..', '.temp-cache');
const OUT = join(fileURLToPath(import.meta.url), '..', '..', 'assets', 'temp-grid.json');
const CELL = 0.05, DS = 10; // aggregate 10×10 source cells → 0.5° output
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
mkdirSync(CACHE, { recursive: true });

const dates = [];
for (let m = 1; m <= 12; m++) {
  const nd = new Date(Date.UTC(YEAR, m, 0)).getUTCDate();
  for (let d = 1; d <= nd; d++) dates.push(`${m}_${d}`);
}

const url = (m, d) => {
  const s = `${YEAR}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
  return `https://www.bom.gov.au/web03/ncc/www/awap/temperature/minave/daily/grid/0.05/history/nat/${s}${s}.grid.Z`;
};

let meta = null, sum, cnt;
for (const [m, d] of dates.map(s => s.split('_').map(Number))) {
  const f = join(CACHE, `${YEAR}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}.grid`);
  if (!existsSync(f)) {
    let res = null;
    for (let a = 0; a < 4 && !res; a++) {
      try { res = await fetch(url(m, d), { headers: { 'User-Agent': UA } }); }
      catch (e) { if (a === 3) console.warn(`skip ${m}-${d}: ${e.message}`); else await new Promise(r => setTimeout(r, 2000 * (a + 1))); }
    }
    if (!res) continue;
    if (!res.ok) { console.warn(`skip ${m}-${d}: HTTP ${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    const txt = execFileSync('gzip', ['-dc'], { input: buf, maxBuffer: 64 * 1024 * 1024 }).toString();
    writeFileSync(f, txt);
  }
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  if (!meta) {
    meta = {};
    for (const l of lines.slice(0, 6)) { const [k, v] = l.trim().split(/\s+/); meta[k.toLowerCase()] = Number(v); }
    sum = Array.from({ length: 12 }, () => new Float64Array(meta.ncols * meta.nrows));
    cnt = Array.from({ length: 12 }, () => new Uint16Array(meta.ncols * meta.nrows));
  }
  const vals = lines.slice(6).join(' ').trim().split(/\s+/).map(Number);
  const mo = m - 1;
  for (let i = 0; i < vals.length; i++) {
    if (vals[i] < 9999) { sum[mo][i] += vals[i]; cnt[mo][i]++; }
  }
}
if (!meta) { console.error('no grids loaded'); process.exit(1); }

const ncols = Math.ceil(meta.ncols / DS), nrows = Math.ceil(meta.nrows / DS);
const cell = CELL * DS;
const xll = meta.xllcenter - CELL / 2;                    // left edge of first aggregated column
const latTop = meta.yllcenter + (meta.nrows - 0.5) * CELL + CELL / 2; // top edge
const months = [];
for (let mo = 0; mo < 12; mo++) {
  const out = new Array(ncols * nrows);
  for (let j = 0; j < nrows; j++) for (let i = 0; i < ncols; i++) {
    let s = 0, n = 0;
    for (let dj = 0; dj < DS; dj++) for (let di = 0; di < DS; di++) {
      const sj = j * DS + dj, si = i * DS + di;
      if (sj >= meta.nrows || si >= meta.ncols) continue;
      const idx = sj * meta.ncols + si;
      if (cnt[mo][idx] > 0) { s += sum[mo][idx] / cnt[mo][idx]; n++; }
    }
    out[j * ncols + i] = n ? Math.round(s / n * 10) / 10 : -1;
  }
  months.push(out);
}

writeFileSync(OUT, JSON.stringify({
  src: `BOM AWAP daily minimum temperature grids, averaged over ${YEAR}; °C`,
  cell, ncols, nrows, xll, latTop, months
}));
console.log(`wrote ${OUT}: ${ncols}×${nrows} cells × 12 months (${Math.round(JSON.stringify(months).length / 1024)}KB)`);
