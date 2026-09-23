// model-engine.js — minimal Excel-formula evaluator for the Canberra financial model.
// Supports: cell refs ($A$1), quoted/unquoted sheet refs ('Sheet'!A1), ranges,
// + - * / ^ % & comparisons, strings, and the function set used by the workbook:
// MIN MAX IF SUM ABS SUMIF COUNTIF AND OR SUMPRODUCT IFERROR INDEX MAXIFS
// ROUND COUNTA AVERAGE COUNT COUNTBLANK
// Ranges evaluate to 2D arrays; binary operators broadcast element-wise and
// errors propagate as {err:'#…'} objects.

const ERR = code => ({ err: code });
const isErr = v => v !== null && typeof v === 'object' && 'err' in v;
const DIV0 = () => ERR('#DIV/0!');
const VALUE = () => ERR('#VALUE!');
const REF = () => ERR('#REF!');

// ---------- address helpers ----------
const COL_RE = /^[A-Za-z]{1,3}$/;
export function colToNum(letters) {
  let n = 0;
  for (const ch of letters.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}
export function numToCol(n) {
  let s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; }
  return s;
}
const CELL_RE = /^\$?([A-Za-z]{1,3})\$?(\d+)$/;

// ---------- tokenizer ----------
function tokenize(src) {
  const toks = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { i++; continue; }
    if (ch === "'") { // quoted sheet name
      let j = i + 1, name = '';
      while (j < src.length && src[j] !== "'") { name += src[j]; j++; }
      toks.push({ t: 'sheet', v: name });
      i = j + 1;
      continue;
    }
    if (ch === '"') { // string literal
      let j = i + 1, s = '';
      while (j < src.length && src[j] !== '"') { s += src[j]; j++; }
      toks.push({ t: 'str', v: s });
      i = j + 1;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (two === '<=' || two === '>=' || two === '<>') { toks.push({ t: 'op', v: two }); i += 2; continue; }
    if ('+-*/^&()=<>!,:%'.includes(ch)) { toks.push({ t: 'op', v: ch }); i++; continue; }
    if (/[0-9.]/.test(ch)) {
      const m = src.slice(i).match(/^\d*\.?\d+(?:[eE][+-]?\d+)?/);
      toks.push({ t: 'num', v: parseFloat(m[0]) });
      i += m[0].length;
      continue;
    }
    if (/[A-Za-z_$]/.test(ch)) {
      const m = src.slice(i).match(/^\$?[A-Za-z]{1,3}\$?\d+|[A-Za-z_][A-Za-z0-9_.]*/);
      toks.push({ t: 'ident', v: m[0] });
      i += m[0].length;
      continue;
    }
    throw new Error(`Unexpected character '${ch}' in formula`);
  }
  return toks;
}

