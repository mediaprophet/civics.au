# Research catalogue

`datasets.json` is the controlled discovery catalogue for the decision-evidence programme. It records candidate source families and their intended, limited uses. A record is **not** a downloaded dataset release, a verified claim, or an approved input to the financial/economic model.

## Lifecycle

1. A reviewer adds a source family here with its planned use and limitations.
2. An ingestion creates a separate `c:DatasetRelease` record with the exact release URL, retrieval time, licence result, observation period, schema/mapping version and SHA-256 hash.
3. Mapped records become `c:Observation` resources, retaining original values, source locations, periods, denominators and geography versions.
4. A scoped `c:EvidenceAssessment` and `c:ModelAdmission` decide whether a particular observation may inform a named parameter or claim.
5. A frozen evaluation run references the approved release and parameter versions. Reports cite the run, not a moving “latest” URL.

Run `node scripts/validate-research-catalogue.mjs` to validate identifiers, cross-references and source metadata, and to load the ontology and compiled catalogue graph through the bundled QualiaDB WASM parser. Add `--turtle` to print the catalogue RDF.

To process a concrete release, create a JSON package with a `release` object and `observations` array, then run `node scripts/compile-dataset-release.mjs path/to/release.json --turtle`. The release requires an exact source URI, UTC retrieval time, SHA-256, licence status, mapping/schema versions and an access/admission state. Every observation requires its original value, unit, geography/version, period, source locator, evidence state and at least one limitation. The compiler emits **staged** RDF only; a separate evidence assessment and model-admission decision is required before it can affect a calculation.

The vocabulary is [ontology/evaluation.ttl](../../ontology/evaluation.ttl). It uses PROV-O, DCAT, SKOS and SHACL terms while keeping Civics-specific evaluation semantics in `https://civics.au/ns/evaluation#`.

## Privacy and admission rules

- Public statistics stay aggregate. They do not establish individual need, suitability, lawful status, intent or demand.
- Local evidence is a restricted source family. It requires a case-specific purpose, consent and disclosure review before it can be ingested.
- Candidate, staged and governance-required records must not feed calculation parameters. Only an explicit, scoped `ModelAdmission` may do that.
- Source limitations are data. Preserve them in the RDF graph beside each release and observation.
