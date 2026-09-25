# 03 — Economic, technical and social evaluation

## Common case definition

Every evaluation starts with the decision sought, perspective, jurisdiction, affected groups, service area, baseline, alternatives, delivery schedule, evaluation horizon and price basis. Include a credible do-minimum baseline and explain why excluded alternatives were excluded. The baseline may include spending and change over time; it is not necessarily zero expenditure or no services.

Methods should follow the relevant commissioning body's current guidance. The [Australian Centre for Evaluation methods guide](https://evaluation.treasury.gov.au/publications/guide-economic-evaluation-methods) distinguishes economic evaluation methods according to context and questions. Maintain jurisdiction-specific method packs; do not claim a single universal approval methodology.

## Five views of the same case

| View | Question | Principal outputs |
|---|---|---|
| Operator financial | Can the operator fund, deliver and sustain the service? | Revenue/cost cash flows, financial NPV, funding gap, minimum unrestricted cash, debt and working capital |
| Government fiscal | How do receipts and expenditures change for each public body? | Budget effects, timing, cash-releasing share, capacity released and funding commitments |
| Social economic | Does the option create incremental value for the chosen community? | Economic NPV, properly defined BCR where applicable, non-monetised effects and opportunity costs |
| Technical/delivery | Can the promised service be delivered under the stated conditions? | Capacity, reliability, constraints, maintenance, dependencies, residual risks and commissioning evidence |
| Distributional/social | Who benefits, who bears costs or risk, and what matters to them? | Outcomes by group, accessibility, affordability, autonomy, harms, participation and dissent |

Do not simply sum these outputs. Operator fees can be costs to participants; a grant is an operator inflow and funder outflow; an avoided fiscal expenditure may already represent a counted resource benefit. Reconcile transfers and overlap before calculating a community-wide total.

The existing workbook's “Integrated NPV” and “Quantified benefit coverage” need explicit definitions and a reconciliation note. In particular, the coverage measure is not automatically a conventional BCR, and a sum of financial value and adjusted social benefits should not acquire a stronger economic interpretation merely through a new label.

## Economic calculation requirements

For each option, construct incremental time series relative to the baseline. Use:

`economic NPV = Σ_t (incremental benefits_t − incremental resource costs_t) / (1 + r)^t`

Document whether t=0 is the valuation date and how intra-year timing is treated. State the BCR numerator/denominator convention, because negative benefits, cost savings and alternative cost classifications can alter a ratio while leaving NPV unchanged. Undefined ratios must remain undefined.

Separate real and nominal calculations. Pair real cash flows with real rates and nominal cash flows with nominal rates; record inflation assumptions explicitly. Include replacement, degradation, maintenance, decommissioning, residual value and opportunity cost where relevant. Assess grants, tax, financing and transfers according to the chosen perspective, with a reconciliation table.

For each benefit pathway, record eligible population, exposure, incremental effect, timing, duration/drop-off and unit value. Attribution, deadweight and displacement adjustments must be defined and applied only where the causal estimate has not already accounted for them. Blindly applying every adjustment can understate benefits; omitting them can overstate them.

Track overlap with a benefit ledger: affected resource/outcome, population, period, perspective and overlap group. Examples requiring reconciliation include participant fee savings versus operator revenue, avoided service expenditure versus wellbeing valuation, energy bill savings versus electricity resource savings, and project revenue versus contributor payments.

Do not count economic activity, gross spending, revenue, transfers or employment numbers as net social benefits without a specified method. Report jobs, training and local procurement as useful distributional/output measures while separately estimating any additional welfare effect.

Avoided service expenditure requires a realistic baseline and causal evidence. Separate gross service burden, potentially avoidable utilisation, attributable change, marginal unit cost and the share that releases cash. Capacity released may be valuable without immediately reducing the agency budget.

Use cost-effectiveness or cost-consequence analysis when monetisation would be weak or inappropriate. A multi-criteria comparison can show stakeholder preferences, but publish criteria, scales, weights and sensitivity; keep non-negotiable constraints outside a compensatory weighted total.

## Technical evaluation modules

| Module | Required extension beyond a screening calculator |
|---|---|
| Energy/storage | Interval demand and generation, peak power, usable battery capacity, efficiencies, degradation, outage duration, seasonal variation, export/connection limits, replacements and service priority |
| Water/thermal | Source quality, daily and peak demand, treatment recovery, energy intensity, pumping head, thermal losses, seasonal temperature and maintenance/replacement |
| Site/housing | Access, utilities, terrain/hazards, supported accommodation suitability, operating/support capacity, staging and approval dependencies |
| Digital infrastructure | Workload definitions, usable capacity, redundancy, throughput/latency, availability, backup/restore, power/cooling, egress and staffing over the lifecycle |
| Cooperative production | Bill of materials, certified skills, tooling, capacity, failure/rework, maintenance, delivery dependencies and accepted cost allocation |

A daily energy balance is a screening result, not proof of islanding or emergency resilience. A storage capacity estimate is not proof of a service-level commitment. Each promise must point to the engineering condition and evidence needed to support it.