// ---------- parser (produces AST) ----------
export function parseFormula(src) {
  const toks = tokenize(src);
  let pos = 0;
  const peek = () => toks[pos];
  const take = () => toks[pos++];
  const expectOp = v => { const t = take(); if (!t || t.t !== 'op' || t.v !== v) throw new Error(`expected '${v}'`); };

  function parseExpr() { return parseComparison(); }

  function parseComparison() {
    let l = parseConcat();
    while (peek() && peek().t === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(peek().v)) {
      const op = take().v;
      l = { t: 'bin', op, l, r: parseConcat() };
    }
    return l;
  }
  function parseConcat() {
    let l = parseAdd();
    while (peek() && peek().t === 'op' && peek().v === '&') { take(); l = { t: 'bin', op: '&', l, r: parseAdd() }; }
    return l;
  }
  function parseAdd() {
    let l = parseMul();
    while (peek() && peek().t === 'op' && (peek().v === '+' || peek().v === '-')) {
      const op = take().v;
      l = { t: 'bin', op, l, r: parseMul() };
    }
    return l;
  }
  function parseMul() {
    let l = parseUnary();
    while (peek() && peek().t === 'op' && (peek().v === '*' || peek().v === '/')) {
      const op = take().v;
      l = { t: 'bin', op, l, r: parseUnary() };
    }
    return l;
  }
  function parseUnary() {
    if (peek() && peek().t === 'op' && (peek().v === '-' || peek().v === '+')) {
      const op = take().v;
      return { t: 'un', op, x: parseUnary() };
    }
    return parsePower();
  }
  function parsePower() {
    const base = parsePostfix();
    if (peek() && peek().t === 'op' && peek().v === '^') { take(); return { t: 'bin', op: '^', l: base, r: parseUnary() }; }
    return base;
  }
  function parsePostfix() {
    let x = parsePrimary();
    while (peek() && peek().t === 'op' && peek().v === '%') { take(); x = { t: 'un', op: '%', x }; }
    return x;
  }
  function parsePrimary() {
    const tok = take();
    if (!tok) throw new Error('unexpected end of formula');
    if (tok.t === 'num') return { t: 'num', v: tok.v };
    if (tok.t === 'str') return { t: 'str', v: tok.v };
    if (tok.t === 'op' && tok.v === '(') { const e = parseExpr(); expectOp(')'); return e; }
    if (tok.t === 'sheet' || tok.t === 'ident') {
      // sheet-qualified reference: 'Sheet'!A1 or Name!A1 or 'S'!A1:B5
      if (peek() && peek().t === 'op' && peek().v === '!') {
        take();
        const refTok = take();
        if (!refTok || refTok.t !== 'ident') throw new Error('expected cell ref after !');
        const ref = parseRefOrRange(refTok.v, tok.v);
        return ref;
      }
      if (tok.t === 'ident') {
        // function call?
        if (peek() && peek().t === 'op' && peek().v === '(') {
          take();
          const args = [];
          if (!(peek() && peek().t === 'op' && peek().v === ')')) {
            args.push(parseExpr());
            while (peek() && peek().t === 'op' && peek().v === ',') { take(); args.push(parseExpr()); }
          }
          expectOp(')');
          return { t: 'call', name: tok.v.toUpperCase(), args };
        }
        // bare ref / range
        if (CELL_RE.test(tok.v)) return parseRefOrRange(tok.v, null);
        if (tok.v === 'TRUE') return { t: 'num', v: 1 };
        if (tok.v === 'FALSE') return { t: 'num', v: 0 };
        throw new Error(`unknown identifier '${tok.v}'`);
      }
      throw new Error('unexpected sheet token');
    }
    throw new Error(`unexpected token ${JSON.stringify(tok)}`);
  }
  function parseRefOrRange(firstRef, sheet) {
    const m = firstRef.replaceAll('$', '').match(CELL_RE);
    if (!m) throw new Error(`bad cell ref '${firstRef}'`);
    const c1 = colToNum(m[1]), r1 = parseInt(m[2], 10);
    if (peek() && peek().t === 'op' && peek().v === ':') {
      take();
      const tok2 = take();
      let sheet2 = null, ref2;
      if (tok2.t === 'sheet') { // 'S'!A1:'S'!B5 form
        expectOp('!');
        const rt = take();
        ref2 = rt.v;
      } else if (tok2.t === 'ident') {
        ref2 = tok2.v;
      } else throw new Error('expected ref after :');
      const m2 = ref2.replaceAll('$', '').match(CELL_RE);
      if (!m2) throw new Error(`bad range end '${ref2}'`);
      return { t: 'range', sheet: sheet || sheet2, c1, r1, c2: colToNum(m2[1]), r2: parseInt(m2[2], 10) };
    }
    return { t: 'ref', sheet, col: c1, row: r1 };
  }

  const ast = parseExpr();
  if (pos < toks.length) throw new Error(`trailing tokens in formula: ${src}`);
  return ast;
}

