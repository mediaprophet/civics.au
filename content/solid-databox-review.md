# Solid & the Solid Databox — content review for civics.au

**Status:** approved direction being implemented. Git revert point: `fa83a3e` (HEAD before these edits;
working tree was clean). To revert: `git checkout -- content/pages.mjs` then `npm run build`.

**Decisions recorded (Timothy, 2026-09-24):**
- **No Webizen/QualiaDB references on the site** — they are examples of Solid-compatible software that could
  be produced to enhance capabilities, beyond the humanitarian-ICT / human-rights foundations this project
  is about. The person's side is described generically; Seraphim stays as the open-source reference agent.
- **Ecosystem framing added:** the databox supports ecosystems built on **knowledge-bank infrastructure**
  (the local datacentre) for the digital transformation of local socioeconomics — local organisations and
  local people, interoperable with systems internationally.
- **Vocabulary revised:** "postbox" replaced throughout with **secure data vault** / **exchange point /
  exchange system** — the databox is a per-program secure data vault and governed exchange channel, not a
  mailbox metaphor.
- **Solid vs Solid Databox disambiguated:** Solid = the underlying W3C protocol work led by Tim Berners-Lee;
  Solid Databox = an implementation for organisations to run data relationships with agents (people,
  organisations, software) that hold their own pod or vault. Stated explicitly in "Built on open standards".
- **Examples added** ("What it looks like in practice"): cooperative projects; private health info + scoped
  dietary disclosure to local restaurants/takeaway; governance of participant relationships transposed to
  civics.au needs.
- **New nav group "Opportunities"** (after Components & tools, before Express interest): an overview page
  explaining the foundations→applications pattern + six opportunity areas, and a `food-health` detail page
  built on the evidence workbook. Reading chain now runs model → opportunities → food-health → eoi; an
  index card links the group.
- **Functional-food evidence example added** (source: `food_organ_system_evidence_v2.xlsx` — 297
  normalised foods, typed edge list `may_support`/`relates_to_focus`/`contains_or_marks`, evidence tiers
  A–D, cautions, 200 meal options across 14 cuisines): databox example 02 deepened with the evidence-graph
  mechanics + honest "educational, not medical advice" caveat; new `knowledge-commons` section on
  cooperative-projects presenting it as a cooperative knowledge asset (logged resource commits, RDF-native,
  consumable by databox-enabled food businesses); one line in digital-economy's AI-hub flow.
- **Care/dependants + service-supply purpose added:** fourth worked example (carers acting for dependants
  through delegated, visible, revocable authority — agent and represented person kept distinct, per the
  corpus's guardianship-relations context); ecosystem section now states the digital cooperative's purpose —
  infrastructure supplying the services human needs depend on. Mirrored in one line on digital-economy.
- **Local-operator economics added** ("Built for local operators"): small businesses/community orgs/SMEs;
  runs on a small local server (Mac mini / SFF PC); serves any client OS; no subscription cost once built
  and customised; local consultants tailor it; alternative to foreign cloud SaaS — money and digital agency
  stay local.
- **Page framing broadened:** the databox is not only "a vault between a program and a person" — vaults
  support information management between **entities, agents and software programs**, and the emphasis is the
  means for organisations/businesses to run their own software systems interoperating with other Solid
  systems, including those run by individuals (employees, customers, citizens). The intro no longer anchors
  to concession credentials (a concession credential is just one of many verifiable claims — the databox is
  not the identity layer).
- **"Immutable records" reframed:** immutability is *supported*, not applied to all data — the model is an
  auditable lifecycle (no silent overwrites; linked, auditable events) plus program-declared retention,
  correction and lawful deletion. Blanket immutability would breach erasure/rectification law — the opposite
  of the system's purpose. (The concession-card "immutable ledger" is retained deliberately: it stores only
  anonymous zero-knowledge proofs, not personal records.)

---

## 1. Resources reviewed

