// A deliberately non-ranking model for locally agreed, temporary opportunities.
// It produces a separated benefit ledger and readiness gates, never an eligibility score.
export const MODEL_VERSION = '0.1.0';
const pathways = new Set(Array.from({ length: 30 }, (_, index) => `P${String(index + 1).padStart(2, '0')}`));
const requiredSafeguards = [
  'hostAgreement', 'fairTerms', 'localConsultation', 'localWorkerImpactReviewed',
  'safetyAndAccessibilityPlan', 'privacyAndPublicityConsent', 'accommodationAndExitPlan',
];
const moneyFields = [
  'contributorPaymentAud', 'contributorExpensesReimbursedAud', 'localSupplierSpendAud',
  'incrementalHostRevenueAud', 'hostDeliveryCostAud', 'publicFundingAud',
];
const contextDomains = new Set(['demographics', 'income', 'housing', 'labour', 'services', 'culture', 'environment']);
const innovationStages = new Set(['research', 'development', 'demonstration', 'deployment']);
const innovationSafeguards = [
  'communityMandate', 'existingInitiativesMapped', 'fairContributionTerms',
  'dataAndIpGovernanceAgreed', 'safetyAndRegulatoryPlan', 'maintenanceAndExitPlan',
];
const digitalSafeguards = [
  'communityMandate', 'merchantAndProviderConsent', 'interoperabilityConformanceRecorded',
  'dataRightsAndSecurityAgreed', 'fairCompetitionAndFeeReview', 'credentialPrivacyAndAccessPolicy', 'operatingAndExitPlan',
];
const digitalMoneyFields = ['baselineExternalPlatformCostAud', 'proposedLocalOperatingCostAud', 'implementationCostAud'];
const digitalCountFields = ['consentedProvidersListed', 'providersWithOnlineShop', 'providersWithInventoryIntegration', 'itineraryReadyProviders'];
const energySafeguards = [
  'participantSiteAgreements', 'jurisdictionAndRegulatoryReview', 'meteringAccuracyAndDataGovernance',
  'customerProtectionAndDisputePlan', 'engineeringAndNetworkApproval', 'criticalLoadAndIslandingTest',
  'emergencyAgencyCoordination', 'accessibilityAndSpecialistReferralPlan', 'maintenanceAndRecoveryExercisePlan',
];
const energyMoneyFields = ['baselineEnergyCostAud', 'projectedEnergyCostAud', 'capitalCostAud', 'annualOperatingCostAud'];
const housingSafeguards = [
  'housingAuthorityAndServiceConsultation', 'independentSuitabilityAndReferralProtocol', 'specialistPathwaysAndDischargeCoordination',
  'caseCostDefinitionAndPriceBasis', 'overlapAndDoubleCountingReview', 'noDisplacementOfHigherNeedHousing',
  'siteSafeguardingAndResidentVoice', 'emergencyResponseAndPoliceEscalationProtocol', 'outcomeAndAdverseEffectMeasurementPlan',
];

const isPlainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isMoney = value => value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);

