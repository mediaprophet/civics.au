# 14 — QualiaDB `wasm-webcivics` delivery acceptance review

**Purpose:** Give a reviewing agent (or human) everything needed to **verify**, then either **accept** or **return fix feedback**, for the 25 September 2026 Qualia upstream delivery that Civics pins for decision-evidence: Solid RDF MIME, device storage/backup, digests, profile binding, and agent API docs.

**Status of this sheet:** review instrument (not a product claim by itself).  
**Planning baseline:** 25 September 2026.  
**Qualia workspace:** `C:/Projects/qualia-27062026`  
**Civics workspace:** `C:/Projects/civics.au`

---

## 0. How to use this document

1. Work only against the **pinned webcivics artifact** and `profile.json` — do **not** accept based on `docs/playground` (`wasm-full`).
2. Execute §3 commands (or equivalent) and fill §5 scorecard with **Pass / Fail / N/A** and one-line evidence.
3. Apply §6 decision rule.
4. If **Accept**, write the §7.1 acceptance block into this file (or a dated copy under `docs/plans/decision-evidence/reviews/`).
5. If **Reject / Fix**, write §7.2 feedback with **concrete paths + expected behaviour** — no vague “improve docs”.

**Normative product contracts**

| Doc | Role |
|---|---|
| [13 — Web Civics profile](13-web-civics-profile.md) | Formats, I/O, Qualia boundary |
| [12 — Qualia WASM development register](12-qualia-wasm-development-register.md) | VW / QW items |
| `../../../data/web-civics-profile/profile.json` | Machine pin + Solid + deviceStorage |
| Qualia `docs/manuals/wasm-webcivics-agent-api.md` | Agent API manual |
| Qualia `docs/contracts/qualia-engine-sdk.d.ts` | Typed contracts |
| Qualia `docs/releases/0.0.39-wasm-digests.md` | Digests |

---

## 1. Claimed delivery (what “done” means)

The upstream instrument claimed the following as **complete for Civics pin purposes**. Reviewers must confirm each claim with evidence — not trust the claim text.

### 1.1 Preferred runtime package

| Claim | Expected truth |
|---|---|
| Preferred Cargo feature | `wasm-webcivics` (not `wasm-full`, not `portal` alone) |
| Compiled profile label | `webcivics` |
| Engine version | `0.0.39` |
| No `gpu-runtime` | Capability list must **not** advertise GGUF/LLM/WebGPU viewport as available |
| Size gate | Raw ≤ 4 MiB and gzip ≤ 1.5 MiB |

### 1.2 Pinned artifact (must match exactly)

| Field | Expected value (as of 2026-09-25 re-pin) |
|---|---|
| Relative path | `docs/pkg/webcivics/qualia_webcivics_bg.wasm` |
| Absolute path | `C:/Projects/qualia-27062026/docs/pkg/webcivics/qualia_webcivics_bg.wasm` |
| SHA-256 | `7c2de8203d6456a2ed852084f9e45dabf4647cd6ac990b0ca25cd7767c89cb71` |
| Raw bytes | `2886684` |
| Gzip bytes | `991079` |
| Glue / types | `docs/pkg/webcivics/qualia.js`, `qualia.d.ts` |
| Digest doc | `C:/Projects/qualia-27062026/docs/releases/0.0.39-wasm-digests.md` |

If the binary on disk differs from `profile.json` `runtime.artifact`, **fail** until re-pin or profile update.

### 1.3 Solid / LDP RDF

| Claim | Evidence required |
|---|---|
| Primary MIME | `text/turtle`, `application/ld+json`, `text/n3` |
| WASM exports | `serialize_rdf_wasm`, `parse_rdf_document_wasm`, `solid_negotiate_accept_wasm`, `parse_jsonld_wasm` |
| Compact JSON-LD | `compact: true` emits pinned `@context` + `@graph` |
| Caps present | `solid-rdf-media-types`, `json-ld-compact-serialize`, `rdf-serialization`, `n3-parser`, `turtle-parser` |
| Node fixture PASS | `node docs/tests/webcivics-solid-rdf.test.mjs` |

### 1.4 Device storage + backup folder

