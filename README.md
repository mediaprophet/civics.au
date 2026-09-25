# civics.au

Concept collection and web architecture exploring community grounds, the Walkabout Strategy, cooperative physical innovation, and connected civics infrastructure in regional Australia.

## Review the pages

Open `index.html` directly in a browser. All pages, styles and scripts work locally without external dependencies. Alternatively, run `npm run dev` and visit `http://127.0.0.1:4173`.

### Published Pages

The site is organised into two audience tracks — *For participants* (citizens considering mobile living) and *For communities* (grounds, councils and governance) — plus shared components and tools. Navigation uses grouped dropdown menus.

1. **00 / Home (`index.html`)**: Broad site overview — what civics.au is, the moving parts, how they connect, honest status.

**For participants**

2. **01 / The Walkabout Strategy (`walkabout.html`)**: Australian concession card holder baseline (~$600/wk), $15/night electronic payments, living cost simulator, and 3-tier pricing architecture.
3. **02 / Fit-out & budget (`setup.html`)**: Interactive planner — campervan vs car+camper-trailer vs tow-vehicle+caravan, towing weight & payload checks, berth/space check, fit-out and connectivity costs, and a weekly budget with or without a community ground.

**For communities**

4. **03 / The idea (`the-idea.html`)**: The community grounds area landing page — overview, living costs, and Solarpunk philosophy.
5. **04 / Community grounds (`community-grounds.html`)**: The proposition, supporting life milestones, protecting grassroots innovators, everyday essentials, and global SDG alignment.
6. **05 / Generative infrastructure (`infrastructure.html`)**: Physical facilities, islandable renewable microgrids, and decentralised digital services.
7. **06 / Digital economy (`digital-economy.html`)**: W3C Solid-compatible portable data pods, offline-first edge controllers (Solid-CSS-Databox), transactive microgrids, and community AI orchestration hubs.
8. **07 / Cooperative projects (`cooperative-projects.html`)**: Version control for physical projects, 3-stage milestone pipeline, and real-world commit log inspector.
9. **08 / The journey out (`journey-out.html`)**: Transition framework, cohort profiles, stepping stones, and continued connection beyond the campsite.
10. **09 / Review & next steps (`review.html`)**: Economic hypotheses, pilot evaluation questions, and open-standard references.

**Components & tools**

11. **10 / Concession credentials (`concession-card.html`)**: Digital concession card concept — attribute-based W3C verifiable credentials, Solid pods, zero-knowledge selective disclosure, offline POS, and a STRIDE/LINDDUN threat model.
12. **11 / Solid databox (`databox.html`)**: The per-program secure exchange point — W3C Solid pods, ODRL policies, signed receipts and an append-only evidence ledger (Solid-CSS-Databox).
13. **12 / Modelling lab (`model.html`)**: Interactive in-browser version of the Canberra Project financial model (v18) plus solar/battery and water/thermal estimators — scenario switching, editable assumptions, local save/load, and accumulated PDF report export.

**Top-level**

14. **13 / Expression of interest (`eoi.html`)**: Early contact form for prospective participants, partners and funders.

## Development & Build

- `content/pages.mjs` holds the editorial content, page metadata and stable section identifiers.
- `scripts/build.mjs` generates the HTML files. Run `npm run build` after editing content or templates.
- `scripts/check.mjs` verifies local links, anchors, semantic markup, and content consistency. Run `npm run check`.
- `assets/styles.css`, `assets/site.js`, and `assets/grounds.svg` provide layout, interactive calculators, commit inspector, and original schematics.
- `assets/model-data.json`, `assets/model-engine.js` and `assets/model-app.js` power the Modelling lab: the workbook extracted as data (`scripts/extract-model.py` regenerates it from `outputs/…/*.inspect.ndjson`), a small Excel-formula evaluator, and the interactive UI. `npm run check` re-verifies every formula cell against the workbook's stored values.
- `assets/qualia/` bundles the qualiaDB v0.0.39 WASM runtime (`qualia_core_db`), lazily loaded for BLAKE3 content hashes on saved/exported models; the lab works without it via a WebCrypto fallback.

No external package installation is required; scripts run with Node.js built-ins.

## Economic evaluation implementation planning

The [decision evidence implementation plan](docs/plans/decision-evidence/README.md) sets out the QualiaDB `wasm-logic` direction, RDF-to-Q42 data pipeline, economic/technical/social evaluation methods, reproducible reports, dataset programme and staged acceptance criteria. The [discovery record](docs/plans/decision-evidence/06-discovery-record.md) distinguishes tested behaviour from planned capabilities.

Read-only discovery checks: `node scripts/evidence-audit.mjs` and `node --test scripts/evidence-audit.test.mjs`. The audit preserves workbook evidence statuses as reported; it does not independently verify the cited claims.

## GitHub Pages Deployment

The site is published to GitHub Pages via GitHub Actions:
- Workflow configuration: `.github/workflows/deploy.yml`
- Triggered automatically on push to `main` (and via manual workflow dispatch).
- Rebuilds all pages, verifies link and content integrity, and deploys static artifacts to GitHub Pages.
