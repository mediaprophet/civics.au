# Demographic acquisition and presentation

The [demographic acquisition queue](../../../data/research-catalogue/demographic-acquisition-queue.json) sets the first public aggregate releases to acquire. It has 16 source families across population, households, disadvantage, housing, homelessness services, workforce, tourism, business capability, education, visitor mobility and retirement context.

## Release sequence

1. Acquire the exact official release file or API response and preserve the original bytes.
2. Create a `DatasetRelease` manifest with source URL, retrieval time, licence, hash, reference period, geographic edition, schema and mapping version.
3. Process it through the bounded ETL configuration in [13](13-web-civics-profile.md): parser → chunks → semantic mapping → validation → Turtle/N-Quads → optional Q42.
4. Review indicators, suppression flags, units and geography before admission for a stated case use.
5. Publish a regional baseline view only from an admitted release, including its source, date, definition, unit, geography, limitation and case applicability assessment.

The first presentation is a regional baseline table, not an aggregate “need score.” It compares selected places and periods, shows missing/suppressed data, and lets a reader open each indicator's provenance. Housing-service, visitor, student, visa and area-disadvantage figures remain distinct measures; none establishes an individual's circumstances, entitlement or likely use of community grounds.

The current environment could not retrieve an ABS release: the official endpoint returned an EOF through its network transport. No release is therefore marked acquired or displayed with invented values. Run `node scripts/validate-demographic-acquisition-queue.mjs` to check the queue against the research catalogue.

## Supplied SEIFA 2021 files

The local source folder `F:\LLMs\stats` contains the ABS SEIFA 2021 index, population-distribution and SA1-distribution packages. The first bounded import targets `Table 1` from LGA and SA2 index workbooks, producing a five-measure release package for each geography: IRSD, IRSAD, IER, IEO and usual resident population. The importer preserves each workbook SHA-256 and source cell location.

Because the files arrived without an original download receipt or a licence-review record, their generated packages stay `governance-required`. They are valid for inspection and mapping review, but cannot become a staged/published baseline until the source acquisition and ABS conditions of use are confirmed.

Generated packages: [LGA summary](../../../data/staged-releases/abs-seifa-2021-lga-table-1.json) (2,735 observations) and [SA2 summary](../../../data/staged-releases/abs-seifa-2021-sa2-table-1.json) (11,830 observations). Run `npm run seifa:check` to parse both as RDF with QualiaDB.
