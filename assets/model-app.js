// model-app.js — interactive modelling environment for the community
// financial model. Loads the extracted model (assets/model-data.json),
// evaluates it in-browser via model-engine.js, persists named models to
// web storage, and exports print-ready reports. Optionally uses the qualiaDB
// WASM build (assets/qualia/) for BLAKE3 content hashes and storage estimates.
import { Workbook } from './model-engine.js';

const MODELS_KEY = 'civics.models.v1';
const SCENARIOS = ['Downside', 'Base', 'Upside'];
const SCENARIO_COL = { Downside: 'C', Base: 'D', Upside: 'E' };
const YEARS = [2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036];

// Quick-scope drivers: [Assumptions row, short label]
const SCOPE_DRIVERS = [
  [56, 'Regional population'],
  [13, 'New home-pathway participants (FY2027)'],
  [14, 'Participant growth (% p.a.)'],
  [42, 'New cooperative projects (FY2027)'],
  [43, 'Project growth (% p.a.)'],
  [178, 'Founding cooperative members'],
  [131, 'Site / service fee (AUD/bay/month)'],
  [92, 'Individual storage price (AUD/50GB/mo)'],
  [9, 'Sponsor / catalytic capital (AUD)'],
  [10, 'Capital grant (AUD)'],
];

const HEADLINE = [
  ['A14', 'Financial NPV', 'aud'],
  ['B14', 'Social NPV', 'aud'],
  ['C14', 'Integrated NPV', 'aud'],
  ['D14', 'Quantified benefit coverage', 'pct'],
  ['E14', 'FY2036 unrestricted cash', 'aud'],
  ['F14', 'External funding need', 'aud'],
];

const FORECAST_ROWS = [
  [9, 'Total cash receipts'], [13, 'Total operating cash costs'], [14, 'Net operating cash flow'],
  [18, 'Total investing cash flow'], [19, 'Unlevered project cash flow'], [27, 'Net financing cash flow'],
  [28, 'Net cash movement'], [30, 'Ending cash'], [42, 'Unrestricted ending cash'],
  [35, 'Contributor gross payments'], [36, 'Contributor net payments'], [38, 'Adjusted public / economic outcomes'],
];