| Resource | What it is | What it contributed |
|---|---|---|
| [`mediaprophet/solid-databox`](https://github.com/mediaprophet/solid-databox/) (GitHub) | The **specification-and-tooling project**: ReSpec specs (overview, primer, protocol, vocabulary), the Institutional Deployment Kit blueprint, CATALOG of components/contexts/ontologies, and the Seraphim demo | The public framing: *habeas-data* building block, the eight spec invariants, the standards foundation, the two-implementation structure |
| [`components/iot-web-of-things/README.md`](https://github.com/mediaprophet/solid-databox/tree/main/components/iot-web-of-things) and [`ontologies/wot-sosa-ssn/README.md`](https://github.com/mediaprophet/solid-databox/tree/main/ontologies/wot-sosa-ssn) in that repo | WoT/Solid integration notes and the ontology layer | WoT Thing Descriptions as the device abstraction; SOSA/SSN translating telemetry into RDF; ACP-based access control for sensor data; the `derwehr/WoT-Solid` precedent |
| `C:\Projects\CommunitySolidServer\` (local checkout of **Solid-CSS-Databox**) | The **organisation-side reference implementation**: a Community Solid Server fork with `src/databox/` extension, `databox/` design corpus, `forge-admin/` console, `src/databox/ipms/` module layer | The technical ground truth for everything below |
| `databox/README.md`, `databox/architecture.md`, `databox/guide/README.md` | The databox design corpus and developer guide | The per-program postbox model, the twelve implementation invariants, control plane (Forge) vs data plane, notify-then-pull, opaque identifiers |
| `databox/devdocs/solid-ipms-plan.md` | The IPMS canonical implementation plan | The "organisation runs its own services" layer — opt-in install profile, module roadmap (§10): hosting, **IoT/WoT (§10.2)**, real-time, POS, payments |
| `databox/forge-plan/README.md`, `two-pod-exchange-model.md`, `product-architecture.md` | Forge productization plan | The **Two-Pod model** — the cleanest statement of the organisation-side ↔ person-side ecosystem |
| `deliverables/act-solid-databox/` | ACT executive overview deck + strategic brief | The "Solid for Organisations" public-value framing aimed at government |
| `C:\Projects\civics.au\content\pages.mjs` + built `databox.html` | The current site copy | What the site already says, and where the gaps are |

---

## 2. What the resources actually say — the model, accurately

### 2.1 Solid itself

Solid is a W3C-aligned open specification set: people and organisations keep data in **Pods** — personal or
organisational data stores — and grant scoped access to applications rather than surrendering data into each
application's silo. Concretely it is: the **Linked Data Platform** for storage, **WebID + Solid-OIDC** for
identity and authentication, **WAC/ACP** for access control, **Linked Data Notifications / WebSockets** for
real-time change, and RDF throughout — meaning *any* ontology (ODRL, DPV, schema.org, GS1, WoT, SOSA/SSN, the
project's own `sop:`/`cml:` vocabularies) is natively compatible. The interoperability guarantee is simply:
*runs on vanilla Solid; content is RDF in any ontology* — no proprietary transport, no new protocol.

### 2.2 The Solid Databox — the organisation side

A databox is **a private, two-way exchange point between one organisation program and one person** — a
modern-day postbox operated for a *declared program* (a loyalty scheme, an enrolment, an agency service, a
utility account). The organisation delivers records, receipts, credentials, warranties, notices; the person
returns submissions, corrections, claims, preferences, evidence.

The properties that matter, drawn from the twelve implementation invariants and the eight spec invariants:

- **It is not the person's wallet.** Each program relationship is a separate security domain; no organisation
  — and no shared hosting provider — gets a graph of the person's other relationships.
- **Both directions are provable.** Deposits get signed receipts; submissions are staged for human review and
  produce signed receipts the person keeps. "I did tell you" and "we never received it" stop being
  unfalsifiable. Evidence is preserved both ways, append-only, with tombstoning rather than silent overwrite.
- **Connection, not login.** The databox issues a portable, holder-bound, program-scoped **connection
  credential** the person installs in their own pod/agent. Operationally API-key-like in persistence, but bound
  to a vault-controlled key and exchanged for short-lived audience-bound tokens — not a copyable bearer secret.
- **Opaque by construction.** URLs, logs and storage paths carry no identifying customer information; box IDs
  are 128-bit random. Knowing a URL never grants access.
- **Policy travels with the record.** Versioned **ODRL** permission/prohibition/duty bundles ride with records
  and produce auditable duties. Obligations cite their instrument; redress routes travel with determinations.
- **Assurance gates access.** A record's sensitivity is enforced against the assurance of the *current*
  authentication, not just account ownership.
- **Machine proposes, human disposes.** Automated systems propose (`cml:Proposed`); only signed human
  attestation attests. No anonymous institutional actors; outsourcing does not launder accountability.
- **Standard surface.** A conforming independent Solid client can exercise its granted access over ordinary
  Solid HTTP/LDP — extensions never replace the protocol.

Implementation shape (Solid-CSS-Databox, CSS 7.1.9 extension):

- **Two planes.** The **Forge** control plane (`/.databox/forge`, JSON API behind a control token) registers
  programs, validates the machine-checked **Institution Profile**, forges opaque relationship mappings, issues
  connection credentials and bridges source-system events into signed deposits. The **data plane** is ordinary
  Solid: WAC-protected resources, DPoP-bound retrieval, notify-then-pull delivery.
- **Institutional integration plane.** Connectors sit between systems of record (SQL, directory, POS) and CSS;
  raw customer IDs never enter a public URI, credential or notification.
- **Status, honestly:** DBX-01…DBX-24 of a 28-prompt plan complete (26 ADRs, 58-threat model, fail-closed and
  unit-tested subsystems); DBX-25 live-CSS integration active. It is a **reference implementation** — live
  preset registries/keys/outbox are process-local; production needs durable stores, KMS keys, a WORM ledger.

### 2.3 The person side — personal pods and agents

The person connects the databox to **a Solid-compatible pod, vault, wallet or personal data service of their
own choosing**. The reference consumer agent is **Seraphim** (Flutter, `solidpod`/`solidui`, live web demo at
dev.linkeddata.au): credential wallet, receipt/document capture, corrections, evidence, consent manager, QR
connection flow — online-first, structured data living only in the person's remote pod. *(Site copy stays
generic here — other personal knowledge environments can fill this role, but none are named on the site.)*

One vault can hold many connection credentials — one per program — without exposing the others.

### 2.4 The Two-Pod model — the ecosystem's core pattern

The productization plan's cleanest idea: **both sides of a relationship are Solid data spaces.**

- The **organisation relationship pod** (the databox) holds the organisation's *governed view* of one
  relationship — like a CRM slice, but as Solid resources with portable records, explicit policies, append-only
  evidence and opaque identifiers.
- The **consumer personal pod** holds the person's information and intentions, under the person's authority.

There is **no single master copy of the relationship**. The organisation is authoritative for what it issues
(menus, prices, receipts, determinations); the person is authoritative for their intentions and self-asserted
context (orders, corrections, consent). Each side retains envelope, provenance, policy and receipt to
reconstruct any exchange. An exchange isn't complete when bytes move — it's complete when both sides hold
signed acknowledgement of the same envelope.

### 2.5 The organisation-side services layer (IPMS)

The thing that turns "a databox" into "an organisation's own digital stack" is the **IPMS** layer in the same
codebase (`src/databox/ipms/`): a Solid-native management system — described in the plan as *WordPress-like but
Solid-native*, where every subsystem's state is Solid/RDF resources rather than side files.

- **Opt-in install profile:** basic CSS → +databox → +IPMS → +modules. A plain vanilla Solid server remains
  installable with none of it; no IPMS behaviour leaks into the base server.
- **North star:** *any organisation, self-hosted, on-premises* — the small business on modest hardware is the
  archetype, not the limit. Non-expert operator, low-ops.
- **Core model:** the legal entity plus a **relationship directory** — every related agent (people, orgs,
  *devices*) in typed roles, some carrying verifiable credentials.
- **Module roadmap (§10):** hosting/domain setup (Cloudflare, first module); **IoT/Web-of-Things**; real-time
  notifications/WebSockets; **POS** (orders, receipts, table sessions, customer displays — already landing as
  `PosOrderStore`, `TableSessionStore`, `CustomerDisplayStore` writing canonical RDF readable via plain LDP);
  **payments** (gateway-adapter pattern, Stripe first, PCI-safe hosted-fields boundary — the box never touches
  raw card data); public website publishing; connector sidecars (ODBC/LDAP/R2RML) bridging existing systems.
- **Portability/no-lock-in proof:** `IpmsMigrationProof` demonstrates file-backed → Solid RDF works → Oxigraph
  SPARQL hydration → vanilla-Solid-readable degradation — the whole stack degrades back to standard Solid.

### 2.6 IoT / Web of Things

Two complementary layers exist:

1. **Device identity (designed, partially landing).** Devices — displays, POS terminals, scanners, sensors —
   are *directory entries with agent WebIDs*, governed by least-privilege WAC/ACP. Enrolment follows your
   cinema-rollout model: operator creates the device → IPMS issues a one-time claim URI → a small client app
   (Rust static binary) generates a keypair and enrols → a client certificate is bound to the device WebID via
   `cert:key` → thereafter **mutual TLS**. Devices that can't do mTLS fall back to Solid-OIDC
   client-credentials (DPoP) tokens. Rotation/revocation is a directory operation.
2. **Semantic telemetry (spec'd in the ontologies).** Devices and readings map to **W3C WoT Thing
   Descriptions** as RDF in the pod; sensor observations translate through **SOSA/SSN** so a reading is
   standardised RDF with time/location context — not proprietary JSON. Live streams ride the **Solid
   Notifications** protocol (WebSocket channels), and append-only `acl:Append` grants let a device stream data
   in without rights to modify history.

Use cases already worked through in the corpus: a membership/ticket VC verified at a **turnstile** without
learning identity; 3D printers receiving purpose-limited ODRL-licensed jobs plus telemetry; smart-meter P2P
energy telemetry; shared-household devices with delegated control; POS peripherals.

### 2.7 The ecosystem outcome — why this is novel

The combined picture is what the site hasn't said yet:

- **The organisation stops being a cloud tenant.** It runs its own standards-compliant data services —
  exchange postboxes, POS, website, device fleet, payments — on its own modest hardware, open-source, no SaaS
  rent, and it remains accountable for its own records.
- **The person stops being a record in someone else's silo.** They hold a personal pod and agent; connections
  to many organisations are independent, scoped credentials — no platform sees the whole graph.
- **Exchange is symmetric and provable.** Both directions authenticated, integrity-protected, receipted,
  policy-bound. Reconciliation — not delivery — is the completion criterion.
- **It works at the edge.** The whole stack is designed to run on a Linux edge controller at a community
  ground or council — no cloud dependency, which is exactly the civics.au deployment context.
- **Devices join the same fabric.** A sensor, a turnstile and a POS terminal are governed participants with
  WebIDs and policies, not vendor-cloud endpoints.

---

## 3. What the site currently says — and the gaps

Current copy lives in `content/pages.mjs` (built to root HTML by `npm run build`).

| Page | Current treatment | Gap |
|---|---|---|
| `databox.html` (pages.mjs:455–464) | Five sections: relationship-specific postbox, open standards, governance/rights, module system, ecosystem fit | Doesn't explain the **two-sided model** (the person's pod/agent), Solid itself beyond a sentence, the org-side services layer (IPMS), or devices/IoT. One small inaccuracy: "rotatable API keys" understates the connection credential (holder-bound key, exchanged for short-lived tokens — not a bearer secret) |
| `index.html` pathway card (line 21) | "A per-program, person-held postbox…" | Says "person-held" — the databox is *organisation-hosted*, person-connected; worth tightening |
| `digital-economy.html` (lines 84–93) | "Edge databoxes", Solid-interoperable pods, IoT metering, AI hubs | Conflates the databox (the exchange point) with the edge appliance (which runs CSS + databox + IPMS modules + device identity); IoT mentioned but not explained |
| `infrastructure.html` (line ~73) | Pods + edge appliances for credentials and energy telemetry | Fine, thin |
| `concession-card.html` | VCs in a personal Solid pod, delivered via the databox | Consistent — no change needed beyond links |
| `review.html` sources | Links Solid-CSS-Databox repo + project site | Could add the spec repo (`solid-databox`) and the Seraphim demo |
| `the-idea.html`, `community-grounds.html`, `cooperative-projects.html`, `it-support.html` | Passing references | Consistent; would benefit from the sharper ecosystem framing propagating naturally |

---

## 4. Proposed updates — for your approval

### Option A — expand the existing databox page (recommended)

Keep `databox.html` as the single canonical page; grow it from 5 to ~8 sections. Proposed section list:

1. **Relationship-specific by design** — keep, tighten the credential wording
2. **Two sides of one exchange** *(new)* — the Two-Pod model: organisation relationship pod ↔ personal pod,
   separate authority, no master copy
3. **The person's side** *(new)* — personal pods and agents; Seraphim as the reference consumer agent;
   Webizen/QualiaDB direction; many credentials, no shared graph
4. **Built on open standards** — keep; add the two-plane split (Forge control plane / standard Solid data
   plane) and fix the "API keys" phrasing
5. **Governance and consumer rights built in** — keep; add machine-proposes/human-disposes and
   assurance-gates-access
6. **The organisation's own stack** *(new, recasting "module system")* — the databox as one module of a
   self-hosted, Solid-native services layer: websites, POS, payments, connectors — an organisation running
   its own services on its own hardware
7. **Devices and the Web of Things** *(new)* — device identity (WebID + cert), WoT Thing Descriptions,
   SOSA/SSN telemetry, notification streams; turnstile/meter/display examples
8. **Where it fits the ecosystem** — keep; extend with the symmetric outcome: organisations and people both
   running services locally, connected by governed exchange

### Option B — split into two pages

`databox.html` keeps the postbox story; a new page (e.g. "Solid ecosystem" or folding into
`digital-economy.html`) carries the IPMS/device/ecosystem-outcome layer. More navigation surface, more
maintenance — I'd only do this if you want the org-side stack to stand alone for a business audience.

### Supporting edits (either option)

- `index.html` card: "person-held" → "person-connected" (accuracy)
- `digital-economy.html`: one clarifying paragraph separating *the edge appliance* (hardware running the
  stack) from *the databox* (one service on it), and a sentence naming device identity/WoT
- `review.html` sources: add the `solid-databox` spec repo and Seraphim demo links
- Meta descriptions on `databox.html`: update to cover two-way exchange + pods

---

## 5. Draft copy — new sections (Option A)

Written to the site's existing register (plain, precise, honest about status). These are drafts to react to,
not final text.

### § "Two sides of one exchange"

> A databox relationship has two Solid data spaces, not one database. The organisation runs a
> **relationship pod** — its governed view of dealings with one person: the records it issued, the
> submissions it accepted, the policies and receipts that bind them. The person holds a **personal pod** —
> their own Solid-compatible store, chosen and controlled by them. There is no master copy: the organisation
> is authoritative for what it issues; the person is authoritative for what they submit and consent to. Each
> side keeps the signed envelope, provenance and receipt needed to reconstruct any exchange — so an exchange
> is finished not when data arrives, but when both parties hold proof of the same thing.

### § "The person's side"

> People connect through software they choose — a personal agent or knowledge vault against their own Solid
> pod. The databox issues a **connection credential**: portable, signed, scoped to that one program, rotatable
> and revocable — installed in the person's service the way an API credential maintains a connection, without
> a login for every sync, and without ever functioning as a copyable secret. One vault can hold many such
> credentials — one per program — and no organisation learns of the others. **Seraphim**, an open-source
> consumer agent built on the Solid pod libraries, is the reference implementation of this side; any
> conforming Solid application can fill the same role.

### § "The organisation's own stack"

> The databox is one module of a broader idea: an organisation running its own standards-based services on
> its own hardware. The same Solid-native stack — an opt-in layer on the Community Solid Server — carries
> domain and hosting setup, a public website, point-of-sale with receipts as verifiable records, payments
> through a gateway-safe boundary, and connectors that bridge existing databases and directories. The
> reference operator console onboards programs, maps relationships, and tracks the organisation's
> information-provision obligations against an AU-tailored regulatory taxonomy. The target operator is a
> small business or community organisation on modest hardware — not a data centre. And because everything is
> Solid resources underneath, the stack degrades back to a vanilla pod: no lock-in by design.

### § "Devices and the Web of Things"

> Physical devices join the same fabric as governed participants, not vendor-cloud endpoints. A display,
> scanner, sensor or turnstile is enrolled as a directory entry with its own WebID; a one-time claim URI
> lets a small on-device agent generate keys and receive a certificate, after which the device authenticates
> by mutual TLS — with scoped, revocable, least-privilege access like any other agent. Readings are expressed
> through W3C Web of Things Thing Descriptions and the SOSA/SSN sensor ontologies, so telemetry lands in the
> pod as standard RDF with time and context, and streams over Solid's own notification protocol. A device can
> be granted append-only access — it can file observations without the power to alter history. The same
> pattern covers a smart meter feeding a microgrid, a ticket credential opening a turnstile without exposing
> identity, and a 3D printer accepting a purpose-limited licensed job.

---

## 7. Plain-language layer (from `F:\LLMs\Unlocking the Semantic Web of Data.md`)

New nav group **"In plain terms"** placed immediately after Home — the accessible on-ramp for
non-technical readers, especially community elders making decisions. Source document decomposed into:

- **The locked library** — open/linked data (CKAN, the LOD cloud) exists at scale but is functionally
  invisible to ordinary people → *web-of-data* page.
- **Two kinds of helper** — probabilistic chatbots guess; reasoning engines show their working over
  verified facts → *web-of-data* page.
- **The fair loop** — usable data enables contribution on fair terms (ties to cooperative projects).
- **"If you can't measure it, you can't fund it"** — anonymised civic statistics as evidence for funding.
- **W3C royalty-free patent policy** — the blueprints are free; building locally creates market pressure.
- **Knowledge Bank Cooperative** — home box (SFF/Mac mini), credit-union analogy, principal/agent,
  informatics fiduciary duty, local law vs foreign choice-of-law and access to remedy → *knowledge-bank*
  page with an interactive request-lifecycle stepper.
- **Global mandate** — SDG cost gap, 1.1B in informal settlements, mother-tongue marginalisation,
  BRICS/BRI alternative rails, exportable blueprint, peace infrastructure → *bigger-picture* page.
- **Glossary** — the doc's terms extended to the site's vocabulary → *glossary* page.

Register rules applied across the group: short sentences; every technical term anchored to a familiar
thing (safe, credit union, library, lawyer's duty); action items for non-technical readers; no unglossed
jargon.

**Restructure:** the group was then split into one-idea pages chained by the existing `next` button —
Start here → The problem → Your data safe → The cooperative → The web of data → Honest helpers →
The fair loop → Counting what counts → Beyond our town → Glossary.

**`Tracking Volunteer Effort and Fair Compensation.md` incorporated:**
- New *community-ledger* page ("Counting what counts") in the plain-terms flow: bank-ledger framing,
  work-vs-recreation, civic player stats (semantic currencies), private-by-default civic records with
  selective disclosure, the smartwatch false-dichotomy example, and obligation costs ending exploitation.
- New `social-equity` section on cooperative-projects ("Not all value is money").
- Glossary additions: obligation cost, semantic currency, civic record.

**`new-ecosystem` page added** (plain-terms capstone, after Counting what counts): the three places
information can live — personal safe, organisation vault, and *protocol-resident* storage owned by no
one (shared vocabularies, public registries, tamper-evident anchors); data separated from applications
as the core digital-transformation claim; and the stack framed as foundations for useful, safe AI.
One-line pointer added to the data-safe page.

**Terminology corrections (user-directed):** "civic" vs "civics" distinguished throughout (civic =
government-run; civics = the community's own work); "record" dropped for person-facing concepts in
favour of **community portfolio** (curated asset, not authority-kept record); verifiable credentials
reframed away from identity toward agency — signed statements of fact (certificate, receipt, warranty,
cheque, invitation), issuable by any authority including an ordinary person. New `proofs-you-carry`
page in the plain-terms flow (before Counting what counts, since a portfolio is a collection of
credentials).

**Group restructuring:** `it-support`, `digital-economy` and `cooperative-projects` moved from
Components & tools / For communities into **Opportunities** — they are applications the foundations
enable. Overview gained a "What each opportunity stands on" dependency table (application → required
foundations). New `community-library` page ("A library that does more than lend books"): digital
noticeboard + local guide, living archive for heritage/community groups, a *window on* civic
institutions (submissions, grants, GIS links, issue reporting — the library is civics, the window is
civic), charitable routing of compensation while recognition stays in the community portfolio, and
physical-site services (check-ins, amenities, IoT micro-billing).

**`social-web` page** ("A social web, not social media"): protocol-level social function vs platform
social media (Sayre 2010 links cited); rooms with rules; deterministic guardianship boundaries via
reasoning engines (interactive stepper); local jurisdiction.

**`community-manifold` page** ("A manifold for whatever comes next", renamed from canvas at user's
direction): the foundations as a generative manifold—one thing, many forms; build-once/run-anywhere
via IETF/W3C standards; standing on decades of unpaid standards work (royalty-free patent policy +
obligation costs as the repayment mechanism the internet never gave its builders); reaching where the
commercial internet didn't; honest-edge caveat. Glossary: interoperability, namespace, social web,
community portfolio, guardianship terms added across these rounds.

## 6. Questions — resolved

1. **Naming:** resolved — Webizen/QualiaDB removed; Seraphim named as the open-source reference agent;
   "Solid-CSS-Databox" stays as the named implementation; "IPMS" is described as "a Solid-native module
   system" rather than named jargon.
2. **Depth:** one section per new theme on the databox page; detail stays in the linked docs.
3. **Ecosystem emphasis:** adopted on both pages — the databox page carries the two-sided model and the
   knowledge-bank/local-economy framing; the digital-economy page clarifies the edge stack and devices.
4. **Implementation:** Option A — expand `databox.html`; supporting edits to `index.html`,
   `digital-economy.html`, `infrastructure.html`, `review.html` sources.