Use Qualia scientific functions for relevant calculations such as unit conversions, degradation curves, load statistics, numerical optimisation and uncertainty propagation after independent fixtures pass. Record precision, bounds, solver convergence and failure. Broader scientific capabilities remain available for later modules without making every capability part of the first release.

## Social evaluation

Define outcomes with participants and service providers: safety, stable accommodation, affordability, access, autonomy, social connection, participation and environmental amenity. Record participant-defined priorities alongside funder indicators. Include adverse outcomes and displaced burdens, not only positive hypotheses.

Disaggregate by relevant groups and place, while protecting small cohorts. Explain denominator, eligibility and measurement method. Avoid inferring individual vulnerability from area-level indicators. Collect participant testimony as attributed evidence with consent and context, without turning it into a fabricated numerical welfare estimate.

Show whose costs and benefits are absent from available data. Maintain dissent and alternative interpretations. Separate documented community participation from agreement or consent; one meeting does not establish either. Cultural and First Nations considerations need the relevant community's governance and interpretation, rather than an imported generic score.

## Logic capabilities and their decision role

| Logic/application | Example | Required evidence of correct implementation |
|---|---|---|
| SHACL | A monetised outcome needs a unit value, period, population and price basis | Negative fixtures identify missing/incompatible fields; coverage of supported shapes is declared |
| Rule derivation / N3 | A claim is ready for review when all material inputs have completed applicability assessments | Multi-premise rules, joins, termination and derivation traces tested in the chosen profile |
| Defeasible reasoning | A benchmark is usable unless a more specific local study invalidates its transfer | Rule priority, explicit exception and withdrawn-evidence tests |
| Epistemic | A proposition is sourced, assumed, unknown or contested from a named assessor's standpoint | Keep the assessor, scope and evidence basis; absence of knowledge is not falsity |
| Paraconsistent | Two providers disagree about available capacity | Preserve both claims and report conflict without deriving arbitrary conclusions |
| Temporal | A quote expires before planned procurement; a rule changes during delivery | Effective dates, event versus observation time, boundary dates and scenario calendars tested |
| Deontic | A report may disclose an annex only under the recorded permission; a milestone has required evidence | Connect explicit authority, scope, exceptions and review; a logical permit is not legal approval |
| Constraint/optimisation | Compare feasible combinations of storage, site capacity and operating resources | Feasibility certificates or violated constraints; no success result on solver timeout |

Treat this as a capability implementation plan, not a claim that the existing bundle already delivers every end-to-end behaviour. Local source contains both substantive kernels and placeholder helpers. Test the specific exported path and trace, rather than relying on a capability name.

Use at least four gate states: satisfied, failed, unresolved and contested. Preserve computation-incomplete as a separate technical state. A high NPV cannot override a failed required condition, and missing evidence cannot become a pass. Every gate needs a rationale, responsible reviewer and next action.

## Uncertainty and value of further evidence

Start with transparent one-way sensitivity, scenario comparisons and switching values: which input change reverses the preferred option or creates a funding shortfall? Cover effect size, participation, occupancy, support costs, construction/operating costs, timing, prices, discount rate and technical reliability.

Add Monte Carlo only after distributions and dependencies are defensible. Record distributions, truncation, correlations, sample count, convergence checks, seed and algorithm version. Do not derive probabilities from arbitrary downside/base/upside labels. Distinguish variability, measurement error, model uncertainty and disagreement about values.

Rank evidence gaps by materiality and decision sensitivity. Formal expected-value-of-information calculations require an explicit probabilistic decision model. Until then, use a transparent priority score and show its inputs rather than calling it an economic value of information.

## Worked cases required for acceptance

| Case | Comparison and evidence challenge |
|---|---|
| Community ground | Do-minimum versus staged supported accommodation versus larger integrated ground; test occupancy, support intensity, cost and suitability |
| Resilience hub | Grid-only operation versus solar/storage upgrade versus more extensive islanding; test winter loads and extended outages |
| Digital cooperative | Existing contracted services versus staged local capacity versus larger shared platform; test paid uptake, lifecycle costs and service commitments |
| Cooperative project portfolio | Conventional procurement versus pilot/cooperative delivery; test failure, rework, contribution rights and reuse attribution |
| Preventive service/policy | Current service pattern versus a specified early-intervention programme; test counterfactual, marginal cost, non-cash outcomes and harms |
| International adaptation | A demonstrated component in a new place; explicitly reject an unreviewed transfer of currency values, outcome effects or approvals |

Each fixture includes at least one unsupported benefit, conflicting source, technical constraint, adverse outcome and assumption whose change affects the recommendation. At least one case must conclude that an option should not proceed or needs redesign. This tests whether the system can challenge a case as well as present it.

## Pilot-to-evaluation feedback

An adopted pilot gets a measurement plan before operation: indicators, baseline, comparison design, follow-up periods, data responsibilities, consent, data quality checks and analysis method. Compare forecast and realised costs/outcomes, record attrition and deviations, and revise the next appraisal with explicit provenance. Do not edit the original forecast to resemble the observed outcome.
