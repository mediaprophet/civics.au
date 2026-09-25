# 02 — Semantic model and dataset programme

## The evidence chain

A source document, a statement extracted from it, a model assumption and a decision conclusion are different things. Represent them separately:

`Dataset release → observation → applicability assessment → parameter → calculation → outcome → claim → decision`

Each transition records who or what made it, the method/version, when it happened and why it is appropriate. Preserve rejected mappings and counterevidence. A source marked “Verified” in an imported register remains a reported status until a reviewer records what was verified and for which purpose.

## Core entities

| Entity | Minimum properties |
|---|---|
| Case | Decision question, sponsor, jurisdiction, geographic scope, affected groups, stage, owner |
| Option | Intervention, scope, baseline relationship, delivery dependencies, resources, alternatives considered |
| DatasetRelease | Publisher, release ID, licence, exact source, observation period, retrieval time, hash, coverage, revision relationship |
| Observation | Indicator, value, unit, population/cohort, geography/version, period, method, uncertainty, source locator |
| EvidenceAssessment | Source/observation, claim or parameter assessed, applicability rationale, quality dimensions, reviewer, date, expiry/review trigger |
| Parameter | Stable identifier, value/range, units, currency/price year, period, source-or-assumption status, override reason |
| Calculation | Function/version, input bindings, numerical convention, output, run ID, error/tolerance |
| Outcome | Beneficiary or affected group, baseline, incremental quantity, timing, persistence, causal pathway, unintended effects |
| Valuation | Outcome quantity, unit value, valuation method, adjustments, perspective, price basis, overlap category |
| Constraint | Technical, delivery, legal, environmental or social condition; test; authority; evidence; status |
| Claim | Precise proposition, scope, supporting/counterevidence, derivation, qualification and review status |
| RuleSet | Version, author/reviewer, jurisdiction, effective period, premises, exceptions, priority and supported logic subset |
| Run | Frozen inputs, datasets, formulas, rules, runtime, uncertainty settings, seed where relevant and results |
| Decision | Options considered, rationale, decision maker, conditions, dissent, review date and monitoring commitments |
| ReportRelease | Run references, audience, sections, disclosure rules, template version, integrity manifest and issue history |

Use stable concept IDs with adapters to workbook cells. `Assumptions!D20` is a location in version 18, not a durable definition of avoided service cost. Keep the cell mapping versioned so future workbooks and native modules can use the same parameter identity.

## Vocabulary strategy