// ---------- helpers ----------
const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function fmtAUD(v) {
  if (v === null || v === undefined || typeof v !== 'number') return '—';
  const sign = v < 0 ? '−' : '';
  const a = Math.abs(v);
  if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${sign}$${(a / 1e3).toFixed(1)}k`;
  return `${sign}$${a.toFixed(0)}`;
}
function fmtPct(v) { return typeof v === 'number' ? `${(v * 100).toFixed(1)}%` : '—'; }
function fmtVal(v, kind) {
  if (v && typeof v === 'object' && 'err' in v) return v.err;
  if (kind === 'aud') return fmtAUD(v);
  if (kind === 'pct') return fmtPct(v);
  return typeof v === 'number' ? (Math.abs(v) < 100 ? v.toFixed(3) : fmtAUD(v)) : String(v ?? '—');
}
function isPctRow(units) { return typeof units === 'string' && units.trimStart().startsWith('%'); }
function groupNum(n) { return (+n.toPrecision(10)).toLocaleString('en-AU', { maximumSignificantDigits: 12 }); }
function displayVal(raw, units) {
  if (typeof raw !== 'number') return raw ?? '';
  return groupNum(isPctRow(units) ? raw * 100 : raw);
}
function parseInput(str, units) {
  const n = parseFloat(String(str).replace(/[,_$\s]/g, ''));
  if (!Number.isFinite(n)) return null;
  return isPctRow(units) ? n / 100 : n;
}

// ---------- state ----------
let wb = null, data = null;
let overrides = {};           // "Assumptions!C13" -> number|string
let currentScenario = 'Base';
let modelName = 'Untitled model';
let scopeLabel = '';
let qualia = null;            // lazily-initialised WASM module
let lastHash = '';
let lastSolar = null, lastWater = null; // latest computed calculator results

// ---------- qualiaDB WASM (optional) ----------
async function initQualia() {
  if (qualia !== null) return qualia;
  try {
    const mod = await import('./qualia/qualia_core_db.js');
    await mod.default('assets/qualia/qualia_core_db_bg.wasm');
    qualia = mod;
  } catch (e) {
    console.warn('qualiaDB WASM unavailable, using webcrypto fallback', e);
    qualia = false;
  }
  return qualia;
}
async function contentHash(text) {
  const q = await initQualia();
  if (q) { try { return `blake3:${q.crypto_blake3({ text }).hex}`; } catch {} }
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return 'sha256:' + [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function storageNote() {
  const q = await initQualia();
  if (q) {
    try {
      const est = await q.estimate_browser_storage();
      if (est && est.quota) return `web storage: ${(est.usage / 1024).toFixed(0)} KiB used of ~${(est.quota / 1048576).toFixed(0)} MiB (qualiaDB WASM v${q.get_engine_version()})`;
    } catch {}
  }
  try {
    const est = await navigator.storage.estimate();
    if (est && est.quota) return `web storage: ${(est.usage / 1024).toFixed(0)} KiB used of ~${(est.quota / 1048576).toFixed(0)} MiB`;
  } catch {}
  return 'web storage: localStorage';
}

// ---------- persistence ----------
function savedIndex() {
  try { return JSON.parse(localStorage.getItem(MODELS_KEY) || '{}'); } catch { return {}; }
}
function persistIndex(idx) { localStorage.setItem(MODELS_KEY, JSON.stringify(idx)); }
function snapshot() {
  return { name: modelName, scope: scopeLabel, scenario: currentScenario, overrides, savedAt: new Date().toISOString(), hash: lastHash, modelVersion: data.version };
}
async function saveModel() {
  modelName = $('#model-name').value.trim() || 'Untitled model';
  const s = snapshot();
  s.hash = await contentHash(JSON.stringify({ scenario: s.scenario, overrides: s.overrides, scope: s.scope }));
  lastHash = s.hash;
  const idx = savedIndex();
  idx[modelName] = s;
  persistIndex(idx);
  refreshModelList();
  updateStatus(`Saved "${modelName}" · ${s.hash.slice(0, 22)}…`);
}
function applyOverridesToEngine() {
  wb.clearOverrides();
  for (const [k, v] of Object.entries(overrides)) {
    const [sheet, addr] = k.split('!');
    wb.setOverride(sheet, addr, v);
  }
}
function loadModel(name) {
  const s = savedIndex()[name];
  if (!s) return;
  overrides = { ...s.overrides };
  applyOverridesToEngine();
  currentScenario = SCENARIOS.includes(s.scenario) ? s.scenario : 'Base';
  modelName = s.name; scopeLabel = s.scope || ''; lastHash = s.hash || '';
  $('#model-name').value = modelName;
  $('#scope-label').value = scopeLabel;
  applyScenario();
  rebuildAssumptionInputs();
  syncScopeInputs();
  renderAll();
  updateStatus(`Loaded "${name}"`);
}
function exportJSON() {
  const s = snapshot();
  const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(modelName || 'model').replace(/[^\w-]+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function importJSON(file) {
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const s = JSON.parse(rd.result);
      if (!s || typeof s !== 'object' || !s.overrides) throw new Error('not a model file');
      overrides = { ...s.overrides };
      applyOverridesToEngine();
      currentScenario = SCENARIOS.includes(s.scenario) ? s.scenario : 'Base';
      modelName = s.name || 'Imported model'; scopeLabel = s.scope || ''; lastHash = s.hash || '';
      $('#model-name').value = modelName;
      $('#scope-label').value = scopeLabel;
      applyScenario(); rebuildAssumptionInputs(); syncScopeInputs(); renderAll();
      updateStatus(`Imported "${modelName}"`);
    } catch (e) { updateStatus(`Import failed: ${e.message}`); }
  };
  rd.readAsText(file);
}

// ---------- engine ----------
function ovKey(sheet, addr) { return `${sheet}!${addr}`; }
function applyScenario() {
  wb.setOverride('Cover', 'B8', currentScenario);
  document.querySelectorAll('[data-scenario]').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.scenario === currentScenario ? 'true' : 'false');
  });
}
function setAssumption(row, col, raw) {
  const addr = `${col}${row}`;
  if (raw === null) { delete overrides[ovKey('Assumptions', addr)]; wb.clearOverride('Assumptions', addr); }
  else { overrides[ovKey('Assumptions', addr)] = raw; wb.setOverride('Assumptions', addr, raw); }
}
function assumptionCell(row, col) {
  const k = ovKey('Assumptions', `${col}${row}`);
  if (k in overrides) return overrides[k];
  const c = data.sheets['Assumptions'][`${col}${row}`];
  return c && typeof c === 'object' ? c.v : c;
}

// ---------- rendering ----------
function renderKPIs() {
  $('#kpi-strip').innerHTML = HEADLINE.map(([addr, label, kind]) => {
    const v = wb.get('Cover', addr);
    return `<div class="kpi"><span class="kpi-label">${esc(label)}</span><strong class="kpi-value">${esc(fmtVal(v, kind))}</strong></div>`;
  }).join('');
  const status = wb.get('Cover', 'B10');
  $('#model-status').textContent = typeof status === 'string' ? status : '';
}

function renderScorecard() {
  const rows = [];
  for (let r = 21; r <= 26; r++) {
    const dim = wb.get('Valuation & SROI', `A${r}`);
    const ind = wb.get('Valuation & SROI', `B${r}`);
    const act = wb.get('Valuation & SROI', `C${r}`);
    const thr = wb.get('Valuation & SROI', `D${r}`);
    const st = wb.get('Valuation & SROI', `E${r}`);
    const note = wb.get('Valuation & SROI', `F${r}`);
    if (!dim) continue;
    const cls = String(st).startsWith('PASS') || String(st) === 'OK' ? 'pass' : String(st).startsWith('FAIL') || String(st) === 'GAP' ? 'fail' : 'warn';
    rows.push(`<tr><td>${esc(dim)}</td><td>${esc(ind)}</td><td>${esc(typeof act === 'number' ? fmtVal(act, Math.abs(act) > 1e4 ? 'aud' : 'raw') : act)}</td><td>${esc(fmtVal(thr, 'raw'))}</td><td><span class="badge ${cls}">${esc(st)}</span></td><td class="small">${esc(note)}</td></tr>`);
  }
  $('#scorecard tbody').innerHTML = rows.join('');
}

function renderForecast() {
  const head = `<tr><th>Metric</th>${YEARS.map(y => `<th>FY${y}</th>`).join('')}</tr>`;
  const body = FORECAST_ROWS.map(([r, label]) => {
    const cells = YEARS.map((y, i) => {
      const col = String.fromCharCode(67 + i); // C..L
      const v = wb.get('Consolidated Forecast', `${col}${r}`);
      return `<td>${esc(typeof v === 'number' ? fmtAUD(v) : (v ?? '—'))}</td>`;
    }).join('');
    return `<tr><td>${esc(label)}</td>${cells}</tr>`;
  }).join('');
  $('#forecast-table thead').innerHTML = head;
  $('#forecast-table tbody').innerHTML = body;
  drawCashChart();
}

function drawCashChart() {
  const cv = $('#cash-chart');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = cv.clientWidth || 720, H = 260;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);
  const series = [
    { row: 42, color: '#183e37', label: 'Unrestricted cash' },
    { row: 19, color: '#b6472b', label: 'Unlevered cash flow' },
  ].map(s => ({
    ...s,
    vals: YEARS.map((y, i) => {
      const v = wb.get('Consolidated Forecast', `${String.fromCharCode(67 + i)}${s.row}`);
      return typeof v === 'number' ? v : 0;
    })
  }));
  const all = series.flatMap(s => s.vals);
  let lo = Math.min(0, ...all), hi = Math.max(1, ...all);
  const padL = 64, padR = 12, padT = 18, padB = 28;
  const x = i => padL + i * (W - padL - padR) / (YEARS.length - 1);
  const y = v => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#667'; ctx.strokeStyle = '#d8d2c8';
  for (let g = 0; g <= 4; g++) {
    const gv = lo + (hi - lo) * g / 4;
    ctx.beginPath(); ctx.moveTo(padL, y(gv)); ctx.lineTo(W - padR, y(gv)); ctx.stroke();
    ctx.fillText(fmtAUD(gv), 4, y(gv) + 4);
  }
  YEARS.forEach((yr, i) => ctx.fillText(String(yr), x(i) - 12, H - 8));
  for (const s of series) {
    ctx.beginPath(); ctx.strokeStyle = s.color; ctx.lineWidth = 2;
    s.vals.forEach((v, i) => i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)));
    ctx.stroke();
  }
  ctx.font = '12px system-ui, sans-serif';
  series.forEach((s, i) => {
    ctx.fillStyle = s.color;
    ctx.fillRect(padL + i * 190, 4, 10, 10);
    ctx.fillStyle = '#333';
    ctx.fillText(s.label, padL + 14 + i * 190, 13);
  });
}

function renderChecks() {
  let ok = 0, total = 0; const bad = [];
  const cells = data.sheets['Checks'];
  for (let r = 6; r <= 91; r++) {
    const name = wb.get('Checks', `A${r}`);
    const st = wb.get('Checks', `F${r}`);
    if (typeof name !== 'string' || !name.trim()) continue;
    total++;
    if (st === 'OK') ok++;
    else bad.push({ name, st, note: wb.get('Checks', `G${r}`) });
  }
  $('#checks-summary').innerHTML = `<span class="badge ${bad.length ? 'fail' : 'pass'}">${ok}/${total} checks OK</span>`;
  $('#checks-list').innerHTML = bad.length
    ? `<ul>${bad.map(b => `<li><strong>${esc(b.name)}</strong> — ${esc(b.st)} <span class="small">${esc(b.note ?? '')}</span></li>`).join('')}</ul>`
    : '<p class="small">All calculation-integrity checks pass for the current inputs.</p>';
}

// Assumptions editor — grouped by category (col A), one row per driver (col B),
// three editable scenario inputs (C/D/E) + active value read-out (F).
function buildAssumptionGroups() {
  const cells = data.sheets['Assumptions'];
  const groups = new Map();
  for (let r = 6; r <= 242; r++) {
    const cat = cells[`A${r}`], driver = cells[`B${r}`], units = cells[`G${r}`];
    const cv = x => (x && typeof x === 'object' ? x.v : x);
    const catV = cv(cat), drvV = cv(driver), unitV = cv(units);
    if (!drvV || typeof drvV !== 'string') continue;
    if (!groups.has(catV)) groups.set(catV, []);
    groups.get(catV).push({ row: r, driver: drvV, units: unitV || '' });
  }
  const wrap = $('#assumption-groups');
  wrap.innerHTML = [...groups.entries()].map(([cat, rows]) => `
    <details class="assump-group" data-cat="${esc(cat)}">
      <summary>${esc(cat)} <span class="small">(${rows.length})</span></summary>
      <table class="assump-table">
        <thead><tr><th>Driver</th><th>Downside</th><th>Base</th><th>Upside</th><th>Units / note</th></tr></thead>
        <tbody>${rows.map(({ row, driver, units }) => `
          <tr data-row="${row}" data-name="${esc(driver.toLowerCase())}">
            <td>${esc(driver)}</td>
            ${['C', 'D', 'E'].map(col => `<td><input class="assump-in" data-row="${row}" data-col="${col}" inputmode="decimal" aria-label="${esc(driver)} — ${col === 'C' ? 'Downside' : col === 'D' ? 'Base' : 'Upside'}"></td>`).join('')}
            <td class="small">${esc(units)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </details>`).join('');
  wrap.addEventListener('change', e => {
    const inp = e.target.closest('.assump-in');
    if (!inp) return;
    const row = +inp.dataset.row, col = inp.dataset.col;
    const units = data.sheets['Assumptions'][`G${row}`];
    const uv = units && typeof units === 'object' ? units.v : units;
    const parsed = parseInput(inp.value, uv);
    setAssumption(row, col, parsed);
    markModified(inp, parsed === null);
    renderAll();
    refreshPrintReport();
  });
}
function rebuildAssumptionInputs() {
  document.querySelectorAll('.assump-in').forEach(inp => {
    const raw = assumptionCell(+inp.dataset.row, inp.dataset.col);
    const units = data.sheets['Assumptions'][`G${inp.dataset.row}`];
    const uv = units && typeof units === 'object' ? units.v : units;
    inp.value = typeof raw === 'number' ? displayVal(raw, uv) : (raw ?? '');
    markModified(inp, !(ovKey('Assumptions', `${inp.dataset.col}${inp.dataset.row}`) in overrides));
  });
}
function markModified(inp, isDefault) {
  inp.classList.toggle('modified', !isDefault);
}

// quick-scope panel
function buildScopePanel() {
  $('#scope-drivers').innerHTML = SCOPE_DRIVERS.map(([row, label]) => {
    const cells = data.sheets['Assumptions'];
    const units = cells[`G${row}`];
    const uv = units && typeof units === 'object' ? units.v : units;
    return `<div class="scope-field"><label for="scope-${row}">${esc(label)}</label><input id="scope-${row}" data-scope-row="${row}" inputmode="decimal"><span class="small">${esc(uv ?? '')}</span></div>`;
  }).join('');
  $('#scope-drivers').addEventListener('change', e => {
    const inp = e.target.closest('[data-scope-row]');
    if (!inp) return;
    const row = +inp.dataset.scopeRow;
    const uv = (c => c && typeof c === 'object' ? c.v : c)(data.sheets['Assumptions'][`G${row}`]);
    const parsed = parseInput(inp.value, uv);
    setAssumption(row, SCENARIO_COL[currentScenario], parsed);
    renderAll(); refreshPrintReport(); syncAssumptionInputs(row);
  });
  syncScopeInputs();
}
function syncScopeInputs() {
  const col = SCENARIO_COL[currentScenario];
  document.querySelectorAll('[data-scope-row]').forEach(inp => {
    const raw = assumptionCell(+inp.dataset.scopeRow, col);
    const uv = (c => c && typeof c === 'object' ? c.v : c)(data.sheets['Assumptions'][`G${inp.dataset.scopeRow}`]);
    inp.value = typeof raw === 'number' ? displayVal(raw, uv) : (raw ?? '');
  });
}
function syncAssumptionInputs(row) {
  document.querySelectorAll(`.assump-in[data-row="${row}"]`).forEach(inp => {
    const raw = assumptionCell(row, inp.dataset.col);
    const uv = (c => c && typeof c === 'object' ? c.v : c)(data.sheets['Assumptions'][`G${row}`]);
    inp.value = typeof raw === 'number' ? displayVal(raw, uv) : (raw ?? '');
    markModified(inp, !(ovKey('Assumptions', `${inp.dataset.col}${row}`) in overrides));
  });
}

function changedAssumptions() {
  const out = [];
  for (const k of Object.keys(overrides)) {
    if (k === 'Cover!B8') continue;
    const [sheet, addr] = k.split('!');
    const row = +addr.match(/\d+/)[0];
    const driver = (c => c && typeof c === 'object' ? c.v : c)(data.sheets[sheet]?.[`B${row}`]);
    const col = addr.match(/^[A-Z]+/)[0];
    const scen = { C: 'Downside', D: 'Base', E: 'Upside' }[col] || col;
    out.push({ driver: driver || `${sheet} ${addr}`, scen, value: overrides[k] });
  }
  return out;
}

// ---------- print / PDF report ----------
function financialPrintSection() {
  const changed = changedAssumptions();
  const kpiRows = HEADLINE.map(([a, l, k]) => `<tr><td>${esc(l)}</td><td>${esc(fmtVal(wb.get('Cover', a), k))}</td></tr>`).join('');
  const scoreRows = [];
  for (let r = 21; r <= 26; r++) {
    const d = wb.get('Valuation & SROI', `A${r}`), st = wb.get('Valuation & SROI', `E${r}`), n = wb.get('Valuation & SROI', `F${r}`);
    if (d) scoreRows.push(`<tr><td>${esc(d)}</td><td>${esc(st)}</td><td>${esc(n ?? '')}</td></tr>`);
  }
  const fcHead = `<tr><th>Metric</th>${YEARS.map(y => `<th>${y}</th>`).join('')}</tr>`;
  const fcBody = FORECAST_ROWS.slice(0, 9).map(([r, label]) =>
    `<tr><td>${esc(label)}</td>${YEARS.map((y, i) => `<td>${esc(fmtAUD(wb.get('Consolidated Forecast', `${String.fromCharCode(67 + i)}${r}`)))}</td>`).join('')}</tr>`).join('');
  return `
    <h2>Financial model — current state (${esc(currentScenario)})</h2>
    <table>${kpiRows}</table>
    <h3>Decision scorecard</h3><table><thead><tr><th>Dimension</th><th>Status</th><th>Interpretation</th></tr></thead><tbody>${scoreRows.join('')}</tbody></table>
    <h3>10-year forecast (AUD, nominal)</h3><table>${fcHead}${fcBody}</table>
    <h3>Modified assumptions (${changed.length})</h3>
    ${changed.length ? `<table><thead><tr><th>Driver</th><th>Scenario column</th><th>Value</th></tr></thead><tbody>${changed.map(c => `<tr><td>${esc(c.driver)}</td><td>${esc(c.scen)}</td><td>${esc(typeof c.value === 'number' ? groupNum(c.value) : c.value)}</td></tr>`).join('')}</tbody></table>` : '<p>No assumptions modified from the baseline.</p>'}`;
}

function reportEntryHtml(it) {
  let h = `<h2>${esc(it.name)}</h2><p class="small">${esc(it.type)} · ${new Date(it.ts).toLocaleString('en-AU')}${it.hash ? ` · ${esc(it.hash)}` : ''}</p>`;
  if (it.inputs) h += `<h3>Inputs</h3>${kvTable(it.inputs, 'Input')}`;
  if (it.results) h += `<h3>Results</h3>${kvTable(it.results, 'Result')}`;
  if (it.scorecard) h += `<h3>Decision scorecard</h3>${kvTable(it.scorecard, 'Dimension')}`;
  if (it.forecast) {
    h += `<h3>10-year forecast (AUD)</h3><table><thead><tr><th>Metric</th>${YEARS.map(y => `<th>${y}</th>`).join('')}</tr></thead><tbody>` +
      Object.entries(it.forecast).map(([k, vals]) => `<tr><td>${esc(k)}</td>${vals.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('') + '</tbody></table>';
  }
  return h;
}

function refreshPrintReport() {
  const el = $('#print-report');
  if (!el || !wb) return;
  const items = reportItems();
  const disclaimer = ((c => c && typeof c === 'object' ? c.v : c)(data.sheets['Cover']['A4'])) || 'Evaluation draft — independent review required.';
  el.innerHTML = `
    <h1>${esc(modelName)} — modelling report</h1>
    <p class="small">Scope: ${esc(scopeLabel || 'not specified')} · Generated ${new Date().toLocaleString('en-AU')} · civics.au modelling lab · ${items.length} accumulated ${items.length === 1 ? 'entry' : 'entries'}</p>
    ${items.length ? items.map(reportEntryHtml).join('<hr>') : '<p>No modelling runs were added to the report. The current financial model state is shown below.</p>'}
    <hr>
    ${financialPrintSection()}
    <p class="small">${esc(String(disclaimer).slice(0, 500))}</p>
    <p class="small">Preliminary evaluation draft — generative-AI assisted; independent legal, technical, financial and editorial review required. Evaluation scaffold only — not an offer, budget approval or procurement instrument.</p>`;
}

// ---------- additional model modules (solar, water) ----------
const numIn = id => {
  const el = document.getElementById(id);
  const n = el ? parseFloat(String(el.value).replace(/[,_$\s]/g, '')) : NaN;
  return Number.isFinite(n) ? n : 0;
};
const chk = id => { const el = document.getElementById(id); return !!(el && el.checked); };
const r1 = v => Math.round(v * 10) / 10;
const SOLAR_LIMITS = [
  ['s-array', 'Solar array capacity', 0, Infinity],
  ['s-psh-summer', 'Summer peak sun hours', 0, 24],
  ['s-psh-winter', 'Winter peak sun hours', 0, 24],
  ['s-derate', 'System derate', 0, 100],
  ['s-batt', 'Battery usable capacity', 0, Infinity],
  ['s-rte', 'Round-trip efficiency', 0.000001, 100],
  ['s-maxdis', 'Maximum discharge power', 0, Infinity],
  ['s-day', 'Daytime load', 0, Infinity],
  ['s-eve', 'Evening load', 0, Infinity],
  ['s-night', 'Overnight load', 0, Infinity],
];

function solarInputErrors() {
  const errors = [];
  for (const [id, label, min, max] of SOLAR_LIMITS) {
    const el = document.getElementById(id);
    const raw = el?.value.trim();
    const value = raw ? Number(raw) : NaN;
    const valid = Number.isFinite(value) && value >= min && value <= max;
    el?.setAttribute('aria-invalid', String(!valid));
    if (!valid) {
      const range = max === Infinity
        ? (min === 0.000001 ? 'be greater than 0' : `be at least ${min}`)
        : `be between ${min} and ${max}`;
      errors.push(`${label} must ${range}.`);
    }
  }
  return errors;
}

function solarCalc() {
  const kwp = numIn('s-array'), derate = numIn('s-derate') / 100;
  const cap = numIn('s-batt'), rte = numIn('s-rte') / 100, maxDis = numIn('s-maxdis');
  const day = numIn('s-day'), eve = numIn('s-eve'), night = numIn('s-night');
  const inputs = {
    'Array capacity (kWp)': kwp,
    'Peak sun hours — summer': numIn('s-psh-summer'),
    'Peak sun hours — winter': numIn('s-psh-winter'),
    'System derate (%)': numIn('s-derate'),
    'Battery usable capacity (kWh)': cap,
    'Round-trip efficiency (%)': numIn('s-rte'),
    'Max discharge power (kW)': maxDis,
    'Daytime load (kWh/day)': day,
    'Evening load (kWh/day)': eve,
    'Overnight load (kWh/day)': night,
  };
  const season = psh => {
    const gen = kwp * psh * derate;
    const direct = Math.min(day, gen);
    const surplus = Math.max(0, gen - direct);
    const unmetDay = Math.max(0, day - direct);
    const charged = Math.min(surplus, rte > 0 ? cap / rte : 0);
    const deliverable = charged * rte;
    const delivered = Math.min(deliverable, eve + night);
    const unmet = unmetDay + Math.max(0, eve + night - delivered);
    const exportable = Math.max(0, surplus - charged);
    const totalLoad = day + eve + night;
    const coverage = totalLoad > 0 ? (direct + delivered) / totalLoad : 0;
    return { gen, direct, charged, delivered, unmet, exportable, coverage };
  };
  const summer = season(numIn('s-psh-summer'));
  const winter = season(numIn('s-psh-winter'));
  // overnight autonomy check against max discharge power
  const nightHours = 10;
  const disLimited = maxDis > 0 && (eve + night) / nightHours > maxDis;
  return { inputs, summer, winter, disLimited, cap, rte };
}

function renderSolar() {
  const errors = solarInputErrors();
  const addButton = $('#solar-add-report');
  if (errors.length) {
    lastSolar = null;
    $('#solar-results tbody').innerHTML = ['Summer', 'Winter'].map(season => `<tr><td>${season}</td>${'<td>—</td>'.repeat(7)}</tr>`).join('');
    $('#solar-note').textContent = `Fix the highlighted input before using these results. ${errors[0]}`;
    addButton.disabled = true;
    return;
  }
  lastSolar = solarCalc();
  const rows = [['Summer', lastSolar.summer], ['Winter', lastSolar.winter]].map(([s, r]) =>
    `<tr><td>${s}</td><td>${r1(r.gen).toLocaleString('en-AU')}</td><td>${r1(r.direct)}</td><td>${r1(r.charged)}</td><td>${r1(r.delivered)}</td><td>${r1(r.unmet)}</td><td>${r1(r.exportable)}</td><td>${fmtPct(r.coverage)}</td></tr>`).join('');
  $('#solar-results tbody').innerHTML = rows;
  const notes = [];
  if (lastSolar.disLimited) notes.push('Evening/overnight average load exceeds max discharge power — battery may not cover peak evening demand even when charged.');
  notes.push('Figures are energy balances in kWh/day, not hour-by-hour dispatch. "To battery" is pre-efficiency charge energy; "From battery" is delivered after round-trip losses.');
  $('#solar-note').textContent = notes.join(' ');
  addButton.disabled = false;
}

const WATER_LIMITS = [
  ['w-flow', 'Pumping volume', 0, Infinity, () => chk('w-pump-on')],
  ['w-head', 'Total dynamic head', 0, Infinity, () => chk('w-pump-on')],
  ['w-eff', 'Pump and motor efficiency', 0.000001, 100, () => chk('w-pump-on')],
  ['w-ro-flow', 'RO plant output', 0, Infinity, () => chk('w-ro-on')],
  ['w-heat-litres', 'Hot water demand', 0, Infinity, () => chk('w-heat-on')],
  ['w-inlet', 'Inlet temperature', -50, 150, () => chk('w-heat-on')],
  ['w-outlet', 'Outlet temperature', -50, 150, () => chk('w-heat-on')],
  ['w-shw-cov', 'Solar hot-water share', 0, 100, () => chk('w-heat-on') && chk('w-shw')],
  ['w-sand-cap', 'Sand battery capacity', 0, Infinity, () => chk('w-heat-on') && chk('w-sand')],
  ['w-sand-eff', 'Sand battery round-trip efficiency', 0.000001, 100, () => chk('w-heat-on') && chk('w-sand')],
];

function waterInputErrors() {
  const errors = [];
  for (const [id, label, min, max, required] of WATER_LIMITS) {
    const el = document.getElementById(id);
    const raw = el?.value.trim();
    const value = raw ? Number(raw) : NaN;
    const active = required();
    const valid = !active || (Number.isFinite(value) && value >= min && value <= max);
    el?.setAttribute('aria-invalid', String(!valid));
    if (!valid) {
      const range = max === Infinity
        ? (min === 0.000001 ? 'be greater than 0' : `be at least ${min}`)
        : `be between ${min} and ${max}`;
      errors.push(`${label} must ${range}.`);
    }
  }
  return errors;
}

function waterCalc() {
  const rows = [];
  let totalElectric = 0, thermalDemand = 0, shwCov = 0, sandCov = 0, heatResid = 0;
  if (chk('w-pump-on')) {
    const kl = numIn('w-flow'), h = numIn('w-head'), eff = Math.max(1, numIn('w-eff')) / 100;
    const kwh = kl * 1000 * 9.81 * h / 3.6e6 / eff;
    totalElectric += kwh;
    rows.push(['Pumping', `${kl} kL/day · ${h} m head · ${Math.round(eff * 100)}% wire-to-water`, kwh, 'electric']);
  }
  if (chk('w-ro-on')) {
    const kl = numIn('w-ro-flow'), sec = parseFloat(document.getElementById('w-ro-source').value);
    const kwh = kl * sec;
    totalElectric += kwh;
    rows.push(['Reverse osmosis', `${kl} kL/day permeate · ${sec} kWh/kL SEC`, kwh, 'electric']);
  }
  if (chk('w-heat-on')) {
    const L = numIn('w-heat-litres'), dT = Math.max(0, numIn('w-outlet') - numIn('w-inlet'));
    thermalDemand = L * 4.186 * dT / 3600;
    let resid = thermalDemand;
    rows.push(['Water heating — thermal demand', `${L.toLocaleString('en-AU')} L/day · ΔT ${dT}°C`, thermalDemand, 'thermal']);
    if (chk('w-shw')) {
      shwCov = Math.min(resid, thermalDemand * numIn('w-shw-cov') / 100);
      resid -= shwCov;
      rows.push(['— met by solar hot-water collectors', `${numIn('w-shw-cov')}% direct solar thermal`, -shwCov, 'thermal']);
    }
    if (chk('w-sand')) {
      sandCov = Math.min(resid, numIn('w-sand-cap') * numIn('w-sand-eff') / 100);
      resid -= sandCov;
      rows.push(['— met by sand battery discharge', `${numIn('w-sand-cap')} kWh-th store · ${numIn('w-sand-eff')}% RTE`, -sandCov, 'thermal']);
    }
    heatResid = resid;
    totalElectric += resid;
    rows.push(['— residual electric heating', 'resistance element / heat pump backup', resid, 'electric']);
  }
  return { rows, totalElectric, thermalDemand, shwCov, sandCov, heatResid };
}

function renderWater() {
  const errors = waterInputErrors();
  const addButton = $('#water-add-report');
  if (errors.length) {
    lastWater = null;
    $('#water-results tbody').innerHTML = `<tr><td colspan="4">Fix the highlighted input before using these results.</td></tr>`;
    $('#water-note').textContent = errors[0];
    addButton.disabled = true;
    return;
  }
  lastWater = waterCalc();
  $('#water-results tbody').innerHTML = lastWater.rows.map(([name, basis, kwh, type]) =>
    `<tr><td>${esc(name)}</td><td class="small">${esc(basis)}</td><td>${r1(kwh)}</td><td class="small">${type}</td></tr>`).join('') +
    `<tr class="total-row"><td><strong>Total electric demand</strong></td><td></td><td><strong>${r1(lastWater.totalElectric)}</strong></td><td class="small">electric</td></tr>`;
  const notes = [];
  if (chk('w-sand')) notes.push(`Sand battery needs ~${r1(lastWater.sandCov / (numIn('w-sand-eff') / 100))} kWh/day of diverted solar surplus to recharge.`);
  if (chk('w-link') && lastSolar) {
    const avail = lastSolar.summer.exportable;
    const availW = lastSolar.winter.exportable;
    notes.push(`Versus solar model exportable surplus: summer ${r1(avail)} kWh/day (${fmtPct(Math.min(1, avail / Math.max(1e-9, lastWater.totalElectric)))} of demand), winter ${r1(availW)} kWh/day (${fmtPct(Math.min(1, availW / Math.max(1e-9, lastWater.totalElectric)))}).`);
  }
  $('#water-note').textContent = notes.join(' ');
  addButton.disabled = false;
}

// ---------- accumulated report ----------
const REPORT_KEY = 'civics.report.v1';
function reportItems() { try { return JSON.parse(localStorage.getItem(REPORT_KEY) || '[]'); } catch { return []; } }
function setReport(items) { localStorage.setItem(REPORT_KEY, JSON.stringify(items)); renderReportList(); }

function kpiSnapshot() {
  const o = {};
  for (const [addr, label, kind] of HEADLINE) o[label] = fmtVal(wb.get('Cover', addr), kind);
  o['Model status'] = wb.get('Cover', 'B10') || '';
  return o;
}
function scorecardSnapshot() {
  const o = {};
  for (let r = 21; r <= 26; r++) {
    const d = wb.get('Valuation & SROI', `A${r}`), st = wb.get('Valuation & SROI', `E${r}`);
    if (d) o[d] = st;
  }
  return o;
}
function forecastSnapshot() {
  const o = {};
  for (const [r, label] of FORECAST_ROWS) {
    o[label] = YEARS.map((y, i) => fmtAUD(wb.get('Consolidated Forecast', `${String.fromCharCode(67 + i)}${r}`)));
  }
  return o;
}

async function addToReport(type) {
  const ts = new Date().toISOString();
  let entry;
  if (type === 'financial') {
    entry = {
      type: 'Financial model', name: `${modelName} — ${currentScenario} scenario`, ts,
      inputs: { 'Model name': modelName, 'Scope': scopeLabel || '—', 'Scenario': currentScenario, 'Modified assumptions': changedAssumptions().length ? changedAssumptions().map(c => `${c.driver} (${c.scen}) = ${c.value}`).join('; ') : 'none — baseline' },
      results: kpiSnapshot(),
      scorecard: scorecardSnapshot(),
      forecast: forecastSnapshot(),
    };
  } else if (type === 'solar') {
    const c = lastSolar;
    if (!c) { updateStatus('Fix the solar and battery inputs before adding this run to the report.'); return; }
    entry = {
      type: 'Solar & battery', name: `Solar & battery — ${scopeLabel || 'site'}`, ts,
      inputs: c.inputs,
      results: {
        'Summer generation (kWh/day)': r1(c.summer.gen), 'Winter generation (kWh/day)': r1(c.winter.gen),
        'Summer exportable surplus (kWh/day)': r1(c.summer.exportable), 'Winter exportable surplus (kWh/day)': r1(c.winter.exportable),
        'Summer unmet load (kWh/day)': r1(c.summer.unmet), 'Winter unmet load (kWh/day)': r1(c.winter.unmet),
        'Summer load coverage': fmtPct(c.summer.coverage), 'Winter load coverage': fmtPct(c.winter.coverage),
      },
    };
  } else if (type === 'water') {
    const c = lastWater;
    if (!c) { updateStatus('Fix the water and thermal inputs before adding this run to the report.'); return; }
    const inputs = {};
    if (chk('w-pump-on')) Object.assign(inputs, { 'Pumping': `${numIn('w-flow')} kL/day · ${numIn('w-head')} m · ${numIn('w-eff')}% eff` });
    if (chk('w-ro-on')) Object.assign(inputs, { 'RO plant': `${numIn('w-ro-flow')} kL/day · ${document.getElementById('w-ro-source').selectedOptions[0].text}` });
    if (chk('w-heat-on')) Object.assign(inputs, { 'Heating': `${numIn('w-heat-litres')} L/day · ${numIn('w-inlet')}→${numIn('w-outlet')}°C`, 'Solar hot-water': chk('w-shw') ? `yes (${numIn('w-shw-cov')}%)` : 'no', 'Sand battery': chk('w-sand') ? `yes (${numIn('w-sand-cap')} kWh-th, ${numIn('w-sand-eff')}%)` : 'no' });
    const results = { 'Total electric demand (kWh/day)': r1(c.totalElectric) };
    if (c.thermalDemand) Object.assign(results, {
      'Thermal demand (kWh-th/day)': r1(c.thermalDemand),
      '— met by solar hot-water': r1(c.shwCov), '— met by sand battery': r1(c.sandCov), '— residual electric': r1(c.heatResid),
    });
    for (const [name, , kwh] of c.rows.filter(r => !r[0].startsWith('—') && !r[0].startsWith('Total'))) {
      results[`${name} (kWh/day)`] = r1(kwh);
    }
    entry = { type: 'Water & thermal', name: `Water & thermal — ${scopeLabel || 'site'}`, ts, inputs, results };
  }
  if (!entry) return;
  entry.hash = await contentHash(JSON.stringify(entry));
  const items = reportItems();
  items.push(entry);
  setReport(items);
  updateStatus(`Added "${entry.name}" to report (${items.length} ${items.length === 1 ? 'entry' : 'entries'}).`);
}

function renderReportList() {
  const items = reportItems();
  $('#report-count').textContent = items.length;
  const el = $('#report-list');
  if (!el) return;
  el.innerHTML = items.length ? items.map((it, i) => `
    <div class="report-entry">
      <div><strong>${esc(it.name)}</strong><span class="small">${esc(it.type)} · ${new Date(it.ts).toLocaleString('en-AU')} · ${esc((it.hash || '').slice(0, 30))}…</span></div>
      <button type="button" class="mbtn" data-report-remove="${i}">Remove</button>
    </div>`).join('') : '<p class="small">No entries yet — run a model tab and press "Add … to the report".</p>';
}

function kvTable(obj, colName) {
  return `<table><thead><tr><th>${colName}</th><th>Value</th></tr></thead><tbody>${Object.entries(obj).map(([k, v]) =>
    `<tr><td>${esc(k)}</td><td>${esc(Array.isArray(v) ? v.join(' · ') : v)}</td></tr>`).join('')}</tbody></table>`;
}

// ---------- misc ----------
function updateStatus(msg) {
  $('#model-status-line').textContent = msg;
}
function refreshModelList() {
  const idx = savedIndex();
  const sel = $('#model-load');
  sel.innerHTML = '<option value="">— saved models —</option>' +
    Object.keys(idx).sort().map(n => `<option>${esc(n)}</option>`).join('');
}
function renderAll() {
  renderKPIs(); renderScorecard(); renderForecast(); renderChecks();
}
async function deleteModel() {
  const idx = savedIndex();
  if (idx[modelName]) { delete idx[modelName]; persistIndex(idx); refreshModelList(); updateStatus(`Deleted "${modelName}"`); }
}
function resetModel() {
  overrides = {};
  wb.clearOverrides();
  applyScenario();
  rebuildAssumptionInputs(); syncScopeInputs();
  renderAll(); refreshPrintReport();
  updateStatus('Reset to baseline.');
}

async function boot() {
  const mount = $('#model-app');
  if (!mount) return;
  try {
    const res = await fetch('assets/model-data.json');
    if (!res.ok) throw new Error(`model data ${res.status}`);
    data = await res.json();
  } catch (e) {
    mount.innerHTML = `<p class="model-error">Could not load the financial model data (${esc(e.message)}). Serve the site over HTTP (e.g. <code>npm run dev</code>) rather than opening the file directly.</p>`;
    return;
  }
  wb = new Workbook(data);

  document.querySelectorAll('[data-scenario]').forEach(b =>
    b.addEventListener('click', () => { currentScenario = b.dataset.scenario; applyScenario(); syncScopeInputs(); renderAll(); refreshPrintReport(); }));
  $('#model-save').addEventListener('click', saveModel);
  $('#model-delete').addEventListener('click', deleteModel);
  $('#model-reset').addEventListener('click', resetModel);
  $('#model-export').addEventListener('click', exportJSON);
  $('#model-import').addEventListener('change', e => { if (e.target.files[0]) importJSON(e.target.files[0]); e.target.value = ''; });
  $('#model-load').addEventListener('change', e => { if (e.target.value) loadModel(e.target.value); });
  $('#model-print').addEventListener('click', async () => { lastHash = await contentHash(JSON.stringify(snapshot())); refreshPrintReport(); window.print(); });

  // model-type tabs
  const modelTabs = [...document.querySelectorAll('[data-mtab]')];
  const selectModelTab = (tab, focus = false) => {
    modelTabs.forEach(candidate => {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', String(selected));
      candidate.tabIndex = selected ? 0 : -1;
    });
    document.querySelectorAll('[data-mtab-panel]').forEach(panel => { panel.hidden = panel.dataset.mtabPanel !== tab.dataset.mtab; });
    if (tab.dataset.mtab === 'report') renderReportList();
    if (focus) tab.focus();
  };
  modelTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectModelTab(tab));
    tab.addEventListener('keydown', event => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % modelTabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + modelTabs.length) % modelTabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = modelTabs.length - 1;
      else return;
      event.preventDefault();
      selectModelTab(modelTabs[nextIndex], true);
    });
  });

  // solar & water calculators recompute on any input
  const solarPanel = document.querySelector('[data-mtab-panel="solar"]');
  const waterPanel = document.querySelector('[data-mtab-panel="water"]');
  if (solarPanel) { solarPanel.addEventListener('input', renderSolar); solarPanel.addEventListener('change', renderSolar); }
  if (waterPanel) { waterPanel.addEventListener('input', renderWater); waterPanel.addEventListener('change', renderWater); }

  $('#fin-add-report')?.addEventListener('click', () => addToReport('financial'));
  $('#solar-add-report')?.addEventListener('click', () => addToReport('solar'));
  $('#water-add-report')?.addEventListener('click', () => addToReport('water'));
  // Site planner handoff — the planner (embedded atop this page) dispatches a
  // structured entry; hash and store it like the tab-level "add to report" buttons.
  window.addEventListener('civics-site-report', async e => {
    const entry = e.detail;
    if (!entry || !entry.type) return;
    entry.hash = await contentHash(JSON.stringify(entry));
    const items = reportItems();
    items.push(entry);
    setReport(items);
    refreshPrintReport();
    updateStatus(`Added "${entry.name}" to report (${items.length} ${items.length === 1 ? 'entry' : 'entries'}).`);
    document.querySelector('[data-mtab="report"]')?.click();
  });
  $('#report-print')?.addEventListener('click', () => { refreshPrintReport(); window.print(); });
  $('#report-clear')?.addEventListener('click', () => setReport([]));
  $('#report-list')?.addEventListener('click', e => {
    const b = e.target.closest('[data-report-remove]');
    if (!b) return;
    const items = reportItems();
    items.splice(+b.dataset.reportRemove, 1);
    setReport(items);
  });
  $('#model-name').addEventListener('change', e => { modelName = e.target.value; refreshPrintReport(); });
  $('#scope-label').addEventListener('change', e => { scopeLabel = e.target.value; refreshPrintReport(); });
  $('#assump-search').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.assump-table tbody tr').forEach(tr => {
      tr.style.display = !q || tr.dataset.name.includes(q) ? '' : 'none';
    });
    document.querySelectorAll('.assump-group').forEach(d => { if (q) d.open = true; });
  });

  buildAssumptionGroups();
  rebuildAssumptionInputs();
  buildScopePanel();
  refreshModelList();
  renderSolar(); renderWater(); renderReportList();
  applyScenario();
  renderAll();
  refreshPrintReport();
  updateStatus(`Financial model loaded · ${await storageNote()}`);
  window.addEventListener('beforeprint', refreshPrintReport);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
