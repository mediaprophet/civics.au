# 06 — Discovery record and evidence for the plan

Inspection conducted 24–25 September 2026. This record distinguishes executed checks, inspected implementations, upstream descriptions and proposed work. It is not an assurance report for either project.

## Local baseline

| Item | Observed value |
|---|---|
| civics.au checkout | `C:\Projects\civics.au` |
| civics.au HEAD observed | `7ee86ed5e085049d00ef1f7df23fe83500b237f9` |
| Qualia checkout inspected | `C:\Projects\qualia-27062026` |
| Qualia HEAD observed | `c601da6f68ad133ec2a310bb9ac0eae7f9521011` |
| Workbook version | `18.0 — 26 Aug 2026` |
| Bundled engine reported version/profile | `0.0.39` / `full` |
| Requested future build | `wasm-logic`, whose current feature closure includes `wasm-scientific` |

Working files may differ from their repository HEAD. The civics workspace already contained extensive page/style changes on entry; this planning work did not rebuild or deploy the site. Qualia was inspected read-only and was not built or modified.

SHA-256 of the exact civics artifacts inspected:

```text
assets/model-data.json
a08d3ba9e03a6dc155c3c9c702277376509d17617fa1f8eeff75bdd227a39bae

assets/qualia/qualia_core_db.js
57204a65276f8e217e77b8e4d95a8bc3d1c5e3a012f13a6a248

assets/qualia/qualia_core_db_bg.wasm
4515f1fb9ca5847d76a1482a7fc03f0c9d478a271bae990a57adf63e09bc4cce
```

## Executed checks

| Check | Result | What it does not establish |
|---|---|---|
| `node scripts/check-model.mjs` | 5,811 formula cells across 27 sheets; zero value mismatches/errors | Independent correctness of the economic method, assumptions or source claims |
| `node scripts/evidence-audit.mjs` | 143 research records; 56 qualification records; 18 research records explicitly labelled `Open — critical` | Current source validity, claim-to-parameter applicability or valuation eligibility |
| Source-reference completeness query | No research record lacked a source-reference field | Whether references resolve, are primary evidence, or support the stated claim |
| `node --test scripts/evidence-audit.test.mjs` | Three tests passed | Full RDF/SPARQL conformance, Q42 compatibility, browser storage or modal reasoning |
| Runtime introspection | Existing WASM reports `qualia-core-db`, `wasm32`, profile `full`, version 0.0.39 | Provenance of the build recipe or actual functionality of every declared capability |

The probe executes the existing WASM under Node, loads a Turtle projection of the workbook registers and exercises joins, aggregation, VALUES, OPTIONAL, FILTER NOT EXISTS and ASK. Its tests check complete register coverage, source-reference joins, literal escaping/round-trip, missing-source detection, retained rejection status and explicit failure for malformed register structure.

The probe preserves reported values, dates, statuses and references as literals. It does not transform them into verified observations. It supplies a repeatable discovery check and potential starting point for W05, rather than a production semantic schema.

Run the audit with `--turtle` to emit the register graph to stdout. It does not fetch sources, write browser storage or change the workbook. The register-to-RDF transformation and WASM query functions are in [the audit script](../../../scripts/evidence-audit.mjs), with fixtures in [the test file](../../../scripts/evidence-audit.test.mjs).

## Inspected implementation findings

| Finding | Local source | Consequence |
|---|---|---|
| Qualia is currently used mainly for hashes/storage information | [model-app.js](../../../assets/model-app.js), `initQualia`, `contentHash`, `storageNote` | Semantic functions require deliberate integration |
| Reports store display-oriented snapshots and append the current financial state | [model-app.js](../../../assets/model-app.js), `kpiSnapshot`, `forecastSnapshot`, `addToReport`, `refreshPrintReport` | Introduce immutable raw runs and explicit report selection |
| Workbook already carries evidence, qualifications and method caveats | [model-data.json](../../../assets/model-data.json) | Preserve and link this material instead of replacing it with a new unsupported score |
| Existing weather grids describe 2024 averages at 0.5° output cells | [solar-grid.json](../../../assets/solar-grid.json), [temp-grid.json](../../../assets/temp-grid.json), [tmax-grid.json](../../../assets/tmax-grid.json) | Retain period/resolution and distinguish screening from long-term/extreme conditions |
| `wasm-logic` includes `wasm-scientific`; science includes `gpu-runtime` | [Qualia Cargo.toml](C:/Projects/qualia-27062026/crates/qualia-core-db/Cargo.toml) | Select logic build, measure actual size/requirements and verify CPU paths |
| Profile capabilities are declared centrally | [wasm_capabilities.rs](C:/Projects/qualia-27062026/crates/qualia-core-db/src/wasm_capabilities.rs) | Store declarations alongside executed capability fixtures |
| Unified Q42 v3 has embedded lexicon/index/block structure | [q42_volume.rs](C:/Projects/qualia-27062026/crates/qualia-core-db/src/q42/q42_volume.rs) | Pin the format and reader/writer pair |
| Lite session `load_q42` explicitly means Q42L and rejects native Q42 v3 | [lite lib.rs](C:/Projects/qualia-27062026/crates/webizen-lite-wasm/src/lib.rs), [session.rs](C:/Projects/qualia-27062026/crates/webizen-lite-wasm/src/session.rs) | Lite is not interchangeable with the intended full evidence-store path |
| Storage helper implementation calls `window()` | [wasm_storage.rs](C:/Projects/qualia-27062026/crates/qualia-core-db/src/wasm_storage.rs) | Dedicated-worker persistence needs explicit verification/adapter work |
| Some older edge/governance exports are placeholders | [wasm_edge.rs](C:/Projects/qualia-27062026/crates/qualia-core-db/src/wasm_edge.rs), including `enforce_rights_ontology` | Do not treat these as implemented assurance gates |
| CLI N3-to-deontic compile handler only logs a message | [handlers/misc.rs](C:/Projects/qualia-27062026/crates/qualia-cli/src/handlers/misc.rs), `handle_compile` | Validate actual parser/compiler/evaluator route rather than naming a nominal CLI command |
| Import, graph verification and Q42 verification paths exist in local CLI source | [cli/mod.rs](C:/Projects/qualia-27062026/crates/qualia-cli/src/cli/mod.rs), [handlers/misc.rs](C:/Projects/qualia-27062026/crates/qualia-cli/src/handlers/misc.rs) | Candidate build pipeline; not executed during this planning work |