| Claim | Evidence required |
|---|---|
| Policy WASM | `device_storage_policy_wasm`, `plan_device_storage_wasm`, `verify_backup_manifest_wasm` |
| OPFS primary dir | `webcivics` |
| Backup subdir | `webcivics-backups` |
| Host adapter | `docs/js/webcivics-device-storage.js` (`pickBackupFolder`, `setHostBackupPath`, `exportBackup`, `restoreBackup`) |
| Caps present | `device-storage-policy`, `opfs-primary-vault`, `backup-folder-link` |
| Profile block | `profile.json` → `runtime.deviceStorage` |
| Node fixture PASS | `node docs/tests/webcivics-device-storage.test.mjs` |
| Recovery invariant | Primary wipe must not imply backup folder erased (`primaryWipeDoesNotEraseBackup`) |

### 1.5 Documentation for agents

| Claim | Path must exist and be usable |
|---|---|
| Agent API manual | `C:/Projects/qualia-27062026/docs/manuals/wasm-webcivics-agent-api.md` |
| Typed SDK | `C:/Projects/qualia-27062026/docs/contracts/qualia-engine-sdk.d.ts` (Solid + device storage types) |
| Profile references include agent API | `profile.json` `references[]` |

### 1.6 Explicitly **not** claimed (do not fail for absence)

- Browser observation of full SHACL graph admission on a Civics page (adapter wiring).
- `compile-rdf-to-q42-wasm` export / hosted Q42 publish.
- Automated export-list generation in CI.
- Flutter/native UI already calling `setHostBackupPath` (host work remains).
- RDFC-1.0 conforming digest (status export may be fail-closed).
- Independent Solid Databox interoperability evidence ([09](09-solid-databox-community-commerce-integration.md)).

---

## 2. Files and paths to inspect

### 2.1 Civics

| Path | Check |
|---|---|
| `data/web-civics-profile/profile.json` | `preferredCargoFeature`, `artifact.*`, `runtime.solid`, `runtime.deviceStorage`, required caps |
| `docs/plans/decision-evidence/13-web-civics-profile.md` | Mentions webcivics pin, Solid, device storage |
| `docs/plans/decision-evidence/12-qualia-wasm-development-register.md` | VW-05 / QW-09 status vs evidence |
| **This file** | Scorecard + verdict |

### 2.2 Qualia

| Path | Check |
|---|---|
| `docs/pkg/webcivics/*` | wasm + js + d.ts present; hash match |
| `docs/releases/0.0.39-wasm-digests.md` | Matches profile artifact |
| `docs/manuals/wasm-webcivics-agent-api.md` | Init, Solid, storage, exclusions |
| `docs/manuals/wasm-capability-profiles.md` | WebCivics row |
| `docs/js/webcivics-device-storage.js` | Adapter API |
| `docs/tests/webcivics-solid-rdf.test.mjs` | Fixture |
| `docs/tests/webcivics-device-storage.test.mjs` | Fixture |
| `crates/qualia-core-db/src/wasm_bridge/device_storage.rs` | Policy source |
| `crates/qualia-core-db/src/sparql_library/rdf_formats/solid_media.rs` | MIME negotiation |
| `crates/qualia-core-db/src/wasm_capabilities.rs` | `WEBCIVICS` list |

---

## 3. Verification commands (run from Qualia root)

```powershell
cd C:\Projects\qualia-27062026

# A. Size + hash vs pin
node docs/tests/wasm-size-check.mjs docs/pkg/webcivics/qualia_webcivics_bg.wasm 4194304 1572864
Get-FileHash docs\pkg\webcivics\qualia_webcivics_bg.wasm -Algorithm SHA256
# Expect: 7C2DE8203D6456A2ED852084F9E45DABF4647CD6AC990B0CA25CD7767C89CB71

# B. Solid RDF fixture (VW-05)
node docs/tests/webcivics-solid-rdf.test.mjs
# Expect: "webcivics Solid RDF fixtures PASSED" and PIN_SHA256 matching profile

# C. Device storage fixture
node docs/tests/webcivics-device-storage.test.mjs
# Expect: "webcivics device-storage fixtures PASSED"

# D. Optional focused Rust unit tests (if toolchain available)
cargo test -p qualia-core-db --lib -- device_storage solid_turtle_n3_jsonld -- --nocapture
```

**Civics profile consistency (PowerShell):**

```powershell
$j = Get-Content C:\Projects\civics.au\data\web-civics-profile\profile.json -Raw | ConvertFrom-Json
$h = (Get-FileHash C:\Projects\qualia-27062026\docs\pkg\webcivics\qualia_webcivics_bg.wasm -Algorithm SHA256).Hash.ToLower()
# Fail if any mismatch:
$j.runtime.preferredCargoFeature -eq 'wasm-webcivics'
$j.runtime.compiledProfile -eq 'webcivics'
$j.runtime.artifact.sha256 -eq $h
$j.runtime.artifact.rawBytes -eq (Get-Item C:\Projects\qualia-27062026\docs\pkg\webcivics\qualia_webcivics_bg.wasm).Length
$null -ne $j.runtime.solid
$null -ne $j.runtime.deviceStorage
```

