import assert from 'node:assert/strict';
import test from 'node:test';
import { assessCommunityOpportunity, validateCommunityOpportunity } from './community-opportunity-model.mjs';

const baseScenario = () => ({
  town: { id: 'urn:abs:sa2:test', name: 'Test community', geographyVersion: 'ASGS 2021', contextEvidence: ['D03-ABS-DATA-BY-REGION'], contextLimitations: ['Aggregate context only.'], contextIndicators: [{ id: 'population', domain: 'demographics', label: 'Resident population', value: 1234, unit: 'persons', referencePeriod: '2021', sourceDatasetId: 'D03-ABS-DATA-BY-REGION', limitation: 'Test context only.' }] },
  opportunity: {
    id: 'music-night-test', title: 'Local music night', type: 'cultural-programming', needStatement: 'Host and local participants have identified a trial event.',
    needEvidence: ['D22-LOCAL-EVIDENCE'], contributorPathway: 'P29', contribution: 'One fairly agreed performance and workshop.',
    terms: { paymentStatus: 'paid', contributorPaymentAud: 400, contributorExpensesReimbursedAud: 100, localSupplierSpendAud: 250, incrementalHostRevenueAud: 900, hostDeliveryCostAud: 700, publicFundingAud: 0 },
  },
  outcomes: { economic: ['Incremental host revenue measured against an agreed baseline.'], socialCultural: ['Participant feedback collected voluntarily.'], capability: ['Local follow-on activity tracked.'] },
  safeguards: { hostAgreement: true, fairTerms: true, localConsultation: true, localWorkerImpactReviewed: true, safetyAndAccessibilityPlan: true, privacyAndPublicityConsent: true, accommodationAndExitPlan: true },
});

test('the model separates cash-flow records from social and cultural outcomes', () => {
  const result = assessCommunityOpportunity(baseScenario());
  assert.equal(result.readiness.status, 'ready-for-pilot-design');
  assert.equal(result.economicLedger.hostNetPositionAud, 200);
  assert.match(result.economicLedger.note, /not a community welfare total/);
  assert.equal(result.outcomeLedger.socialCultural.length, 1);
  assert.equal(result.town.contextIndicators[0].value, 1234);
});

test('an unresolved local worker assessment blocks pilot readiness', () => {
  const scenario = baseScenario();
  scenario.safeguards.localWorkerImpactReviewed = false;
  const result = assessCommunityOpportunity(scenario);
  assert.equal(result.readiness.status, 'not-ready-for-pilot');
  assert.deepEqual(result.readiness.blockers, ['localWorkerImpactReviewed']);
});

test('unknown pathways cannot be assigned to an opportunity', () => {
  const scenario = baseScenario();
  scenario.opportunity.contributorPathway = 'P31';
  assert.throws(() => validateCommunityOpportunity(scenario), /Unknown contributor pathway/);
});

test('community-led RD&D remains blocked until governance and maintenance are agreed', () => {
  const scenario = baseScenario();
  scenario.innovation = {
    communityLeadOrganisation: 'Test community cooperative', localProblemStatement: 'Test a locally requested water-monitoring method.',
    activityStage: 'demonstration', existingInitiativesEvidence: ['D22-LOCAL-EVIDENCE'], supportingPathways: ['P20', 'P30'],
    infrastructureNeeds: ['work space', 'reliable connectivity'], benefitSharingTerms: 'Test terms.', dataAndIpGovernance: 'Test governance.',
    safeguards: { communityMandate: true, existingInitiativesMapped: true, fairContributionTerms: true, dataAndIpGovernanceAgreed: false, safetyAndRegulatoryPlan: true, maintenanceAndExitPlan: false },
  };
  const result = assessCommunityOpportunity(scenario);
  assert.equal(result.innovation.status, 'not-ready-for-rdd');
  assert.deepEqual(result.innovation.unresolved, ['dataAndIpGovernanceAgreed', 'maintenanceAndExitPlan']);
});

