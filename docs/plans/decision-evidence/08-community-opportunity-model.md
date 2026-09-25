# 08 — Community opportunity model

This is a separate model from the camping-pathway catalogue. It asks whether a town or community could benefit from a **locally requested, temporary and fairly agreed contribution**: for example, a musician performing and sharing skills through a local venue, a technical contributor helping a community project, or a person on a purposeful break joining a defined civic activity.

It does not rank towns by disadvantage, allocate people to communities, assume a person from a pathway is available, or imply that a community must accept an outside contributor. Context statistics explain conditions; the opportunity begins only when local people and a host define a real need or possibility.

## Unit of analysis

`Community profile → locally authored opportunity → host agreement and fair terms → time-bounded contribution → observed outcomes → review`

The profile has a named geography/version, reference period and limitations. It holds a non-scoring contextual-indicator ledger across demographics, income, housing, labour, services, culture and environment. Every indicator keeps its source dataset, value, unit, period and limitation. It may use the research catalogue's ABS regional context (`D03`), SEIFA (`D04`), occupation data (`D17`), creative-work evidence (`D18`) and restricted, consent-based local evidence (`D22`). These sources never establish an individual's circumstances, eligibility or a community's willingness.

An opportunity records the host, period, locally authored need statement, pathway only at an aggregate service-pathway level, contribution scope, terms and safeguards. For the local-pub example, the relevant hypothesis could be cultural participation, local venue trading, skills exchange and future local programming—not “solving” a town's socioeconomic condition.

## Benefit ledgers

Keep the following views visible rather than combining them into a single score:

| View | Evidence required | Do not infer |
|---|---|---|
| Economic cash flow | Agreed fee/expenses, local supplier payment, incremental host revenue, delivery cost, public funding and baseline | A multiplier, profit, visitor spending or avoided public cost without a reviewed method and counterfactual |
| Cultural and social | Locally defined outcomes, voluntary participant/host feedback, repeat participation, local cultural safety and negative effects | Attendance as wellbeing, belonging or future participation |
| Capability and continuity | Skills shared, local partnerships, follow-on activity and what would persist after departure | A one-off contribution as durable capacity |
| Distribution and fairness | Contributor terms, local-worker impact, who benefits/bears costs, access and complaints | An aggregate benefit as fair distribution |
| Delivery and safety | Host agreement, accessibility, transport, privacy/publicity consent, accommodation and exit arrangements | A positive benefit estimate as a substitute for safeguards |

The model records traceable cash-flow fields but deliberately does not calculate a single net-community-benefit number. Social and cultural value may later be valued with a reviewed method, but must remain separately inspectable with its uncertainty and counterfactual.

## Community-led innovation and RD&D

The model can add an innovation ledger when an existing local organisation leads a research, development, demonstration or deployment activity. Its infrastructure profile records what is actually available or missing: work space, reliable power, connectivity, equipment, test settings, data stewardship, local partnerships and maintenance capacity. This gives a town a way to describe the practical value of shared infrastructure without assuming that a lower-income or smaller place lacks innovation capacity.

The [ABS Characteristics of Australian Business](https://www.abs.gov.au/statistics/industry/technology-and-innovation/characteristics-australian-business/2024-25) release is registered as national/state context for innovation activity, collaboration, skills, finance and barriers. It cannot diagnose an individual town. A local profile needs an inventory of existing initiatives, facilities, governance and access barriers, prepared with community members.

An RD&D activity is blocked until it has a community mandate, map of existing local initiatives, fair contribution terms, agreed data/IP governance, safety/regulatory plan and maintenance/exit plan. Visitors can bring a skill, time, tool or connection only by invitation and under the local lead's terms. Claimed outcomes—new capability, prototype performance, local procurement, jobs, service improvement or follow-on activity—remain hypotheses until measured against a stated baseline.

## Local digital economy and tourism services

The model can add a digital-economy ledger for community-governed retail, service and tourism infrastructure. It maps consented providers and their current discovery, online-shop, inventory, ordering, booking and itinerary capabilities; then records the infrastructure needed to improve them. This supports a practical sequence: provider-controlled service catalogue first, online shops and inventory connections where useful, bookings and itinerary exchange where providers consent, and an optional local credential only when its policy is fair and privacy-preserving.

A [Solid Protocol](https://solidproject.org/TR/protocol)-compatible layer is assessed as an interoperability and data-rights capability. Each claim must name the exact specification, implementation profile and independent conformance evidence. It does not itself supply payments, stock management, booking, identity eligibility or a discount programme. Those functions need their own provider agreement, operational support, security review and measurement plan.

The cash-flow view compares only stated external-platform costs, proposed operating costs and implementation costs. It does not treat a lower fee as an automatic community benefit; migration, support, payment, compliance, fraud, consumer protection and opportunity costs remain visible. A locals discount credential additionally requires a published eligibility, issuer/verifier, minimal-data, consent, offline/accessibility, complaint, retention and appeal policy. No customer transaction history is required for the town-level model.

The [ABS business-characteristics release](https://www.abs.gov.au/statistics/industry/technology-and-innovation/characteristics-australian-business/2024-25) provides broad context on ICT and innovation practices, but local retail and tourism capability must be collected through a consented provider inventory (`D27`). The digital module is blocked until local mandate, merchant/provider consent, conformance record, data-rights/security agreement, fair competition/fee review, credential policy and operating/exit plan are complete. The concrete integration boundary and staged pilot are in [09 — Solid Databox community commerce integration](09-solid-databox-community-commerce-integration.md).

## Pilot gate

No pilot is ready until all seven safeguards are resolved: host agreement, fair terms, local consultation, local worker-impact review, safety/accessibility plan, privacy/publicity consent, and accommodation/exit plan. A local-worker review is material: a temporary contributor should not displace available local paid work unless people affected have participated in a transparent agreement and mitigation is documented.

## Implemented contract

[scenario-template.json](../../../data/community-opportunity/scenario-template.json) is the human-editable input contract. [community-opportunity-model.mjs](../../../scripts/community-opportunity-model.mjs) validates it and emits the separated ledgers and readiness blockers. [community-opportunity.ttl](../../../ontology/community-opportunity.ttl) extends the evaluation ontology with community profiles, opportunities, host agreements, contribution placements and benefit hypotheses.

The first real use should be a co-designed local case with no personally identifying contributor data in the public graph. Capture the original baseline, publish only safe aggregate results, and compare observed effects with the stated hypotheses after the activity.
