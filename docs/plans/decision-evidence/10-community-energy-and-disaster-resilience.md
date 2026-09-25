# 10 — Community energy and disaster resilience

This module considers whether shared infrastructure can coordinate locally generated renewable energy, storage, demand flexibility, metering and billing across participating sites such as a community ground, supermarket, school, council facility or community service. It also considers the same infrastructure as a tested resilience capability during heat, outage, fire, flood or other disaster impacts, and through recovery and clean-up.

It does not presume that every town needs a microgrid, that a building type has an energy need, that energy can be resold under a particular arrangement, or that a site is a safe refuge. The first input is a consented inventory of actual sites, interval demand, critical loads, generation/storage, supply contracts, network constraints, hazards, service roles and existing emergency arrangements.

## Three linked decisions

| Decision | Evidence and design question | Must not be inferred |
|---|---|---|
| Physical energy system | Can measured critical loads be served safely by generation, storage, controls and islanding for a defined event? | Annual solar output as peak/outage performance or an untested design as available capacity |
| Metering, billing and customer protection | Which lawful arrangement applies: site-only, coordinated assets, embedded network, authorised retailer, exempt seller or another approved model? | That software or meters authorise retailing, billing, disconnection or tariff allocation |
| Resilience and recovery role | What can the facility safely provide before, during and after an event: communications, charging, coordination, information, supplies, support referral or planned temporary capacity? | That the site can replace evacuation, emergency management, specialist housing, health care or family-violence services |

## Evidence model

Use local site and interval-meter evidence (`D23`) as the primary input, with BOM climate context (`D02`), AEMO distributed-energy-resource context (`D28`), AER customer/metering guidance (`D29`) and Australian disaster-recovery guidance (`D30`). The AEMO DER Register can describe aggregated DER by geography; it does not establish a community's available capacity or outage performance. [AEMO DER Register](https://www.aemo.com.au/energy-systems/electricity/der-register)

Energy selling and embedded networks require a jurisdiction-specific review. The AER describes customer rights, exemption conditions, retailer choice and embedded-network-manager arrangements; availability and protections depend on the actual arrangement. [AER embedded-network guidance](https://www.aer.gov.au/consumers/understanding-energy/embedded-networks-customers)

For a candidate programme, freeze the baseline tariff/charges, meter interval data, tariff rules, allocation method, export treatment, network charges, losses, meter accuracy, data access/retention, participant agreements and complaints/exit plan. Compare a defined scenario to the same baseline. The model calls the result an **annual energy-cost difference**, never a bill saving or community benefit until invoices and customer outcomes validate it.

## Resilience and recovery design

The resilience-hub record states its hazards, critical loads, service roles, activation authority, staffing, accessibility, communications, supplies, transport, water/sanitation, security and specialist referral routes. It must be exercised and maintained. Recovery planning is community-centred, coordinated and long-term; it should build on existing local capacity and the responsible agencies' plans. [National Principles for Disaster Recovery](https://knowledge.aidr.org.au/resources/national-principles-for-disaster-recovery)

The module is blocked until participating-site agreements, regulatory review, meter/data governance, customer protection and disputes, engineering/network approval, critical-load/islanding test, emergency-agency coordination, accessibility/specialist referrals and maintenance/recovery exercise plan are all recorded. These gates prevent a financial model from offsetting an untested safety or consumer-protection failure.

## Implemented contract

[scenario-template.json](../../../data/community-opportunity/scenario-template.json) contains the `energyResilience` input. [community-opportunity-model.mjs](../../../scripts/community-opportunity-model.mjs) produces a separate energy ledger, resilience-hub plan and unresolved-gate list. The ontology represents microgrid programmes, metering/billing arrangements, critical-load plans, resilience hubs and disaster-recovery support plans.