**Export smoke (Node one-liner after init):** confirm presence of  
`serialize_rdf_wasm`, `parse_rdf_document_wasm`, `solid_negotiate_accept_wasm`,  
`device_storage_policy_wasm`, `plan_device_storage_wasm`, `verify_backup_manifest_wasm`.

---

## 4. Capability checklist (must be advertised)

From `list_capabilities_wasm()` on the **pinned** module (and mirrored in `profile.json` `requiredCapabilities` where listed):

**Semantic / Solid**

- [ ] `json-ld-ingest`
- [ ] `json-ld-serialize`
- [ ] `json-ld-compact-serialize`
- [ ] `json-ld-context-digest`
- [ ] `rdf-serialization`
- [ ] `solid-rdf-media-types`
- [ ] `n3-parser`
- [ ] `turtle-parser`

**Storage**

- [ ] `device-storage-policy`
- [ ] `opfs-primary-vault`
- [ ] `backup-folder-link`

**Admission / logic / calc (profile-required)**

- [ ] `shacl-property-validation`
- [ ] `shacl-graph-validation`
- [ ] `deontic-logic` / `epistemic-logic` / `paraconsistent-routing` / `temporal-ltl`
- [ ] `q42-kernel-sparql-extensions`
- [ ] `numerical-solvers` / `economics` / `symbolic-logic`

**Must NOT appear as browser-available for this profile**

- [ ] No claim of `gpu-runtime` / GGUF / streaming decode as included
- [ ] `compile-rdf-to-q42-wasm` remains in `explicitlyExcluded` until exported

---

## 5. Scorecard (reviewer fills)

| ID | Gate | Result (Pass/Fail/N/A) | Evidence (command, path, or quote) |
|---|---|---|---|
| G1 | Artifact SHA-256 matches profile + digests doc | Pass | `Get-FileHash`: `7c2de…cb71`; profile and Qualia digest document match. |
| G2 | Size gate ≤ 4 MiB / 1.5 MiB gzip | Pass | `wasm-size-check`: 2,886,684 raw; 991,079 gzip. |
| G3 | `compiled_profile` / preferred feature = webcivics | Pass | Solid fixture reports `compiled_profile=webcivics`; profile pins `wasm-webcivics`. |
| G4 | Solid fixture PASS | Pass | `node docs/tests/webcivics-solid-rdf.test.mjs`. |
| G5 | Device-storage fixture PASS | Pass | `node docs/tests/webcivics-device-storage.test.mjs`. |
| G6 | Solid WASM exports present in `qualia.d.ts` | Pass | `serialize_rdf_wasm`, `parse_rdf_document_wasm`, `solid_negotiate_accept_wasm`, `parse_jsonld_wasm`. |
| G7 | Device-storage WASM exports present | Pass | `device_storage_policy_wasm`, `plan_device_storage_wasm`, `verify_backup_manifest_wasm`. |
| G8 | `profile.json` has `runtime.solid` | Pass | `data/web-civics-profile/profile.json`. |
| G9 | `profile.json` has `runtime.deviceStorage` | Pass | `data/web-civics-profile/profile.json`. |
| G10 | Required Solid/storage caps listed | Pass | `list_capabilities_wasm()` returned all 21 required semantic, storage, SHACL, logic and calculation capabilities. |
| G11 | Agent API manual exists and covers Solid + storage | Pass | Qualia `docs/manuals/wasm-webcivics-agent-api.md`, sections 4–5. |
| G12 | SDK `.d.ts` includes Solid + storage types | Pass | Qualia `docs/contracts/qualia-engine-sdk.d.ts`, Solid and `DeviceStoragePolicy` interfaces. |
| G13 | No false claim of Q42 compile or RDFC-1.0 ready | Pass | `compile-rdf-to-q42-wasm` explicitly excluded; agent manual states RDFC-1.0 can fail closed. |
| G14 | Register (12) status consistent with evidence | Pass | Corrected stale digest/size references in register 12; current pin agrees with fixtures. |

---

## 6. Decision rule

| Verdict | Condition |
|---|---|
| **ACCEPT** | G1–G12 all **Pass**; G13 **Pass**; G14 Pass or documented N/A with reason |
| **ACCEPT WITH NOTES** | G1–G12 Pass; non-blocking doc/register lag only (list notes) |
| **REJECT — FIX REQUIRED** | Any of G1–G12 Fail, or G13 Fail (false capability claim) |

