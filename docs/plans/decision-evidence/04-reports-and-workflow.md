# 04 — Reports and the decision workflow

## User journey

1. **Define the decision.** Select a case type and jurisdiction; identify the decision maker, affected groups, decision stage, baseline and alternatives.
2. **Build the case.** Reuse site-planner and modelling-lab inputs through stable parameter IDs. Display units, source status, range and applicability beside material assumptions.
3. **Inspect the evidence.** Follow any parameter to its source and assessment. Add local evidence, record an override with a reason, or mark the input unresolved.
4. **Evaluate alternatives.** Show financial, fiscal, economic, technical and social views of the same run. Explain differences and reconcile overlap.
5. **Challenge the result.** Explore switching values, scenarios, counterevidence, distribution and required conditions. Record stakeholder disagreement.
6. **Prepare a decision report.** Choose audience and disclosure scope; freeze the run; review the claims, exclusions and evidence gaps.
7. **Record a decision and follow-up.** Capture conditions, dissent, responsibilities, next review and pilot measurement commitments. Later observations produce a new version.

The interface should use decision language: “Why this estimate?”, “Who benefits?”, “What could change the result?” and “What evidence is still needed?” Graph, Q42 and rule terminology belongs in the technical detail view where useful.

## Evidence explorer

Each material result opens an evidence panel with:

- A precise claim and its geographic, population and time scope.
- The value, units, calculation and input assumptions used in that run.
- Source title, publisher, release, locator and original value.
- Applicability assessment, uncertainty and responsible review.
- Counterevidence, exclusions, unresolved conditions and relevant qualifications.
- The sensitivity of the result to this input and the next evidence action.

Allow movement in both directions: result → source, and changed/withdrawn source → affected results and reports. A visual dependency graph is useful, but provide a keyboard-accessible table and textual trace for the same information.

## Report structure

| Section | Required content |
|---|---|
| Decision brief | Decision sought, preferred/conditional option, reasons, alternatives, material uncertainties and required next actions |
| Need and context | Local needs, existing services, cohorts, baseline trajectory and limits of available data |
| Options | Scope, service levels, delivery model, phasing, alternatives excluded and reasons |
| Method and boundaries | Perspective, jurisdiction, horizon, price basis, discounting, counterfactual, attribution and exclusions |
| Financial and fiscal case | Annual cash flows, funding gap, restricted/unrestricted funds, budget effects, capacity released and commitments |
| Economic case | Incremental benefits/costs, NPV, ratio definition where used, overlap/transfer reconciliation and unmonetised effects |
| Technical and delivery case | Engineering assumptions, capacity, resilience, lifecycle, dependencies, constraints and verification still required |
| Social and distributional case | Gains/losses by group, affordability, access, autonomy, harms, participation and dissent |
| Risk and uncertainty | Sensitivities, switching values, scenarios, any justified probability analysis and missing evidence |
| Decision conditions | Conditions satisfied/failed/unresolved/contested, reviewer/authority and actions required before the next stage |
| Implementation and evaluation | Work packages, responsibilities, milestones, measurement plan and decision review points |
| Evidence appendix | Sources, applicability assessments, exact parameter mappings, qualifications and unavailable evidence |
| Reproducibility appendix | Dataset, case, runtime, formula, rule and report versions; hashes; run manifest; calculation conventions |

Different audiences can have shorter summaries or restricted annexes, but all views must derive from the same frozen run. A council brief, funding submission, engineering annex and participant-facing explanation must not quietly use different numbers or certainty levels.

## Report language contract

Generate structured claims before narrative. Each claim carries an evidence state and a permitted wording pattern. Examples:

| State | Appropriate form |
|---|---|
| Observed local measurement | “The recorded interval data for [period] show [measure], subject to [coverage limits].” |
| Calculated scenario | “Under [assumptions], the model estimates [result].” |
| Transferred evidence | “Using [study] as a comparator, with [adjustments], the scenario estimates [result]; local applicability remains [status].” |
| Unmonetised effect | “[Outcome] is included in the distributional assessment and excluded from the monetary total.” |
| Unresolved or contested | “Available evidence does not resolve [question]. [Evidence/action] is required before [decision].” |

