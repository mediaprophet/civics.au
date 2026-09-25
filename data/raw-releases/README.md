# Raw public-release holding area

Acquired on 25 September 2026 for the Community Grounds evidence work. This directory holds **unaltered source releases** until an admission record, provenance review, transformation receipt and dataset release are produced. Files in this directory are not automatically evidence used by a model.

The acquisition contains 31 files (about 196 MiB). All 23 XLSX files were opened successfully in read-only mode after download. SHA-256 checksums are calculated again by `npm run q42:provenance`; calculate them again before admission if a file has been moved or replaced.

| Dataset family | Local files | Official source |
| --- | --- | --- |
| ABS Data by Region, 2011–25 | `abs-data-by-region-14100DO0001-2011-25.xlsx` to `abs-data-by-region-14100DO0010-2011-25.xlsx` | [methodology and downloads](https://www.abs.gov.au/methodologies/data-region-methodology/2011-25) |
| ABS business counts | `abs-business-counts-8165DC01-2022-26.xlsx` | [Counts of Australian Businesses](https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits/jul2022-jun2026) |
| ABS Census homelessness | `abs-estimating-homelessness-2021-*.xlsx` | [Estimating homelessness: Census, 2021](https://www.abs.gov.au/statistics/people/housing/estimating-homelessness-census/2021) |
| ABS tourism labour | `abs-quarterly-tourism-*-june-2026.*` | [Quarterly Tourism Labour Statistics](https://www.abs.gov.au/statistics/economy/national-accounts/quarterly-tourism-labour-statistics/latest-release) |
| ABS overseas arrivals and departures | `abs-overseas-arrivals-departures-july-2026.zip` | [July 2026 release](https://www.abs.gov.au/statistics/industry/tourism-and-transport/overseas-arrivals-and-departures-australia/jul-2026) |
| ABS business characteristics | `abs-characteristics-australian-business-2024-25.zip` | [2024–25 release](https://www.abs.gov.au/statistics/industry/technology-and-innovation/characteristics-australian-business/2024-25) |
| ABS retirement and intentions | `abs-retirement-and-retirement-intentions-2024-25.zip` | [2024–25 release](https://www.abs.gov.au/statistics/labour/employment-and-unemployment/retirement-and-retirement-intentions-australia/2024-25) |
| AIHW specialist homelessness services | `aihw-shs-monthly-june-2026.xlsx` | [Specialist homelessness services data](https://www.aihw.gov.au/reports/homelessness-services/specialist-homelessness-services-data) |
| AIHW family, domestic and sexual violence | `aihw-family-domestic-sexual-violence-all-data-2026.xlsx` | [Family, domestic and sexual violence](https://www.aihw.gov.au/family-domestic-and-sexual-violence) |
| Productivity Commission RoGS | `pc-rogs-2026-*.xlsx` and `pc-rogs-2026-*.csv` | [Housing and homelessness](https://www.pc.gov.au/ongoing/report-on-government-services/housing-homelessness/) |
| Jobs and Skills Australia | `jsa-internet-vacancies-anzsco2-sa4-august-2026.xlsx` | [Internet Vacancy Index](https://www.jobsandskills.gov.au/data/internet-vacancy-index) |
| Department of Education | `education-higher-education-all-students-2024.xlsx` | [2024 all students](https://www.education.gov.au/higher-education-statistics/resources/2024-section-2-all-students) |
| Home Affairs | `home-affairs-working-holiday-maker-report-june-2025.pdf` | [Working Holiday Maker statistics](https://www.homeaffairs.gov.au/research-and-statistics/statistics/visa-statistics/visit) |

Use the Web Civics transformation profile for bounded extraction. Large XLSX and ZIP releases must be streamed or processed in partitions; do not load a full workbook or archive into a browser heap.

`../derived-releases/` contains generated provenance packages for each artifact. These packages are not an observation-level conversion and do not make the raw releases admissible evidence.