The older `QualiaStore` generated wrapper has BigInt input identifiers and Float64Array query results. This is a precision review item for large identifiers, not a demonstrated failure in the tested `WasmHealthStore` route.

## Primary references reviewed

- [QualiaDB repository](https://github.com/mediaprophet/qualiaDB/) and local [WASM capability profiles](C:/Projects/qualia-27062026/docs/manuals/wasm-capability-profiles.md): intended platform and profile boundaries. Local source and executed checks take precedence over broad README descriptions for this integration.
- [Oxigraph JavaScript documentation](https://github.com/oxigraph/oxigraph/blob/main/js/README.md): WASM RDF/SPARQL alternative with an in-memory JS store. Retained only as a possible development comparison after the user's Qualia direction.
- [Australian Centre for Evaluation: economic evaluation methods](https://evaluation.treasury.gov.au/publications/guide-economic-evaluation-methods): method selection by evaluation context.
- [NSW Government CBA guide](https://www.nsw.gov.au/nsw-government/public-sector/financial-information-for-public-entities/centre-for-economic-evidence/nsw-government-investment-framework/government-guide-to-cost-benefit-analysis), [NSW tools and Outcome Values Database](https://www.nsw.gov.au/nsw-government/public-sector/financial-information-for-public-entities/centre-for-economic-evidence/tools-resources) and [Infrastructure Australia economic appraisal guide](https://www.infrastructureaustralia.gov.au/guide-economic-appraisal): candidate method and valuation reference packs, requiring jurisdiction/version selection.
- [ABS Data API guide](https://www.abs.gov.au/statistics/application-programming-interfaces-apis/data-api-user-guide), [Data by region methodology](https://www.abs.gov.au/methodologies/data-region-methodology/2011-25) and [SEIFA 2021](https://www.abs.gov.au/statistics/people/people-and-communities/socio-economic-indexes-areas-seifa-australia/2021): regional source families and metadata.
- [AIHW homelessness services](https://www.aihw.gov.au/reports-data/health-welfare-services/homelessness-services/overview), [SHSC quality statement](https://meteor.aihw.gov.au/content/811117) and [Productivity Commission housing/homelessness RoGS](https://www.pc.gov.au/ongoing/report-on-government-services/housing-homelessness/): service need, expenditure/outcomes and scope/comparability constraints.
- [BOM average solar exposure](https://www.bom.gov.au/climate/maps/averages/solar-exposure/), [CSIRO GenCost](https://www.csiro.au/en/research/technology-space/energy/Electricity-transition/GenCost), [AEMO IASR](https://www.aemo.com.au/energy-systems/major-publications/integrated-system-plan-isp/2026-integrated-system-plan-isp/2025-26-inputs-assumptions-and-scenarios) and [DCCEEW factors](https://www.dcceew.gov.au/climate-change/publications/national-greenhouse-accounts-factors-2025): candidate technical and environmental source families.
- [PROV-O](https://www.w3.org/TR/prov-o/), [DCAT 3](https://www.w3.org/TR/vocab-dcat-3/) and [SHACL](https://www.w3.org/TR/shacl/): standards for provenance, catalogues and validation.

Dataset pages were reviewed to identify suitable sources and limitations. Their underlying data files have not been ingested or independently audited as part of this plan. Future source packs must pin exact releases and perform the checks in W06.

## Remaining discovery before implementation commitments

Build and inspect the selected logic profile; prove Q42 browser read/query compatibility; verify identifier and literal precision; test required SHACL/N3/modal paths and rule traces; establish worker-compatible persistence; measure resource requirements; and review the first parameter mappings with relevant domain specialists. These are scheduled work packages, not reasons to replace the agreed Qualia architecture.