Use a small civics vocabulary for case, option, parameter, outcome, constraint and decision semantics. Reuse [PROV-O](https://www.w3.org/TR/prov-o/) for derivations and activities, [DCAT 3](https://www.w3.org/TR/vocab-dcat-3/) for dataset catalogues and [SHACL](https://www.w3.org/TR/shacl/) for validation. Adopt controlled units and geographic identifiers with explicit versions. Record equivalence mappings rather than assuming similarly named terms mean the same thing.

Use controlled classifications for accounting perspective, evidence status and outcome domain. Preserve the original source classification alongside the normalised value. Keep the supported SHACL and rule subset documented and tested; “has SHACL” is not evidence of full specification coverage.

Conceptual graph example (schema sketch, not an implemented ontology):

```turtle
@prefix c: <https://civics.au/ns/evaluation#> .
@prefix prov: <http://www.w3.org/ns/prov#> .

c:run-001 a c:EvaluationRun ;
  c:compares c:baseline, c:staged-ground ;
  prov:used c:population-release, c:site-cost-quote, c:assumptions-001 .

c:avoided-service-cost a c:Parameter ;
  c:hasAssessment c:transferability-review ;
  c:status c:ScenarioAssumption .

c:service-cost-claim a c:Claim ;
  c:derivedIn c:run-001 ;
  c:dependsOn c:avoided-service-cost ;
  c:qualification "Local causal effect and cash-releasing share remain unverified." .
```

Do not populate this example with a published service-cost estimate and imply it is a locally realised benefit. An applicability assessment is part of the model, not a citation decoration.

## Dataset priorities

The table identifies candidate source families and intended uses. Apart from the existing workbook and weather files, these are **planned integrations**, not ingested or validated datasets. Freeze a specific release and check its licence and schema during implementation; do not silently follow a changing latest-release URL.

| ID / priority | Source | Intended use | Required qualification |
|---|---|---|---|
| D01 / first | Existing Research Inputs, Qualification Register, Next-Draft Basis and assumptions | Seed claims, evidence gaps, rejected propositions and cell mappings | Historical workbook statuses; missing source documents remain missing |
| D02 / first | Existing BOM solar/minimum/maximum temperature grids | Link current technical models to spatial inputs and source metadata | Current files are 2024 averages at 0.5° output resolution, not a long-run climate normal or site design extreme |
| D03 / first | [ABS Data by region](https://www.abs.gov.au/methodologies/data-region-methodology/2011-25) and [Data API](https://www.abs.gov.au/statistics/application-programming-interfaces-apis/data-api-user-guide) | Population, housing, income, labour and regional context | Pin ASGS/LGA edition and reference period; availability and freshness vary by dataflow |
| D04 / first | [ABS SEIFA 2021](https://www.abs.gov.au/statistics/people/people-and-communities/socio-economic-indexes-areas-seifa-australia/2021) | Area disadvantage context and distributional reporting | An area ranking does not classify an individual; do not treat ranks as monetary values |
| D05 / first | [AIHW Specialist Homelessness Services](https://www.aihw.gov.au/reports-data/health-welfare-services/homelessness-services/overview) | Service use, cohorts, outcomes and unmet-need context | Service users are not the entire population in need; geography, suppression and comparability constraints apply |
| D06 / first | [Productivity Commission housing/homelessness RoGS](https://www.pc.gov.au/ongoing/report-on-government-services/housing-homelessness/) | Service expenditure and outcome benchmarks | Average expenditure is not automatically marginal avoidable cost or a causal effect |
| D07 / first | [NSW CBA guide](https://www.nsw.gov.au/nsw-government/public-sector/financial-information-for-public-entities/centre-for-economic-evidence/nsw-government-investment-framework/government-guide-to-cost-benefit-analysis) and [Outcome Values Database](https://www.nsw.gov.au/nsw-government/public-sector/financial-information-for-public-entities/centre-for-economic-evidence/tools-resources) | Versioned appraisal-method and valuation reference packs | Confirm jurisdiction, population, price year and benefit-transfer suitability; no universal discount-rate default |
| D08 / first | Project quotes, bills, interval meters, site surveys, water tests and service plans | Local capex/opex, physical demand, feasibility and commissioning evidence | Named issuer, scope, date, exclusions, tax basis, validity and review responsibility |
| D09 / next | [BOM long-run solar products](https://www.bom.gov.au/climate/maps/averages/solar-exposure/) and suitable station/interval data | Seasonality, weather variability and stress testing | A long-run average still does not establish extreme-event resilience |
| D10 / next | [CSIRO GenCost](https://www.csiro.au/en/research/technology-space/energy/Electricity-transition/GenCost) and [AEMO IASR](https://www.aemo.com.au/energy-systems/major-publications/integrated-system-plan-isp/2026-integrated-system-plan-isp/2025-26-inputs-assumptions-and-scenarios) | Technology cost ranges and scenario context | Utility/system assumptions require adaptation to a community-scale installation; distinguish draft and final releases |
| D11 / next | [DCCEEW National Greenhouse Accounts Factors](https://www.dcceew.gov.au/climate-change/publications/national-greenhouse-accounts-factors-2025) | Emissions accounting by activity, state, scope and year | Average accounting factors do not automatically represent marginal avoided emissions or carbon prices |
| D12 / next | Council/state planning and hazard layers; cadastral and service-network data | Land use, access, flood/fire exposure, connection requirements | Select the actual site's competent sources; metadata, scale and current instruments matter |
| D13 / next | Local participant co-design, provider observations and pilot follow-up | Suitability, accessibility, autonomy, wellbeing, service outcomes and adverse effects | Consent, missingness, attrition, selection bias, small-cohort disclosure and participant interpretation |
| D14 / next | Digital-service contracts, demand interviews, measured workloads and hardware quotes | Storage/compute demand, paid uptake, reliability, capacity and lifecycle economics | Distinguish ecosystem demand from provider share, expressed interest from contracts and peak from average loads |
| D15 / expansion | Cooperative contracts, contribution records, delivery histories and project reuse | Fair-value costs, attribution, delivery probabilities and distribution | A logged contribution does not itself establish payment entitlement; fair value and accepted terms are separate records |
| D16 / expansion | Local counterpart statistics and evaluation studies in partner jurisdictions | International transfer and comparison | Preserve original currencies/price years; exchange-rate conversion alone does not establish comparable welfare values |

Treat methodology documents as method packs, not observations. Treat linked studies as evidence, not automatically reusable valuation tables. Maintain separate source discovery, ingestion, applicability and model-admission states.

## Dataset contract

Each package needs: dataset ID/version; publisher; original and retrieval dates; observation periods; geography IDs and boundary edition; population/denominator; units and currency; price year and nominal/real basis; schema; extraction/mapping recipe; source and output hashes; licence/access classification; quality notes; revision relationships; responsible steward; required runtime/format; validation results; and expected refresh/review trigger.

Each observation must retain its exact source locator and original value. Derived fields store the transformation and input references. Normalisation must explicitly handle:

- Stock versus flow, person versus household, annual versus multi-year totals and calendar versus financial years.
- AUD versus other currencies, constant versus current prices, GST treatment and index series/base periods.
- Geographic boundary changes, correspondence weights and non-additive indicators.
- Counts, percentages, denominators, sampling intervals and suppressed/missing cells.
- Population estimates, observed outcomes, forecasts, scenarios and expert assumptions.
- Excel serial dates versus textual dates; publication date versus the period a study actually observed.

Missing or suppressed values stay missing. Do not fill them with zero, an area mean or an adjacent period unless a separately labelled estimation method is chosen.

## Applying sources to model inputs

Start with manually reviewed mappings for material inputs. A mapping includes parameter ID, workbook/function binding, candidate observations, selection rationale, adjustment method, uncertainty, jurisdiction/cohort compatibility and reviewer.

Prioritise avoided-service-cost assumptions, participation and growth, occupancy, support costs, project success and paid digital demand. The existing workbook references high-cost homelessness cohorts; the mapping must retain the original cohort and study period so the value cannot silently become an average for every participant.

Classify each input as measured locally, sourced and applicable, transferred with adjustment, expert estimate, scenario assumption or unresolved. Keep confidence dimensions separate: source quality, causal strength, transferability, precision and recency. Avoid converting them into an unexplained universal confidence percentage.

## Update and provenance lifecycle

Stage new releases; compare schemas and values; identify affected parameters, runs and claims; show a change summary; obtain the relevant review; then activate the release for new work. Keep old releases available for historical reproduction. Superseding a dataset should mark dependent reports as using an older release, not retroactively change them.

Store source availability and verification results separately from hashes. A hash detects a changed artifact; it does not prove the claim, issuer, licence or interpretation. An unavailable document can remain cited historically, with accessibility and verification limits disclosed.

The initial evidence probe preserves raw register fields and source references. It intentionally does not infer assumption links, normalise dates, assign new verification status or calculate benefit eligibility. Those actions require the reviewed mappings described here.
