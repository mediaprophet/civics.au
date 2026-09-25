# 05 — Delivery work packages and acceptance

## Delivery approach

Implement a coherent vertical case first, then expand its methods and sectors. The full programme covers all scope areas in the overview. A vertical case is the integration test for that architecture, not a substitute for the remaining work.

All work packages below are proposed. The only implementation added during planning is the read-only evidence discovery probe and its tests; the site UI, calculation baseline and bundled runtime have not been migrated by this planning work.

## Work breakdown

| ID | Work and concrete output | Dependencies | Acceptance evidence |
|---|---|---|---|
| W01 | Pin Qualia source/build, produce `wasm-logic` package and runtime manifest | None | Repeatable build; paired bindings/hash; actual profile and supported operations recorded |
| W02 | Verify RDF→Q42 importer, format contract and browser reader | W01 | Representative RDF round-trip, typed values/context preserved, malformed/version-mismatch rejection |
| W03 | Browser worker/query/storage adapter | W01–02 | Load/query/cancel, OPFS/IndexedDB persistence, restart/restore, no-window tests, explicit unsupported status |
| W04 | Versioned evaluation vocabulary, shapes and parameter IDs | None; inform W02 | Reviewed definitions; test fixtures for valid/invalid records and stable workbook mappings |
| W05 | Extract research/qualification registers and preserve provenance | W04 | Every row preserved; status treated as reported; source/cell links; unavailable evidence visible |
| W06 | Dataset manifest/build pipeline and initial data packs | W02, W04–05 | D01–D08 mappings, exact releases, licence/access notes, units/geographies, validation and update diff |
| W07 | Immutable case, option, run and result contracts | W04 | Snapshot reproducibility; raw precision; baseline/alternative separation; version/migration tests |
| W08 | Financial/fiscal/economic reconciliation | W05–07 | Independent reviewed fixtures; defined NPV/BCR; transfers and overlaps reconciled; existing baseline parity |
| W09 | Technical modules and scientific integration | W01, W06–07 | Energy/water/site/digital constraints; boundary fixtures; CPU/GPU numerical comparison where relevant |
| W10 | Social outcomes and distributional module | W04, W06–08 | Group incidence, unmonetised effects, harms, participant input, dissent and disclosure controls |
| W11 | Versioned rule packs and explainable evaluation | W01–04, W07–10 | Tested SHACL/N3/modal subsets; counterevidence; unknown/conflict/incomplete states; traceable conclusions |
| W12 | Sensitivity, switching values and justified stochastic analysis | W08–11 | Decision reversal examples; documented distributions/correlations; seed/replay and convergence where used |
| W13 | Evidence explorer and integrated case workflow | W05–12 | End-to-end result→source and source→impact navigation; keyboard and screen-reader paths |
| W14 | Report compiler, export package and legacy migration | W07–13 | Frozen data; consistent HTML/PDF/JSON/RDF; safe legacy import; no silent current-state mixing |
| W15 | Sector case library and pilot evaluation loop | W08–14 | All six worked cases, measurement plans, forecast-versus-observed comparison and negative decisions |
| W16 | Field validation, performance and release operations | W01–15 | Independent reviews, browser matrix, dataset/runtime rollback, restore and usability evidence |

## Staged release gates

### Gate A — Runtime and format foundation

Complete W01–04. Freeze the runtime manifest and a small conformance corpus containing datatypes, language tags, blank nodes, contexts, negative/large numbers, conflicting claims and missing fields. Demonstrate actual browser Q42 queries with the selected build. A native-only successful query is not sufficient.

Exit condition: the chosen runtime can load, query and validate a known package, preserve identifiers/values and clearly report unsupported or incomplete work. If a required binding is missing, create an explicit upstream Qualia task and complete its fixture before proceeding with dependent functionality.

### Gate B — Evidence and reproducibility

Complete W05–07. Link the material parameters of one community-ground case to reviewed source/assumption records. Preserve all 143 research and 56 qualification entries, without treating their old statuses as current assurance. Add the initial data/source packs and immutable run snapshots.

Exit condition: a saved run can be reconstructed with the same versions and inputs; missing evidence is visible; a dataset update cannot change the saved result.

### Gate C — Defensible evaluation

Complete W08–12 for the first case. Compare a baseline and at least two alternatives across all five views. Reconcile money flows and shared outcomes. Exercise technical, social and evidence constraints alongside economic calculations.

Exit condition: reviewers can independently check selected calculations, reproduce a decision reversal and explain why a positive monetary result does or does not support the requested decision stage.

### Gate D — Reviewable reports

Complete W13–14. Deliver the case journey, evidence explorer, report compiler and legacy migration. Generate an exploratory report and a conditional feasibility report from the same case with accurately scoped wording.

Exit condition: every material quantitative claim resolves to its frozen inputs and sources/assumptions; report views agree; incomplete analysis is visible; old entries remain recoverable.

### Gate E — Breadth and field validation

Complete W15–16. Exercise resilience, digital cooperation, cooperative production, policy/service and international adaptation cases. Conduct user and disciplinary reviews, update method packs and test pilot measurement workflows.

Exit condition: the common architecture works across the whole proposition without forcing unsuitable monetisation, hiding sector constraints or duplicating accounting.

## Initial implementation changes by location

These are proposed locations, not existing files unless explicitly noted:

