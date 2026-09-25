# 17 — Q42 release compilation for acquired datasets

## Purpose

Build an auditable semantic package for every acquired public source file without turning a workbook header, suppressed cell or aggregate count into an invented observation. The package records exactly what was acquired and how it relates to the research catalogue; a later reviewed mapping may add table, row, cell and observation graphs.

## Products produced now

Run:

```powershell
node scripts/build-q42-release-catalogue.mjs
```

For each file under `data/raw-releases`, the script writes `data/derived-releases/<release-id>/`:

| Product | Role |
| --- | --- |
| `release-provenance.ttl` | Readable audit view of the source release, source artifact, dataset family, official URL, publisher, source hash, byte size, format, retrieval precision, licence-review state, mapping state and intended Q42 volume. |
| `canonical.nq` | RDF dataset interchange product. It contains triples and is valid N-Quads. |
| `canonical.nt` | Same RDF triples with an N-Triples extension, retained for interoperable inspection. The native compiler now receives `canonical.nq`. |
| `wasm-parse-receipt.json` and `wasm-superblock-*.bin` | The canonical N-Triples passed through the pinned `wasm-webcivics` parser and `pack_quins_into_superblock`. These are WASM-produced Quins and 40,960-byte SuperBlocks, ready for a compliant Q42 v3 finaliser. |
| `release-manifest.json` | Machine-readable package receipt and the boundary between release provenance and observation mapping. |

`ontology/evaluation.ttl` declares `c:SourceArtifact`, `c:SemanticMapping`, `c:TransformationRun`, `c:Q42Volume` and their SHACL minimums. All current generated packages have content scope `c:ReleaseProvenanceOnly` and admission `c:GovernanceRequired`.

The current acquisition date is known only to day precision. The package uses the normalised UTC field `2026-09-25T00:00:00Z` only to meet the profile’s machine field shape, and records `retrievalTimestampPrecision` beside it. It must be replaced by the actual timestamp when an original download receipt is available.

## Observation-level conversion

Each source needs a source-specific mapping before observations can be emitted. The mapping must name the exact release hash, table/sheet, header row, primary key, cell/row locator, indicator IRI, unit, geography/version, reference period, suppression symbols, denominator and source limitation. It must then pass the Web Civics SHACL admission shapes before any analytical model uses the result.

This is especially important for multi-sheet XLSX and ZIP releases: they can mix definitions, explanatory notes, revision tables, geography keys and values. PDF is document provenance until a reviewed table extraction records page and table locators. No raw source in this batch has been interpreted as person-level data.

## Native Q42 status

The local native Qualia CLI can create a Q42 v3 volume using:

```powershell
node scripts/build-q42-release-catalogue.mjs --compile
```

The native build creates local, review-gated Q42 files for integration work after the RDF has been parsed and packed by the pinned WASM bundle. Do **not** publish, seed, web-serve or load them as browser evidence yet.

The 26 September 2026 local QW-10 work is accepted for native provenance compilation. The CLI requires `public-not-for-redistribution` as an explicit access policy, embeds lexical terms, passes `q42 verify --level full`, and denies public magnet/web-seed/IPFS transport. The N-Quads parser now preserves ordinary, language-tagged and datatype RDF literals as one lexical term; the source repair also uses `hex::encode(...)` for the CLI SHA-256 receipt.

`node scripts/build-q42-release-catalogue.mjs --compile --verify` rebuilt every acquired package: **31 volumes, 31 full-verification passes, 31 populated lexicons, and 31 `review-gated-local-only` publication states**. Each manifest records the Q42 SHA-256, size, format version, lexicon count, verification result and policy-safe publication state. These are provenance packages only; they do not assert spreadsheet observations or individual-level facts.

The remaining QW-10 acceptance work is a browser-reader compatibility receipt: the exact pinned `wasm-webcivics` artifact must open a native volume, resolve its declared terms and return the same query results before the Q42 files can be treated as browser evidence.

## Current source coverage

The source-family map covers all 31 acquired raw files: ABS Data by Region, business counts and characteristics, homelessness, tourism labour, OAD and retirement; AIHW SHS and FDSV; Department of Education higher education; Home Affairs WHM; Jobs and Skills Australia vacancies; and Productivity Commission RoGS housing and homelessness tables. AIHW FDSV is registered as `D33-AIHW-FDSV` in the research catalogue.

The source catalogue is a context and evidence-discovery instrument. Its public aggregate releases must never be used to infer an individual’s safety, housing need, eligibility, service use, likely campground use or financial situation.
