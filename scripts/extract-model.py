#!/usr/bin/env python3
"""Extract the Canberra financial model workbook into assets/model-data.json.

Reads the .inspect.ndjson dump produced alongside the .xlsx in outputs/ and
writes a compact JSON cell map consumed by assets/model-engine.js:

  { "sheets": { "<name>": { "A1": <value> | {"f": "...", "v": <value>} } } }

Cells holding a formula are objects with `f` (formula text without the leading
'=') and `v` (Excel's last cached value, used by scripts/check-model.mjs to
verify the JS engine). Literal cells serialize as their bare value.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NDJSON = ROOT.parent / "outputs" / "canberra-project-financial-model-20260826-v18" / "canberra_project_financial_model_v18.xlsx.inspect.ndjson"
OUT = ROOT / "assets" / "model-data.json"


def col_name(idx):
    s = ""
    idx += 1
    while idx:
        idx, m = divmod(idx - 1, 26)
        s = chr(65 + m) + s
    return s


def main():
    grids = {}   # sheet -> 2d values
    formulas = {}  # sheet -> {addr: formula}
    order = []
    for line in NDJSON.open(encoding="utf-8"):
        o = json.loads(line)
        if o["kind"] == "sheet":
            order.append(o["name"])
        elif o["kind"] == "table":
            grids[o["sheet"]] = o["values"]
        elif o["kind"] == "formula":
            formulas.setdefault(o["sheet"], {})[o["address"]] = o["formula"]

    sheets = {}
    for name in order:
        grid = grids.get(name, [])
        fmap = formulas.get(name, {})
        cells = {}
        for r, row in enumerate(grid, 1):
            for c, val in enumerate(row):
                if val is None:
                    continue
                addr = f"{col_name(c)}{r}"
                f = fmap.get(addr)
                if f:
                    cells[addr] = {"f": f[1:] if f.startswith("=") else f, "v": val}
                else:
                    cells[addr] = val
        # formula cells whose cached value sits outside the dumped grid (rare)
        for addr, f in fmap.items():
            if addr not in cells:
                cells[addr] = {"f": f[1:] if f.startswith("=") else f, "v": None}
        sheets[name] = cells

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", encoding="utf-8") as fh:
        json.dump({"source": NDJSON.name, "version": "18.0 — 26 Aug 2026", "sheets": sheets}, fh, separators=(",", ":"), ensure_ascii=False)
    total = sum(len(c) for c in sheets.values())
    nf = sum(1 for c in sheets.values() for v in c.values() if isinstance(v, dict))
    print(f"wrote {OUT} — {len(sheets)} sheets, {total} cells, {nf} formulas, {OUT.stat().st_size/1024:.0f} KiB")


if __name__ == "__main__":
    sys.exit(main())