These are proposed wording rules, not sample project findings. Avoid generating “proven”, “guaranteed”, “compliant”, “approved” or “saves government” solely from a calculation or a positive rule result.

Use deterministic templates for tables, quantitative claims and evidence citations. Optional language-model assistance can later improve explanation or suggest missing questions, but cannot alter results, promote evidence status, invent citations or grant approvals. Any generated sentence making a factual claim must bind to a claim ID and survive a consistency check. LLM assistance is not a prerequisite for the planned runtime or first release.

## Reproducible report package

A report release is a package, not just a PDF:

| Artifact | Contents |
|---|---|
| Human-readable report | Accessible HTML plus print/PDF output with stable claim and source references |
| Run manifest | Frozen case/options, input values, units, datasets, rules, formulas, runtime, simulation settings and execution completion |
| Results | Full-precision machine-readable outputs, annual series, constraint results and presentation rounding |
| Evidence index | Source records, locators, assessments, qualifications, derivation references and permitted excerpts |
| Semantic export | RDF and, once verified, compatible Q42 representation plus format/schema metadata |
| Integrity manifest | Hash algorithms, artifact hashes, template version, issue time and supersession relationship |
| Review record | Authors/reviewers, scope of review, changes, dissent and decision conditions |

Preserve quantities as typed values rather than formatted strings such as `$2.1M`. Store the unit and price basis separately. A report can show rounded numbers while its machine-readable package retains the precision used for calculations.

Hash a canonical payload that excludes its own digest and mutable display fields. Name the hash algorithm and canonicalisation method. Digital signatures, if later added, establish signing identity/integrity within their trust model; neither a hash nor a signature proves economic validity.

External sources may be inaccessible or restricted, so record whether each package can be reproduced wholly offline or requires authorised external evidence. Include an actionable missing-artifact list. Do not claim complete reproduction when only citations were retained.

## Existing report migration

`model-app.js` currently stores accumulated entries under `civics.report.v1`; financial values and forecasts are primarily display-formatted snapshots. The print function also appends the current financial state. That behaviour must become explicit:

1. Introduce a new versioned run/report schema with raw inputs and results.
2. Preserve old entries as legacy display snapshots. Do not backfill missing provenance from today's baseline or imply the original run is reproducible.
3. Require an explicit choice to rerun a legacy case using current definitions; retain the original alongside the new run.
4. Separate “current working case” from “issued report” and from “comparison of saved runs.” A report should include the current case only when it was selected and frozen.
5. Copy legacy data before migration, verify counts and restore behaviour, then activate the new store. Handle quota errors and malformed legacy records visibly.
6. Keep existing solar, water and site-planner event integrations through adapters to the new contract. Ensure a site adjustment is reflected consistently across every dependent model before freezing a run.

## Review and release workflow

Use draft → analysed → reviewed → issued → superseded states. Review scope must be explicit: economic, engineering, source verification, participant interpretation or editorial. A document with one review does not imply review in all disciplines.

An analysis can be issued as exploratory or feasibility-stage with clear unresolved evidence. Prevent stronger claims than its evidence supports; do not make the software refuse to document uncertainty. Conditions for capital approval or operational use remain distinct from conditions for producing a feasibility report.

Record the decision maker's rationale and any departure from model rankings. A decision may legitimately prioritise an unmonetised outcome, provided the trade-off is explicit. Preserve alternate stakeholder weightings and dissent rather than forcing a single preference set.

## Acceptance examples

- A reviewer opens a public-value result and reaches its exact service-cost evidence and applicability assessment.
- A changed unit-value source produces a new comparison, while the old issued report remains byte-stable.
- A positive NPV with unresolved site feasibility produces a conditional feasibility recommendation with the unresolved condition prominent.
- A participant-facing report shows affordability and service implications without disclosing personal case evidence.
- A failed or incomplete rule run cannot yield a positive assurance statement.
- A PDF has readable tables, repeated headers, sensible page breaks and source identifiers; its figures match the HTML and machine-readable results.