export function validateCommunityOpportunity(scenario) {
  const failures = [];
  const town = scenario?.town;
  const opportunity = scenario?.opportunity;
  if (!isPlainObject(town)) failures.push('A town/community profile is required.');
  if (!isPlainObject(opportunity)) failures.push('An opportunity is required.');
  for (const field of ['id', 'name', 'geographyVersion']) if (!town?.[field]) failures.push(`Town: missing ${field}.`);
  for (const field of ['id', 'title', 'type', 'needStatement', 'contributorPathway', 'contribution']) if (!opportunity?.[field]) failures.push(`Opportunity: missing ${field}.`);
  if (opportunity?.contributorPathway && !pathways.has(opportunity.contributorPathway)) failures.push(`Unknown contributor pathway: ${opportunity.contributorPathway}.`);
  if (!Array.isArray(town?.contextEvidence) || town.contextEvidence.length === 0) failures.push('Town: contextEvidence is required.');
  if (!Array.isArray(opportunity?.needEvidence) || opportunity.needEvidence.length === 0) failures.push('Opportunity: needEvidence is required.');
  if (!Array.isArray(town?.contextLimitations) || town.contextLimitations.length === 0) failures.push('Town: contextLimitations is required.');
  if (!Array.isArray(town?.contextIndicators) || town.contextIndicators.length === 0) failures.push('Town: contextIndicators is required.');
  for (const indicator of town?.contextIndicators ?? []) {
    for (const field of ['id', 'domain', 'label', 'unit', 'referencePeriod', 'sourceDatasetId', 'limitation']) if (!indicator[field]) failures.push(`Context indicator ${indicator.id ?? '<missing>'}: missing ${field}.`);
    if (!contextDomains.has(indicator.domain)) failures.push(`Context indicator ${indicator.id ?? '<missing>'}: invalid domain.`);
    if (indicator.value !== null && !['number', 'string'].includes(typeof indicator.value)) failures.push(`Context indicator ${indicator.id ?? '<missing>'}: value must be a number, string or null.`);
    if (!/^D\d{2}-[A-Z0-9-]+$/.test(indicator.sourceDatasetId ?? '')) failures.push(`Context indicator ${indicator.id ?? '<missing>'}: sourceDatasetId must be a catalogue ID.`);
  }
  if (town?.innovationInfrastructure !== undefined) {
    if (!isPlainObject(town.innovationInfrastructure)) failures.push('Town: innovationInfrastructure must be an object.');
    if (!Array.isArray(town.innovationInfrastructure?.evidence) || town.innovationInfrastructure.evidence.length === 0) failures.push('Town: innovation infrastructure evidence is required.');
    if (!Array.isArray(town.innovationInfrastructure?.facilities) || town.innovationInfrastructure.facilities.length === 0) failures.push('Town: innovation infrastructure facilities are required.');
    if (!town.innovationInfrastructure?.assessment) failures.push('Town: innovation infrastructure assessment is required.');
  }
  if (town?.digitalEconomy !== undefined) {
    if (!isPlainObject(town.digitalEconomy)) failures.push('Town: digitalEconomy must be an object.');
    if (!Array.isArray(town.digitalEconomy?.evidence) || town.digitalEconomy.evidence.length === 0) failures.push('Town: digital economy evidence is required.');
    if (!Array.isArray(town.digitalEconomy?.systems) || town.digitalEconomy.systems.length === 0) failures.push('Town: digital economy systems are required.');
    for (const field of ['localProviderInventory', 'assessment']) if (!town.digitalEconomy?.[field]) failures.push(`Town: digital economy ${field} is required.`);
    for (const field of ['referenceImplementation', 'specification', 'implementationProfile', 'conformanceEvidence']) if (!town.digitalEconomy?.interoperability?.[field]) failures.push(`Town: interoperability ${field} is required.`);
  }
  if (town?.energyResilience !== undefined) {
    if (!isPlainObject(town.energyResilience)) failures.push('Town: energyResilience must be an object.');
    if (!Array.isArray(town.energyResilience?.evidence) || town.energyResilience.evidence.length === 0) failures.push('Town: energy resilience evidence is required.');
    if (!Array.isArray(town.energyResilience?.participatingSiteTypes) || town.energyResilience.participatingSiteTypes.length === 0) failures.push('Town: participatingSiteTypes is required.');
    if (!town.energyResilience?.assessment) failures.push('Town: energy resilience assessment is required.');
  }
  if (town?.housingSystem !== undefined) {
    if (!isPlainObject(town.housingSystem)) failures.push('Town: housingSystem must be an object.');
    if (!Array.isArray(town.housingSystem?.evidence) || town.housingSystem.evidence.length === 0) failures.push('Town: housing system evidence is required.');
    if (!Array.isArray(town.housingSystem?.measures) || town.housingSystem.measures.length === 0) failures.push('Town: housing system measures are required.');
    if (!town.housingSystem?.assessment) failures.push('Town: housing system assessment is required.');
  }
  for (const field of moneyFields) if (!isMoney(opportunity?.terms?.[field])) failures.push(`Terms: ${field} must be a non-negative AUD value or null.`);
  if (!['paid', 'voluntary', 'to-be-agreed'].includes(opportunity?.terms?.paymentStatus)) failures.push('Terms: paymentStatus must be paid, voluntary or to-be-agreed.');
  if (!isPlainObject(scenario?.safeguards)) failures.push('Safeguards are required.');
  for (const field of requiredSafeguards) if (typeof scenario?.safeguards?.[field] !== 'boolean') failures.push(`Safeguards: ${field} must be boolean.`);
  if (scenario?.innovation !== undefined) {
    const innovation = scenario.innovation;
    if (!isPlainObject(innovation)) failures.push('Innovation: must be an object.');
    for (const field of ['communityLeadOrganisation', 'localProblemStatement', 'activityStage', 'benefitSharingTerms', 'dataAndIpGovernance']) if (!innovation?.[field]) failures.push(`Innovation: missing ${field}.`);
    if (!innovationStages.has(innovation?.activityStage)) failures.push('Innovation: activityStage must be research, development, demonstration or deployment.');
    if (!Array.isArray(innovation?.existingInitiativesEvidence) || innovation.existingInitiativesEvidence.length === 0) failures.push('Innovation: existingInitiativesEvidence is required.');
    if (!Array.isArray(innovation?.supportingPathways) || innovation.supportingPathways.length === 0) failures.push('Innovation: supportingPathways is required.');
    if (!Array.isArray(innovation?.infrastructureNeeds) || innovation.infrastructureNeeds.length === 0) failures.push('Innovation: infrastructureNeeds is required.');
    for (const pathway of innovation?.supportingPathways ?? []) if (!pathways.has(pathway)) failures.push(`Innovation: unknown supporting pathway ${pathway}.`);
    for (const field of innovationSafeguards) if (typeof innovation?.safeguards?.[field] !== 'boolean') failures.push(`Innovation safeguards: ${field} must be boolean.`);
  }
  if (scenario?.digitalEconomy !== undefined) {
    const digital = scenario.digitalEconomy;
    if (!isPlainObject(digital)) failures.push('Digital economy: must be an object.');
    for (const field of ['communityLeadOrganisation', 'localNeedStatement', 'credentialPolicy']) if (!digital?.[field]) failures.push(`Digital economy: missing ${field}.`);
    if (!Array.isArray(digital?.serviceInventoryEvidence) || digital.serviceInventoryEvidence.length === 0) failures.push('Digital economy: serviceInventoryEvidence is required.');
    if (!Array.isArray(digital?.systems) || digital.systems.length === 0) failures.push('Digital economy: systems are required.');
    for (const field of ['referenceImplementation', 'specification', 'implementationProfile', 'conformanceEvidence']) if (!digital?.solidCompatibility?.[field]) failures.push(`Digital economy: solidCompatibility.${field} is required.`);
    for (const field of digitalMoneyFields) if (!isMoney(digital?.economics?.[field])) failures.push(`Digital economy: ${field} must be a non-negative AUD value or null.`);
    for (const field of digitalCountFields) if (digital?.economics?.[field] !== null && (!Number.isInteger(digital?.economics?.[field]) || digital.economics[field] < 0)) failures.push(`Digital economy: ${field} must be a non-negative integer or null.`);
    for (const field of digitalSafeguards) if (typeof digital?.safeguards?.[field] !== 'boolean') failures.push(`Digital economy safeguards: ${field} must be boolean.`);
  }
  if (scenario?.energyResilience !== undefined) {
    const energy = scenario.energyResilience;
    if (!isPlainObject(energy)) failures.push('Energy resilience: must be an object.');
    for (const field of ['communityLeadOrganisation', 'microgridScope', 'meteringBilling']) if (!energy?.[field]) failures.push(`Energy resilience: missing ${field}.`);
    for (const field of ['participatingSiteEvidence', 'criticalLoadEvidence']) if (!Array.isArray(energy?.[field]) || energy[field].length === 0) failures.push(`Energy resilience: ${field} is required.`);
    for (const field of energyMoneyFields) if (!isMoney(energy?.energyEconomics?.[field])) failures.push(`Energy resilience: ${field} must be a non-negative AUD value or null.`);
    if (energy?.energyEconomics?.measuredCriticalLoadHours !== null && (!Number.isFinite(energy?.energyEconomics?.measuredCriticalLoadHours) || energy.energyEconomics.measuredCriticalLoadHours < 0)) failures.push('Energy resilience: measuredCriticalLoadHours must be non-negative or null.');
    if (!isPlainObject(energy?.resilienceHub)) failures.push('Energy resilience: resilienceHub is required.');
    if (!Array.isArray(energy?.resilienceHub?.hazardEvidence) || energy.resilienceHub.hazardEvidence.length === 0) failures.push('Energy resilience: resilienceHub.hazardEvidence is required.');
    if (!Array.isArray(energy?.resilienceHub?.serviceRoles) || energy.resilienceHub.serviceRoles.length === 0) failures.push('Energy resilience: resilienceHub.serviceRoles is required.');
    if (!energy?.resilienceHub?.recoverySupport) failures.push('Energy resilience: resilienceHub.recoverySupport is required.');
    for (const field of energySafeguards) if (typeof energy?.safeguards?.[field] !== 'boolean') failures.push(`Energy resilience safeguards: ${field} must be boolean.`);
  }
  if (scenario?.housingPathways !== undefined) {
    const housing = scenario.housingPathways;
    if (!isPlainObject(housing)) failures.push('Housing pathways: must be an object.');
    for (const field of ['housingSystemEvidence', 'systemMeasures', 'caseCostRecords', 'highNeedPathways']) if (!Array.isArray(housing?.[field]) || housing[field].length === 0) failures.push(`Housing pathways: ${field} is required.`);
    for (const field of ['earlyIntervention', 'siteSafety']) if (!housing?.[field]) failures.push(`Housing pathways: ${field} is required.`);
    for (const measure of housing?.systemMeasures ?? []) {
      for (const field of ['id', 'unit', 'referencePeriod', 'sourceDatasetId', 'limitation']) if (!measure[field]) failures.push(`Housing system measure ${measure.id ?? '<missing>'}: missing ${field}.`);
      if (measure.value !== null && !['number', 'string'].includes(typeof measure.value)) failures.push(`Housing system measure ${measure.id ?? '<missing>'}: value must be a number, string or null.`);
    }
    for (const record of housing?.caseCostRecords ?? []) {
      for (const field of ['id', 'caseType', 'unit', 'referencePeriod', 'priceYear', 'perspective', 'sourceDatasetId', 'limitation']) if (!record[field]) failures.push(`Case cost ${record.id ?? '<missing>'}: missing ${field}.`);
      if (record.valueAud !== null && (!Number.isFinite(record.valueAud) || record.valueAud < 0)) failures.push(`Case cost ${record.id ?? '<missing>'}: valueAud must be non-negative or null.`);
    }
    for (const field of housingSafeguards) if (typeof housing?.safeguards?.[field] !== 'boolean') failures.push(`Housing pathways safeguards: ${field} must be boolean.`);
  }
  if (failures.length) throw new Error(`Community opportunity validation failed:\n- ${failures.join('\n- ')}`);
}

