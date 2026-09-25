# 11 — Social housing, support intensity and early intervention

This module evaluates public and community housing context alongside alternative, voluntary early-intervention pathways. Its purpose is to test whether community grounds and related supports can safely help people whose needs can be met in that setting, while preserving scarce high-support housing and specialist services for people who need them.

It does not decide social-housing eligibility, priority or discharge. It does not regard complex substance-use support, terminal illness, hospital discharge, disability/aged-care needs, staffed youth accommodation, family violence, justice transition or other high-support circumstances as grounds for sending someone to community grounds. Responsible housing, health, disability, youth, justice and specialist services determine fit and remain accountable for their pathways.

## Supply, demand and cost records

Keep these measures separate: social-housing dwellings, occupied households, vacancies where published, waitlist households, greatest-need applicants, allocations, transfers, specialist-service capacity and unmet need. A waitlist is an administrative register of eligible households, not total underlying need; some data uses consolidated lists and coverage differs by programme and jurisdiction. Do not subtract any of these series to claim a universal housing shortfall.

[AIHW Housing assistance in Australia](https://www.aihw.gov.au/reports/housing-assistance/housing-assistance-in-australia-2026/contents/households-and-waitlists) provides release-specific dwelling, household and waitlist context. [Productivity Commission RoGS housing and homelessness](https://www.pc.gov.au/ongoing/report-on-government-services/housing-homelessness/) provides performance and expenditure data. Its cost series require care: recurrent cost per dwelling, service expenditure per population, provider cost and per-case resource use are different units, with differing scopes and jurisdictional comparability. A published average is not a marginal avoided cost and cannot become a universal “cost per person.”

Each `CaseCostRecord` in the model must name its programme/cohort, unit, perspective, reference period, price year, source and limitation. The report can compare defined alternatives only after a review of overlap, attribution, timing, capacity and cash-releasing conditions.

## Pathway distinction

| Pathway | Appropriate planning focus | Community-grounds boundary |
|---|---|---|
| High-support housing and specialist care | Secure tenure, clinical/support intensity, accessibility, staffed support, discharge planning and accountable specialist services | Never assumed to be replaceable by a lower-intensity site |
| Justice transition | Pre-release coordination, safe accommodation, service connection, legal/work support and planned follow-up | Specialist transition assessment and support determine whether any voluntary lower-intensity option is safe |
| Voluntary early intervention | Stable short/medium stay, connectivity, work/study, peer/community connection, financial/housing navigation and an exit pathway | Requires independent suitability, informed choice and an agreed referral route; it is not a way to filter people out of social housing |

The impact hypothesis is modest and testable: if a person voluntarily uses a safe, suitable early pathway and secures a durable next step, their need for an emergency or higher-intensity housing response may be delayed, reduced or avoided. Measure this against a baseline and report adverse effects, transfers to specialist services, repeat presentations and participants who decline the option. Do not claim “demand reduction” from occupancy alone.

## Safety without reliance on police

The goal is a well-designed, well-supported site where most ordinary tensions are prevented or resolved through clear expectations, resident voice, trained staff/peer support, restorative options, accessible complaints and early specialist referral. This cannot mean withholding help. The safety plan must preserve immediate emergency escalation, accurate incident recording, safeguarding, independent complaints and access to police, ambulance, fire or specialist services whenever a person needs them.

Report both helpful resolutions and harms: incident type/severity, response time, participant safety/voice, complaints, referrals, emergency calls and police attendance where it occurs. Never set a police-call target that discourages people from reporting violence, exploitation, health emergencies or other danger.

## Pilot gate

The module remains blocked until housing authorities and services are consulted; independent suitability/referral and specialist discharge pathways are defined; cost units/price bases and overlap are reviewed; higher-need housing is not displaced; site safeguarding/resident voice, emergency escalation and outcome/adverse-effect measurement are in place. The implemented input and output contract is in [scenario-template.json](../../../data/community-opportunity/scenario-template.json) and [community-opportunity-model.mjs](../../../scripts/community-opportunity-model.mjs).
