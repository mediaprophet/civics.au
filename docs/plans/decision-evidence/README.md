# Economic evaluation and decision evidence: implementation plan

Planning baseline: 25 September 2026. Status: proposed implementation programme; runtime discovery and a small read-only evidence probe completed.

## Intended outcome

Make civics.au a QualiaDB-powered environment in which a community, proponent, engineer, evaluator or funder can build and challenge an investment case. A report should explain the need, alternatives, costs, practical feasibility, expected outcomes, distribution of gains and losses, evidence quality and conditions for proceeding. Readers should be able to follow a conclusion back to an exact model run, assumption, source observation and review decision.

Convincing justification comes from a case that survives challenge. The system must be equally capable of supporting a proposal, narrowing it, identifying the evidence needed for a pilot, or showing why an option should not proceed.

The agreed technical direction is **QualiaDB `wasm-logic`, including its scientific dependencies**, with RDF source material compiled into compatible Q42 data products. Oxigraph can be an independent RDF/SPARQL comparison tool during development; it is not the planned site runtime. The existing page structure provides the presentation foundation.

## Read this plan

| Document | Purpose |
|---|---|
| [01 — Runtime and Q42 architecture](01-runtime-and-q42.md) | Profile selection, compilation, workers, persistence, browser contracts and integration boundaries |
| [02 — Semantic model and datasets](02-semantics-and-datasets.md) | Evidence entities, mappings, source priorities, ingestion and dataset lifecycle |
| [03 — Evaluation and reasoning](03-evaluation-and-reasoning.md) | Economic, technical and social methods; logic; uncertainty; worked case specifications |
| [04 — Reports and decision workflow](04-reports-and-workflow.md) | User journeys, reproducible report packages, review and accessible presentation |
| [05 — Delivery and acceptance](05-delivery-and-acceptance.md) | Work packages, dependencies, release gates, tests, resourcing and completion criteria |
| [06 — Discovery record](06-discovery-record.md) | What was inspected or executed, precise limitations and source references |
| [07 — Camping populations and data](07-camping-infrastructure-populations-and-data.md) | Service pathways, data sources, ontology mapping and safeguards for estimating local demand |
| [08 — Community opportunity model](08-community-opportunity-model.md) | Locally agreed temporary contributions, separated benefit ledgers and pilot safeguards |
| [09 — Solid Databox community commerce integration](09-solid-databox-community-commerce-integration.md) | Existing Databox capabilities, local-commerce boundaries, interoperability evidence and pilot slice |
| [10 — Community energy and disaster resilience](10-community-energy-and-disaster-resilience.md) | Microgrid, metering/billing, customer protection, resilience hub and recovery model |
| [11 — Housing pathways and support intensity](11-housing-pathways-and-support-intensity.md) | Social housing context, cost units, specialist pathways, early intervention and site safety |
| [12 — QualiaDB/Webizen WASM development register](12-qualia-wasm-development-register.md) | Required upstream runtime changes, Civics compatibility contract and acceptance fixtures |
| [13 — Web Civics profile](13-web-civics-profile.md) | Dataset requirements, input/output contract, formats and QualiaDB WASM implementation boundary |
| [15 — Economic and statistical models](15-economic-and-statistical-models.md) | Executable separated-ledger appraisal, statistics, sensitivity and model-package contract |
| [16 — Demographic acquisition and presentation](16-demographic-acquisition-and-presentation.md) | Ordered public-release queue, admission workflow and non-profiling presentation rules |
| [14 — QualiaDB wasm-webcivics acceptance review](14-qualia-wasm-webcivics-acceptance-review.md) | Agent checklist to verify Solid RDF + device storage pin, run fixtures, Accept or return fix feedback |
| [Research catalogue](../../../data/research-catalogue/README.md) | Machine-readable candidate sources, RDF compiler/validator and source-admission lifecycle |
| [Evaluation ontology](../../../ontology/evaluation.ttl) | Versioned PROV/DCAT/SKOS/SHACL vocabulary for releases, observations, assessments, parameters and runs |

## Starting position

The modelling lab already evaluates a 27-sheet financial workbook, with 5,811 formula cells matching its stored baseline. It includes scenario analysis, attribution/deadweight/displacement assumptions, sensitivity analysis, a research register and a qualification register. The accumulated report contains saved results and the current financial state.

The research register contains **143 entries**, including **18 labelled “Open — critical”**. The qualification register contains **56 entries**. These labels are inherited workbook assertions, not fresh verification of the cited sources. Much of this information is currently disconnected from the headline results in the report interface.