export function assessCommunityOpportunity(scenario) {
  validateCommunityOpportunity(scenario);
  const { town, opportunity, outcomes, safeguards } = scenario;
  const terms = opportunity.terms;
  const blockers = requiredSafeguards.filter(field => !safeguards[field]);
  const missingMoney = moneyFields.filter(field => terms[field] === null);
  const measured = field => terms[field] !== null;
  const hostNetPosition = measured('incrementalHostRevenueAud') && measured('publicFundingAud') && measured('hostDeliveryCostAud')
    ? terms.incrementalHostRevenueAud + terms.publicFundingAud - terms.hostDeliveryCostAud
    : null;
  const innovation = scenario.innovation ? {
    status: innovationSafeguards.every(field => scenario.innovation.safeguards[field]) ? 'ready-for-rdd-design' : 'not-ready-for-rdd',
    communityLeadOrganisation: scenario.innovation.communityLeadOrganisation,
    localProblemStatement: scenario.innovation.localProblemStatement,
    activityStage: scenario.innovation.activityStage,
    existingInitiativesEvidence: scenario.innovation.existingInitiativesEvidence,
    supportingPathways: scenario.innovation.supportingPathways,
    infrastructureNeeds: scenario.innovation.infrastructureNeeds,
    unresolved: innovationSafeguards.filter(field => !scenario.innovation.safeguards[field]),
    benefitSharingTerms: scenario.innovation.benefitSharingTerms,
    dataAndIpGovernance: scenario.innovation.dataAndIpGovernance,
    note: 'Visitors support locally led RD&D by invitation. This is not evidence that the activity will succeed, create jobs or deliver a financial return.',
  } : { status: 'not-defined', note: 'No community-led RD&D activity is proposed in this opportunity.' };
  const digitalEconomy = scenario.digitalEconomy ? (() => {
    const digital = scenario.digitalEconomy;
    const economics = digital.economics;
    const costDifference = digitalMoneyFields.slice(0, 2).every(field => economics[field] !== null)
      ? economics.baselineExternalPlatformCostAud - economics.proposedLocalOperatingCostAud
      : null;
    return {
      status: digitalSafeguards.every(field => digital.safeguards[field]) ? 'ready-for-digital-service-design' : 'not-ready-for-digital-service',
      communityLeadOrganisation: digital.communityLeadOrganisation,
      localNeedStatement: digital.localNeedStatement,
      serviceInventoryEvidence: digital.serviceInventoryEvidence,
      systems: digital.systems,
      solidCompatibility: digital.solidCompatibility,
      discoveryAndCommerceLedger: { ...economics, annualOperatingCostDifferenceAud: costDifference, note: 'A cost difference is an accounting comparison, not a proven community benefit. It excludes unmeasured migration, support, payment, compliance, fraud, consumer-protection and opportunity costs.' },
      credentialPolicy: digital.credentialPolicy,
      unresolved: digitalSafeguards.filter(field => !digital.safeguards[field]),
      note: 'A Solid-compatible layer may support interoperable, consent-based data access. It does not itself establish online selling, inventory, booking, itinerary, payment, discount eligibility or reduced platform fees.',
    };
  })() : { status: 'not-defined', note: 'No local digital-economy service is proposed in this opportunity.' };
  const energyResilience = scenario.energyResilience ? (() => {
    const energy = scenario.energyResilience;
    const economics = energy.energyEconomics;
    const annualCostDifference = economics.baselineEnergyCostAud !== null && economics.projectedEnergyCostAud !== null
      ? economics.baselineEnergyCostAud - economics.projectedEnergyCostAud
      : null;
    return {
      status: energySafeguards.every(field => energy.safeguards[field]) ? 'ready-for-engineered-pilot-design' : 'not-ready-for-energy-resilience-pilot',
      communityLeadOrganisation: energy.communityLeadOrganisation,
      participatingSiteEvidence: energy.participatingSiteEvidence,
      criticalLoadEvidence: energy.criticalLoadEvidence,
      microgridScope: energy.microgridScope,
      meteringBilling: energy.meteringBilling,
      energyLedger: { ...economics, annualEnergyCostDifferenceAud: annualCostDifference, note: 'A projected cost difference is a scenario comparison, not a bill saving or avoided-disaster-cost claim. It excludes tariff changes, network charges, losses, financing, maintenance, customer migration and unmeasured outage effects unless separately evidenced.' },
      resilienceHub: energy.resilienceHub,
      unresolved: energySafeguards.filter(field => !energy.safeguards[field]),
      note: 'Metering software does not authorise energy retailing or billing. A resilience hub is a planned service role, not a substitute for emergency management, specialist accommodation, health care or disaster recovery authorities.',
    };
  })() : { status: 'not-defined', note: 'No microgrid, metering/billing or disaster-recovery support programme is proposed in this opportunity.' };
  const housingPathways = scenario.housingPathways ? (() => {
    const housing = scenario.housingPathways;
    return {
      status: housingSafeguards.every(field => housing.safeguards[field]) ? 'ready-for-housing-pathway-pilot-design' : 'not-ready-for-housing-pathway-pilot',
      housingSystemEvidence: housing.housingSystemEvidence,
      systemMeasures: housing.systemMeasures,
      caseCostRecords: housing.caseCostRecords,
      highNeedPathways: housing.highNeedPathways,
      earlyIntervention: housing.earlyIntervention,
      siteSafety: housing.siteSafety,
      unresolved: housingSafeguards.filter(field => !housing.safeguards[field]),
      note: 'Dwellings, households, waitlists, greatest-need applicants, allocations and service expenditure remain separate series. Any reduction in housing/service demand or police involvement is a measured hypothesis, never assumed from lower cost or a site rule.',
    };
  })() : { status: 'not-defined', note: 'No public/community-housing and early-intervention pathway analysis is proposed in this opportunity.' };
  return {
    modelVersion: MODEL_VERSION,
    decisionUnit: 'locally agreed, time-bounded opportunity',
    town: { id: town.id, name: town.name, geographyVersion: town.geographyVersion, contextEvidence: town.contextEvidence, contextIndicators: town.contextIndicators, limitations: town.contextLimitations },
    opportunity: { id: opportunity.id, title: opportunity.title, type: opportunity.type, contributorPathway: opportunity.contributorPathway },
    readiness: {
      status: blockers.length ? 'not-ready-for-pilot' : 'ready-for-pilot-design',
      blockers,
      note: 'Readiness does not establish benefits, legal compliance or a decision to proceed.',
    },
    economicLedger: {
      contributorPaymentAud: terms.contributorPaymentAud,
      contributorExpensesReimbursedAud: terms.contributorExpensesReimbursedAud,
      localSupplierSpendAud: terms.localSupplierSpendAud,
      incrementalHostRevenueAud: terms.incrementalHostRevenueAud,
      hostDeliveryCostAud: terms.hostDeliveryCostAud,
      publicFundingAud: terms.publicFundingAud,
      hostNetPositionAud: hostNetPosition,
      missingFields: missingMoney,
      note: 'These are traceable cash-flow fields, not a community welfare total. No multiplier, avoided cost or cultural value is inferred.',
    },
    outcomeLedger: {
      economic: outcomes?.economic ?? [],
      socialCultural: outcomes?.socialCultural ?? [],
      capability: outcomes?.capability ?? [],
      note: 'Each outcome remains a hypothesis until a local measurement plan and observed evidence are attached.',
    },
    safeguards: {
      required: requiredSafeguards,
      unresolved: blockers,
      localWorkerProtection: 'Local paid-work displacement must be reviewed before a placement proceeds.',
      contributorProtection: 'Contribution terms, payment, privacy, accommodation and exit arrangements must be agreed separately from any claimed community benefit.',
    },
    innovation,
    digitalEconomy,
    energyResilience,
    housingPathways,
  };
}