// ---------- evaluation ----------
const num = v => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') { const n = parseFloat(v); return Number.isFinite(n) ? n : VALUE(); }
  return v; // error
};
const truthy = v => {
  if (v === null || v === undefined) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v.length > 0;
  return false;
};
const isArr = v => Array.isArray(v);
const flat = v => isArr(v) ? v.flat() : [v];

// Excel ordering: number < text < logical. Case-insensitive text compare.
function cmpRank(v) { return typeof v === 'number' ? 0 : typeof v === 'string' ? 1 : 2; }
function compare(op, a, b) {
  a = a === undefined ? null : a; b = b === undefined ? null : b;
  const ra = cmpRank(a === null ? 0 : a), rb = cmpRank(b === null ? 0 : b);
  let c;
  if (ra !== rb) c = ra - rb;
  else if (ra === 1) c = String(a ?? '').toUpperCase().localeCompare(String(b ?? '').toUpperCase());
  else c = (a === null ? 0 : a) - (b === null ? 0 : b);
  switch (op) {
    case '=': return c === 0;
    case '<>': return c !== 0;
    case '<': return c < 0;
    case '>': return c > 0;
    case '<=': return c <= 0;
    case '>=': return c >= 0;
  }
}

function broadcast(op, a, b, fn) {
  const aA = isArr(a), bA = isArr(b);
  if (!aA && !bA) return fn(a, b);
  const rows = aA ? a.length : b.length;
  const cols = aA ? a[0].length : b[0].length;
  const out = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const av = aA ? (a[r] ? a[r][c] : undefined) : a;
      const bv = bA ? (b[r] ? b[r][c] : undefined) : b;
      row.push(fn(av === undefined ? null : av, bv === undefined ? null : bv));
    }
    out.push(row);
  }
  return out;
}

function arith(op, a, b) {
  return broadcast(op, a, b, (x, y) => {
    if (isErr(x)) return x;
    if (isErr(y)) return y;
    const nx = num(x), ny = num(y);
    if (isErr(nx)) return nx;
    if (isErr(ny)) return ny;
    switch (op) {
      case '+': return nx + ny;
      case '-': return nx - ny;
      case '*': return nx * ny;
      case '/': return ny === 0 ? DIV0() : nx / ny;
      case '^': return Math.pow(nx, ny);
      case '&': return String(x ?? '') + String(y ?? '');
    }
  });
}

// criteria matcher for SUMIF/COUNTIF/MAXIFS
function criteriaFn(crit) {
  if (isArr(crit)) crit = crit.flat()[0];
  if (typeof crit === 'string') {
    const m = crit.match(/^(<=|>=|<>|=|<|>)(.+)$/);
    if (m) {
      const rhs = /^-?\d*\.?\d+$/.test(m[2].trim()) ? parseFloat(m[2]) : m[2].trim();
      return v => compare(m[1], v === null ? 0 : v, rhs);
    }
    return v => compare('=', v, crit);
  }
  return v => compare('=', v, crit);
}