test('digital commerce compares stated costs without treating the difference as a benefit', () => {
  const scenario = baseScenario();
  scenario.digitalEconomy = {
    communityLeadOrganisation: 'Test business association', localNeedStatement: 'Improve consented local service discovery and ordering.',
    serviceInventoryEvidence: ['D27-LOCAL-DIGITAL-COMMERCE-INVENTORY'], systems: ['online storefront', 'service catalogue'],
    solidCompatibility: { referenceImplementation: 'Solid Databox Webcivics', specification: 'test spec', implementationProfile: 'test profile', conformanceEvidence: 'test evidence' },
    economics: { baselineExternalPlatformCostAud: 1200, proposedLocalOperatingCostAud: 800, implementationCostAud: 3000, consentedProvidersListed: 10, providersWithOnlineShop: 3, providersWithInventoryIntegration: 1, itineraryReadyProviders: 4 },
    credentialPolicy: 'Test policy.',
    safeguards: { communityMandate: true, merchantAndProviderConsent: true, interoperabilityConformanceRecorded: false, dataRightsAndSecurityAgreed: true, fairCompetitionAndFeeReview: true, credentialPrivacyAndAccessPolicy: true, operatingAndExitPlan: true },
  };
  const result = assessCommunityOpportunity(scenario);
  assert.equal(result.digitalEconomy.status, 'not-ready-for-digital-service');
  assert.equal(result.digitalEconomy.discoveryAndCommerceLedger.annualOperatingCostDifferenceAud, 400);
  assert.match(result.digitalEconomy.discoveryAndCommerceLedger.note, /not a proven community benefit/);
  assert.deepEqual(result.digitalEconomy.unresolved, ['interoperabilityConformanceRecorded']);
});

test('microgrid and recovery planning keeps customer protection and agency coordination as gates', () => {
  const scenario = baseScenario();
  scenario.energyResilience = {
    communityLeadOrganisation: 'Test resilience group', participatingSiteEvidence: ['D23-SITE-OPERATIONS'], criticalLoadEvidence: ['D23-SITE-OPERATIONS'],
    microgridScope: 'Test multi-site coordination scope.', meteringBilling: 'Test arrangement subject to regulatory review.',
    energyEconomics: { baselineEnergyCostAud: 10000, projectedEnergyCostAud: 8500, capitalCostAud: 30000, annualOperatingCostAud: 900, measuredCriticalLoadHours: 8 },
    resilienceHub: { hazardEvidence: ['D30-AIDR-DISASTER-RECOVERY'], serviceRoles: ['communications', 'support referral'], recoverySupport: 'Test coordinated support plan.' },
    safeguards: { participantSiteAgreements: true, jurisdictionAndRegulatoryReview: false, meteringAccuracyAndDataGovernance: true, customerProtectionAndDisputePlan: true, engineeringAndNetworkApproval: false, criticalLoadAndIslandingTest: true, emergencyAgencyCoordination: false, accessibilityAndSpecialistReferralPlan: true, maintenanceAndRecoveryExercisePlan: true },
  };
  const result = assessCommunityOpportunity(scenario);
  assert.equal(result.energyResilience.status, 'not-ready-for-energy-resilience-pilot');
  assert.equal(result.energyResilience.energyLedger.annualEnergyCostDifferenceAud, 1500);
  assert.match(result.energyResilience.energyLedger.note, /not a bill saving/);
  assert.deepEqual(result.energyResilience.unresolved, ['jurisdictionAndRegulatoryReview', 'engineeringAndNetworkApproval', 'emergencyAgencyCoordination']);
});

test('housing pathways preserve units and block an unassessed early-intervention claim', () => {
  const scenario = baseScenario();
  scenario.housingPathways = {
    housingSystemEvidence: ['D31-AIHW-HOUSING-ASSISTANCE', 'D32-PC-ROGS-HOUSING-HOMELESSNESS'],
    systemMeasures: [{ id: 'dwellings', value: 100, unit: 'dwellings', referencePeriod: '2025', sourceDatasetId: 'D31-AIHW-HOUSING-ASSISTANCE', limitation: 'Test context.' }],
    caseCostRecords: [{ id: 'cost', caseType: 'defined test programme', valueAud: 12000, unit: 'AUD per dwelling-year', referencePeriod: '2025', priceYear: '2025', perspective: 'government', sourceDatasetId: 'D32-PC-ROGS-HOUSING-HOMELESSNESS', limitation: 'Test context.' }],
    highNeedPathways: ['Specialist pathways remain responsible for high-support needs.'], earlyIntervention: 'Test voluntary pathway.', siteSafety: 'Test safety plan.',
    safeguards: { housingAuthorityAndServiceConsultation: true, independentSuitabilityAndReferralProtocol: false, specialistPathwaysAndDischargeCoordination: true, caseCostDefinitionAndPriceBasis: true, overlapAndDoubleCountingReview: true, noDisplacementOfHigherNeedHousing: true, siteSafeguardingAndResidentVoice: true, emergencyResponseAndPoliceEscalationProtocol: true, outcomeAndAdverseEffectMeasurementPlan: true },
  };
  const result = assessCommunityOpportunity(scenario);
  assert.equal(result.housingPathways.status, 'not-ready-for-housing-pathway-pilot');
  assert.equal(result.housingPathways.caseCostRecords[0].unit, 'AUD per dwelling-year');
  assert.match(result.housingPathways.note, /remain separate series/);
  assert.deepEqual(result.housingPathways.unresolved, ['independentSuitabilityAndReferralProtocol']);
});