Do **not** ACCEPT if only the playground `full` bundle was tested.

---

## 7. Output templates

### 7.1 Acceptance block (copy when accepting)

```markdown
## Review verdict — ACCEPT

- **Date (UTC+10):** YYYY-MM-DD
- **Reviewer:** <agent or person id>
- **Pinned SHA-256:** 7c2de8203d6456a2ed852084f9e45dabf4647cd6ac990b0ca25cd7767c89cb71
- **Fixtures run:** webcivics-solid-rdf.test.mjs PASS; webcivics-device-storage.test.mjs PASS
- **Notes:** <none | short>
- **Follow-ups (non-blocking):** <e.g. QualiaAdapter wiring, scheduled backup UI>
```

### 7.2 Fix-feedback block (copy when rejecting)

```markdown
## Review verdict — REJECT — FIX REQUIRED

- **Date (UTC+10):** YYYY-MM-DD
- **Reviewer:** <agent or person id>
- **Blocking failures:**

| Gate | Problem | Required fix | Owner path |
|---|---|---|---|
| G? | <observed> | <exact expected> | <file or command> |

- **Re-test command after fix:** <paste §3 subset>
- **Do not accept until:** <clear condition>
```

### 7.3 Feedback quality bar

Valid fix feedback **must** include:

1. Failed gate ID (G1…).
2. Observed value vs expected value.
3. File or command that proves it.
4. What “fixed” looks like (e.g. “re-run wasm-pack, update profile.json sha256, both Node fixtures PASS”).

Invalid feedback: “looks incomplete”, “needs more tests”, “docs unclear” without a gate ID and path.

---

## 8. Suggested agent prompt (paste to reviewer)

```text
You are reviewing the QualiaDB wasm-webcivics delivery for Civics.au decision-evidence.
Follow C:/Projects/civics.au/docs/plans/decision-evidence/14-qualia-wasm-webcivics-acceptance-review.md
exactly. Run the §3 verification commands. Fill the §5 scorecard. Apply §6.
Output either §7.1 ACCEPT or §7.2 REJECT with concrete fixes.
Do not test docs/playground as the production pin.
```

---

## 9. Remaining Civics-side work after ACCEPT

These do **not** block accepting the Qualia pin, but remain open for Civics:

1. Wire `QualiaAdapter` / Node CI to `docs/pkg/webcivics` (not playground).
2. Call `requestPersist` + `pickBackupFolder` / `setHostBackupPath` on first install UI.
3. Schedule `exportBackup` when `plan_device_storage_wasm` recommends it.
4. Browser-observed SHACL admission on a real case package against this pin.
5. Keep Q42 publish optional until `compile-rdf-to-q42-wasm` exists.

---

## 10. Change control

| When | Action |
|---|---|
| Qualia re-builds webcivics WASM | Update digests doc + `profile.json` artifact fields; re-run §3; new review |
| Only docs change | G11/G12/G14 may re-run alone; binary gates unchanged |
| Capability added/removed | Update `WEBCIVICS`, profile `requiredCapabilities`, this §4 list |

---

## Review log (append-only)

| Date | Reviewer | Verdict | Notes |
|---|---|---|---|
| *(none yet)* |  |  | First independent review pending |
| 2026-09-25 | Codex | ACCEPT | G1–G14 passed against the pinned `wasm-webcivics` artifact. Q42 compilation and browser case-admission wiring remain separately tracked. |

## Review verdict — ACCEPT

- **Date (UTC+10):** 2026-09-25
- **Reviewer:** Codex
- **Pinned SHA-256:** `7c2de8203d6456a2ed852084f9e45dabf4647cd6ac990b0ca25cd7767c89cb71`
- **Fixtures run:** `webcivics-solid-rdf.test.mjs` PASS; `webcivics-device-storage.test.mjs` PASS
- **Notes:** The prior stale digest/size references in register 12 were corrected during review.
- **Follow-ups (non-blocking):** Civics QualiaAdapter wiring; browser-observed SHACL admission on a real case package; Q42 compiler/export and reader before Q42 hosting; RDFC-1.0 conformance before claiming canonical RDF hashes.

---

*End of acceptance instrument. Related: [05 — Delivery and acceptance](05-delivery-and-acceptance.md), [12 — Qualia register](12-qualia-wasm-development-register.md), [13 — Web Civics profile](13-web-civics-profile.md).*