const FUNCS = {
  SUM(args, ev) { let s = 0; for (const a of args) for (const v of flat(ev(a))) { if (isErr(v)) return v; if (typeof v === 'number') s += v; } return s; },
  MIN(args, ev) { let m = Infinity; for (const a of args) for (const v of flat(ev(a))) { if (isErr(v)) return v; if (typeof v === 'number' && v < m) m = v; } return m === Infinity ? 0 : m; },
  MAX(args, ev) { let m = -Infinity; for (const a of args) for (const v of flat(ev(a))) { if (isErr(v)) return v; if (typeof v === 'number' && v > m) m = v; } return m === -Infinity ? 0 : m; },
  AVERAGE(args, ev) { let s = 0, n = 0; for (const a of args) for (const v of flat(ev(a))) { if (isErr(v)) return v; if (typeof v === 'number') { s += v; n++; } } return n === 0 ? DIV0() : s / n; },
  COUNT(args, ev) { let n = 0; for (const a of args) for (const v of flat(ev(a))) if (typeof v === 'number') n++; return n; },
  COUNTA(args, ev) { let n = 0; for (const a of args) for (const v of flat(ev(a))) if (v !== null && v !== undefined && v !== '') n++; return n; },
  COUNTBLANK(args, ev) { let n = 0; for (const a of args) for (const v of flat(ev(a))) if (v === null || v === undefined || v === '') n++; return n; },
  ABS(args, ev) { const v = num(ev(args[0])); return isErr(v) ? v : Math.abs(v); },
  ROUND(args, ev) { const v = num(ev(args[0])), d = num(ev(args[1])); if (isErr(v)) return v; const p = Math.pow(10, d); return Math.round(v * p) / p; },
  IF(args, ev) {
    const c = ev(args[0]);
    if (isErr(c)) return c;
    return truthy(c) ? ev(args[1]) : (args.length > 2 ? ev(args[2]) : false);
  },
  AND(args, ev) { for (const a of args) { const v = ev(a); if (isErr(v)) return v; if (!truthy(v)) return false; } return true; },
  OR(args, ev) { for (const a of args) { const v = ev(a); if (isErr(v)) return v; if (truthy(v)) return true; } return false; },
  IFERROR(args, ev) { const v = ev(args[0]); return isErr(v) ? ev(args[1]) : v; },
  SUMIF(args, ev) {
    const range = ev(args[0]); const crit = ev(args[1]);
    const sum = args.length > 2 ? ev(args[2]) : range;
    const match = criteriaFn(crit);
    const rf = flat(range), sf = flat(sum);
    let s = 0;
    for (let i = 0; i < rf.length; i++) {
      if (match(rf[i])) { const v = sf[i]; if (isErr(v)) return v; if (typeof v === 'number') s += v; }
    }
    return s;
  },
  COUNTIF(args, ev) {
    const range = ev(args[0]); const crit = ev(args[1]);
    const match = criteriaFn(crit);
    let n = 0;
    for (const v of flat(range)) if (match(v)) n++;
    return n;
  },
  MAXIFS(args, ev) {
    const maxRange = flat(ev(args[0]));
    let m = -Infinity;
    const idx = [];
    for (let i = 0; i < maxRange.length; i++) idx.push(true);
    for (let k = 1; k + 1 < args.length + 1; k += 2) {
      if (k >= args.length) break;
      const critRange = flat(ev(args[k]));
      const crit = ev(args[k + 1]);
      if (crit === undefined) break;
      const match = criteriaFn(crit);
      for (let i = 0; i < idx.length; i++) if (idx[i] && !match(critRange[i])) idx[i] = false;
    }
    for (let i = 0; i < idx.length; i++) if (idx[i] && typeof maxRange[i] === 'number' && maxRange[i] > m) m = maxRange[i];
    return m === -Infinity ? 0 : m;
  },
  SUMPRODUCT(args, ev) {
    const arrays = args.map(a => flat(ev(a)));
    const n = arrays[0].length;
    let s = 0;
    for (let i = 0; i < n; i++) {
      let p = 1;
      for (const arr of arrays) {
        let v = arr[i];
        if (isErr(v)) return v;
        if (v === null || v === undefined) v = 0;
        if (typeof v === 'boolean') v = v ? 1 : 0;
        if (typeof v === 'string') v = 0;
        p *= v;
      }
      s += p;
    }
    return s;
  },
  INDEX(args, ev) {
    const range = ev(args[0]);
    const row = num(ev(args[1]));
    const col = args.length > 2 ? num(ev(args[2])) : null;
    if (!isArr(range)) return range;
    const rows = range.length, cols = range[0].length;
    let r, c;
    if (rows === 1) { r = 0; c = (col ?? row) - 1; }
    else if (cols === 1) { r = row - 1; c = 0; }
    else { r = row - 1; c = (col ?? 1) - 1; }
    if (r < 0 || r >= rows || c < 0 || c >= cols) return REF();
    return range[r][c] ?? null;
  },
};