| Location | Planned responsibility |
|---|---|
| `assets/qualia/` (existing) | Pinned logic-profile runtime, bindings, licence and capability/build manifest |
| `assets/evaluation/` | Runtime adapter, workers, case/run schemas, methods, rules and result contracts |
| `assets/data/` | Redistributable versioned source catalogues and browser dataset packages |
| `scripts/data/` | Source acquisition, extraction, normalisation, validation, Q42 build and release diff |
| `assets/model-app.js` (existing) | UI integration, stable parameter mapping, migration and report actions |
| `assets/model-engine.js` (existing) | Retained workbook calculation baseline until individually validated migrations |
| `assets/sites.js` and `assets/site.js` (existing) | Site/planner adapters to shared case and technical input contracts |
| `content/pages.mjs` (existing) | Evidence, case and report interface copy and structure |
| `scripts/check-model.mjs` (existing) | Baseline financial parity; supplement with independent method tests |
| `scripts/evidence-audit.mjs` (planning probe) | Register-to-RDF discovery and existing-WASM audit; evolve or retire after W05 |
| `tests/evaluation/` | Method, dataset, rule, migration, export and browser acceptance fixtures |

Keep runtime, data, rule and report-template versioning independent. A dataset refresh should not require changing calculation code, and a new template should not recalculate a historical run.

## Test strategy

| Concern | Required tests |
|---|---|
| RDF/Q42 integrity | Exact literal/type/context round-trip, blank-node handling, large identifier precision, collision/error handling, truncated volumes and wrong versions |
| Dataset integrity | Source locator, unit conversions, suppressed values, period/geography mismatch, release revisions, access classification and validation coverage |
| Economic correctness | Known-answer discounted series, real/nominal consistency, year-zero timing, zero denominator, transfers, duplicate benefits, attribution already embedded in effect estimates |
| Technical correctness | No-sun/peak-load cases, losses, battery degradation/replacement, water demand bounds, capacity constraints, solver failure and convergence |
| Social reasoning | Missing and contested evidence, adverse impacts, group incidence, non-monetised effects, stakeholder weights and hard constraints |
| Logic correctness | Supported and unsupported shapes, multi-premise rules, defeaters, contradictory statements, dates/expiry, termination, budget exhaustion and provenance traces |
| Browser operation | Fresh/offline load, no WebGPU, storage quota/denial, eviction, worker cancellation, main-thread responsiveness and restart/restore |
| Reports | Frozen sources, cross-format equality, claim/citation completeness, HTML escaping, PDF pagination, legacy snapshot labelling and disclosure filtering |
| Deployment | Matching JS/WASM, correct WASM MIME type, cache version activation, dataset/runtime rollback and clean error messages |

The current 5,811-cell workbook check verifies reproduction of the stored workbook. It does not independently validate the economic model or empirical claims. Retain that check and add independent fixtures specifically for new methods and reconciliation.

## Responsibilities and resourcing

| Role | Accountability |
|---|---|
| Product/case owner | Decision scope, audiences, staged priorities and accepted case definitions |
| Qualia/runtime engineer | Build profile, format compatibility, exported bindings, logic execution and browser integration |
| Data steward | Source acquisition, licence/access record, release management, mapping quality and refresh decisions |
| Economic evaluator | Perspective, counterfactual, valuation, discounting, uncertainty and overlap reconciliation |
| Technical specialists | Physical/digital assumptions, constraints, engineering evidence and commissioning criteria |
| Community/participant representatives | Relevant outcomes, accessibility, interpretation, harms and social priorities |
| Frontend/report engineer | Case journey, evidence explorer, accessible outputs and migration |
| Independent reviewer | Scope-specific challenge and documented review findings |

Several roles may be held by the same person, but review scope and accountability remain explicit. Estimate effort after Gate A resolves the browser Q42 path and a sample dataset mapping establishes conversion/review cost. Record engineering, data stewardship, domain review, participant engagement and recurring maintenance separately; avoid a single speculative implementation price.

The largest uncertainty is the difference between capabilities in the local Qualia codebase and the exact browser APIs required here. Dataset interpretation and professional review are also material work, even when downloads and graph conversion are automated.

## Risk and dependency register

| Risk | Planned response / completion evidence |
|---|---|
| Source/runtime/version drift | Pinned commits and bytes, build manifest, explicit migration and artifact equivalence checks |
| Q42/Q42L/packed-block confusion | Format-discriminating fixtures and verified reader/writer pair; no extension-based assumptions |
| Native capability mistaken for browser support | Execute required operations in browser workers using the shipped build |
| Placeholder exports mistaken for governance | Trace implementation, test adverse cases and exclude placeholder routes from assurance |
| Data coverage mistaken for causality | Separate need context, effect evidence and applicability; require a causal rationale |
| Double counting / financial-social conflation | Benefit ledger, perspective reconciliation and independent method fixtures |
| False certainty from scores or modelled precision | Evidence states, ranges, unmonetised effects, sensitivity and transparent language |
| Browser data loss or capacity limits | Export/restore, quota tests, staged caches, measured budgets and bounded packages |
| Unmaintained sources/rules | Named stewards, review triggers, versioned activation and affected-claim reports |
| Scope expansion before one case works | Gate-based delivery with the full sector programme retained in W15 |

## Definition of done

The agreed runtime powers the semantic evaluation path; canonical RDF compiles into a tested compatible Q42 package; source records are traceable; calculation and rule outputs are reproducible; all five decision views are reconciled; report claims retain their evidence limits; the six sector fixtures pass; legacy work can be recovered; and users/reviewers can inspect, challenge, revise and issue a case. Any remaining unsupported capabilities are explicitly documented rather than represented as working features.