The bundled QualiaDB 0.0.39 artifact identifies itself as the `full` profile, but the site currently calls it mainly for hashing and storage estimates. A discovery probe successfully loaded the registers as RDF and queried them through its `WasmHealthStore`. This establishes a useful migration starting point; it does not establish the intended Q42 or modal-reasoning integration.

## Scope across the whole proposition

Use one evidence and evaluation framework, with sector modules and separate accounting boundaries:

| Area | Decisions to support | Distinctive evidence |
|---|---|---|
| Community grounds and supported accommodation | Location, capacity, service design, staged capital and operating support | Housing need, suitability, support intensity, tenure, local costs and participant outcomes |
| Energy, water and resilience infrastructure | Retrofit versus replacement; solar/storage; islanding; thermal and water options | Interval loads, seasonal weather, equipment curves, outages, water quality and maintenance |
| Digital cooperative and sovereign services | Demand, capacity, service levels, hosting and interoperability | Customer evidence, measured workload, hardware lifecycle, power/cooling, recovery and operating capability |
| Cooperative projects and contribution recognition | Pilot selection, fair compensation, project success and reuse | Contracts, cost records, delivery milestones, skills outcomes and attributable contributions |
| Public service and policy options | Prevention versus reactive services; funding and institutional alternatives | Counterfactuals, service utilisation, causal studies, fiscal incidence, distribution and wellbeing |
| International adaptation | Where a demonstrated component transfers and under what conditions | Local jurisdiction, currencies, institutions, needs, delivery partners and transferability review |

Portfolio aggregation must eliminate internal transfers and shared-cost overlap. Large ecosystem opportunities remain distinguishable from the specific site or programme being appraised. Global need is context until an explicit route to addressable demand and attributable outcomes is evidenced.

## Core product requirements

1. **A shared case definition.** State the decision, decision maker, jurisdiction, affected populations, baseline, alternatives, analysis period and price basis before comparing outcomes.
2. **Traceable inputs.** Give every material input an identifier, unit, time/place/cohort scope, source or assumption status, uncertainty and applicability review.
3. **Separate evaluation views.** Present operator finance, government fiscal effects, social economic value, technical feasibility and distributional consequences with explicit reconciliation.
4. **Inspectable reasoning.** Show supporting evidence, counterevidence, rules, exceptions, missing inputs and the impact of changing assumptions.
5. **Reproducible reports.** Freeze inputs, datasets, calculation versions and rules with the report; keep live edits separate from issued versions.
6. **A learning cycle.** Translate an approved pilot into a measurement plan and compare observed results with forecasts without rewriting the original appraisal.

## Architectural decisions already made

| Decision | Basis |
|---|---|
| QualiaDB is the intended semantic runtime | User direction; use its graph, logic and scientific capabilities proportionately |
| Target `wasm-logic` | User direction; current Cargo feature closure includes `wasm-scientific` |
| Keep canonical RDF and source snapshots alongside compiled Q42 products | Enables audit, recompilation, interoperability and recovery from format changes |
| Establish one versioned case/run/report contract | Prevents different report sections silently referring to different assumptions |
| Retain the current formula evaluator initially | It is a tested baseline; migrate calculations only after equivalence is demonstrated |
| Treat stakeholder values and contested claims explicitly | A single aggregate score cannot represent every economic, social or technical judgement |
| Build offline-capable evaluation with explicit data updates | Issued reports must not change when an upstream “latest release” changes |

Selecting `wasm-logic` does not commit the project to a renderer or LLM interface. Feature inclusion, exported functions and demonstrated browser behaviour are separate facts. Scientific calculations should be introduced where they improve a specific model and can be independently checked.

## Sequence and completion

The implementation order is: runtime contract → Q42/evidence pipeline → run/provenance model → economic and technical reconciliation → social and logic modules → report workflow → sector expansion and field validation. Detailed work packages and acceptance gates are in [05](05-delivery-and-acceptance.md).

The first complete release should support a community-ground infrastructure case with a baseline and at least two alternatives, an evidence explorer, financial/fiscal/economic comparisons, technical constraints, distributional outcomes, sensitivity analysis and a reproducible decision report. Subsequent releases apply the same contracts to digital cooperation, contribution systems, policy options and international adaptation. These are successive increments of the full programme, not separate disconnected calculators.

Completion means that another reviewer can reconstruct the result, identify the evidence and limits behind it, challenge an assumption, see the consequences and record a reasoned decision. Producing a polished PDF alone is insufficient.