// ---------- workbook ----------
export class Workbook {
  constructor(data) {
    this.sheets = data.sheets;
    this.overrides = new Map(); // "Sheet!A1" -> value
    this.cache = new Map();
    this.busy = new Set();
    this.astCache = new Map();
    this.sheetIndex = new Map(Object.keys(data.sheets).map(n => [n.toUpperCase(), n]));
  }
  key(sheet, addr) { return `${sheet}!${addr}`; }
  setOverride(sheet, addr, value) { this.overrides.set(this.key(sheet, addr), value); this.cache.clear(); }
  clearOverride(sheet, addr) { this.overrides.delete(this.key(sheet, addr)); this.cache.clear(); }
  clearOverrides() { this.overrides.clear(); this.cache.clear(); }
  sheetName(name) { return this.sheetIndex.get(name.toUpperCase()) || name; }
  cellRaw(sheet, addr) { return this.sheets[this.sheetName(sheet)]?.[addr]; }

  getCell(sheet, col, row) {
    const addr = `${numToCol(col)}${row}`;
    const k = this.key(sheet, addr);
    if (this.overrides.has(k)) return this.overrides.get(k);
    if (this.cache.has(k)) return this.cache.get(k);
    const cell = this.cellRaw(sheet, addr);
    let v = null;
    if (cell !== undefined) {
      if (cell !== null && typeof cell === 'object' && 'f' in cell) {
        if (this.busy.has(k)) return ERR('#CYCLE!');
        this.busy.add(k);
        try { v = this.evalAst(this.ast(sheet, cell.f), sheet); }
        catch (e) { v = ERR('#ERROR'); }
        this.busy.delete(k);
      } else v = cell;
    }
    this.cache.set(k, v);
    return v;
  }
  get(sheet, addr) {
    const m = addr.replaceAll('$', '').match(CELL_RE);
    if (!m) return REF();
    return this.getCell(this.sheetName(sheet), colToNum(m[1]), parseInt(m[2], 10));
  }
  ast(sheet, src) {
    const k = `${sheet}\n${src}`;
    if (!this.astCache.has(k)) this.astCache.set(k, parseFormula(src));
    return this.astCache.get(k);
  }
  rangeValues(sheet, c1, r1, c2, r2) {
    const out = [];
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
      const row = [];
      for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) row.push(this.getCell(sheet, c, r));
      out.push(row);
    }
    return out;
  }
  evalAst(node, sheet) {
    switch (node.t) {
      case 'num': return node.v;
      case 'str': return node.v;
      case 'ref': return this.getCell(node.sheet ? this.sheetName(node.sheet) : sheet, node.col, node.row);
      case 'range': return this.rangeValues(node.sheet ? this.sheetName(node.sheet) : sheet, node.c1, node.r1, node.c2, node.r2);
      case 'un': {
        const v = this.evalAst(node.x, sheet);
        if (node.op === '%') return broadcast('%', v, null, x => isErr(x) ? x : (isErr(num(x)) ? num(x) : num(x) / 100));
        if (node.op === '-') return broadcast('-', v, null, x => isErr(x) ? x : -num(x));
        return v;
      }
      case 'bin': {
        const l = this.evalAst(node.l, sheet), r = this.evalAst(node.r, sheet);
        if (['=', '<>', '<', '>', '<=', '>='].includes(node.op)) {
          if (isErr(l)) return l;
          if (isErr(r)) return r;
          return broadcast(node.op, l, r, (a, b) => compare(node.op, a, b));
        }
        if (isErr(l)) return l;
        if (isErr(r)) return r;
        return arith(node.op, l, r);
      }
      case 'call': {
        const fn = FUNCS[node.name];
        if (!fn) return ERR('#NAME?');
        const ev = a => this.evalAst(a, sheet);
        // IF is lazy; others evaluate eagerly inside the function via ev
        try { return fn(node.args, ev); }
        catch (e) { return ERR('#ERROR'); }
      }
    }
    return ERR('#ERROR');
  }
}
