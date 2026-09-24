# Site polish handoff

Review date: 24 September 2026. Reviewed checkout: `7ed74d2`.

## Brief for the implementing agent

Polish the existing civics.au site so it is easier to navigate, read and use, especially on a phone. Preserve the cream/forest-green/terracotta palette, serif headings, original diagrams, Australian English, and the author's substantive ideas. Work through P1 before P2, then finish P3. These are tasks to implement, not a proposal to replace the site with a new framework or visual identity.

Edit the source files and regenerate HTML. `content/pages.mjs` owns page content and most interactive markup; `scripts/build.mjs` owns the shared shell, navigation, metadata, 404 and EOI confirmation pages. Do not fix only the generated root HTML or `dist/` copies. Keep existing routes and section anchors working.

Each task below includes evidence, a direction, and a completion check. **Observed** means reproduced in the local browser; **Source** means identified in the implementation; **Editorial** means a suggested improvement, rather than a demonstrated defect. Recheck observations against your starting revision before changing them.

## Review coverage and baseline

- Served the existing checkout at `http://127.0.0.1:4173`. The server was already running; the attempted second start reported `EADDRINUSE`. Reuse it if it is still serving this project.
- Visited all 38 content routes plus `404.html` and `eoi-sent.html`. Swept article headings, continuation links and document width at a 390 × 844 viewport; inspected representative desktop and mobile screenshots. This was not a pixel-by-pixel visual review of every route.
- Examined navigation, the fit-out planner, model tabs and calculators, EOI validation and conditional fields, shared templates, scripts and deployment configuration.
- `npm run check` passed: 38 pages, both utility pages, dist integrity, 2,076 local links/assets, and all 5,811 formula cells across 27 sheets. Those checks do not establish responsive layout, keyboard usability, input validation or live email delivery.
- No production email was sent, CAPTCHA solved, deployment performed, or existing saved model/report deleted. Live delivery, every calculator branch, browser print output, offline behavior and screen-reader behavior remain to be verified during implementation.
- This review concerns the local checkout. It does not claim that `civics.au` or `dev.civics.au` currently serves identical content.

## P1 — Fix broken or misleading interactions first

### 1. Contain horizontal overflow in the fit-out planner

- [ ] **Observed:** At 390 × 844, `setup.html` has a 375px usable document width but a 561px scroll width. Step 1 labels and controls extend to x=561. Focusing “People living in it” scrolls the page sideways and cuts off the left-hand text.
- **Change:** Make the step grids, inline fuel fields, money fields and repeating equipment rows shrink/wrap within their container. Inspect grid minimum sizing, `min-width`, and long inline groups. Keep intentionally wide comparison tables in their own scroll containers; do not hide the symptom with global `overflow-x: hidden`.
- **Files:** `assets/styles.css`; setup markup in `content/pages.mjs`; dynamically generated rows in `assets/site.js`.
- **Done when:** At 320, 390, 768 and desktop widths, no whole-page horizontal scrolling occurs. Every input remains visible when focused, including newly added rows and all five setup types.

### 2. Fix the cooperative commit viewer on small screens

- [ ] **Observed:** At the same phone size, `cooperative-projects.html` reaches 417px scroll width. `.commit-list`, `.commit-btn` and `.commit-viewer` extend past the 375px document width despite the single-column breakpoint.
- **Change:** Make the stacked grid columns shrink, reduce excessive nested padding on phones, and wrap long identifiers/URLs. Preserve legible commit details and button labels.
- **Files:** `.commit-*` rules in `assets/styles.css`; commit markup in `content/pages.mjs` and `assets/site.js`.
- **Done when:** Every sample commit can be selected and read without dragging the entire page sideways at 320/390px.

### 3. Turn the mobile navigation into usable grouped disclosure

- [ ] **Observed:** Opening the hamburger expands all 38 links. Navigation is about 1,986px tall, pushing main content to y≈2,073. All group buttons report `aria-expanded="false"` while their links are visibly expanded. The desktop “In plain terms” dropdown also ends below a 720px-high viewport (bottom ≈757px).
- **Change:** Make mobile groups genuinely collapsible, with visible toggles and accurate expanded state. Keep the current section easy to find and “Start here”/“Express interest” readily accessible. Bound long desktop dropdowns to the viewport with usable internal scrolling. Reconcile CSS hover opening with the JavaScript state and keyboard behavior.
- **Files:** `renderNav()` in `scripts/build.mjs`; navigation rules in `assets/styles.css`; navigation handlers at the start of `assets/site.js`.
- **Done when:** A phone user can reach any group without scrolling through every earlier group. Keyboard users can open a group, follow links, dismiss it with Escape, and retain sensible focus. Hidden links are not keyboard stops; announced state matches visibility.

### 4. Reconcile the fit-out planner's two comparison stories

- [ ] **Observed:** With default inputs, the narrative says “weekly cost $423 vs $423 today — saves $0/wk”. The cards directly below show “without a community ground” at $668 and the community-ground option at $423. A reader cannot tell which comparison to trust.
- **Change:** Define explicit baselines for “as configured”, the commercial-site benchmark, and the supported-ground scenario. Derive the narrative and cards from the same named scenario results, or clearly label distinct comparisons. Inspect `weekly`, `woWeekly`, `cgWeekly`, `onGrounds` and `wkDelta`; do not simply hard-code a $245 saving.
- **Files:** Fit-out calculation/result rendering in `assets/site.js`; explanatory copy in `content/pages.mjs`.
- **Done when:** The default comparison is internally consistent. Changing site mode/fee and turning the supported comparison off produces matching labels and arithmetic. Add a focused regression check for this mismatch and for a case where the supported option costs more.

### 5. Validate calculator inputs before displaying or recording results

- [ ] **Observed:** In `model.html` → “Solar & battery”, entering `-10` in “Battery usable capacity (kWh)” produces negative charging and delivery values (`-11.1` and `-10`) in the results table, with the report action still available.
- **Change:** Add field-specific limits and clear inline errors for the solar, water, site and fit-out calculators. Reject blank/non-numeric/non-finite values where required; constrain efficiencies and percentages appropriately. Do not blanket-ban negative values in financial assumptions or temperature fields where they can be legitimate. Do not silently turn invalid input into zero or a plausible result.
- **Files:** `assets/model-app.js`, `assets/sites.js`, `assets/site.js`, and relevant controls in `content/pages.mjs`.
- **Done when:** Invalid values cannot produce/export a current result as if valid. Valid zero cases work where meaningful. Cover negative capacity, zero efficiency, percentage above 100, blank text and non-numeric input with focused checks; retain the 5,811-cell baseline pass.

### 6. Give every calculator control a meaningful accessible name

- [ ] **Observed:** Many visible controls are unnamed in the accessibility snapshot: setup fuel-use inputs, winter sun hours, heater hours/threshold, equipment inclusion checkboxes, row costs and weights; site-planner number inputs paired with sliders; water-heating solar share and thermal-store fields.
- **Change:** Add individual labels, units and row context. A surrounding label with several inputs does not label them all. Give repeated remove buttons names such as “Remove Folding solar panel”. Apply the same naming to newly added rows.
- **Files:** `content/pages.mjs`, generated controls in `assets/site.js` and `assets/sites.js`, and calculator markup/rendering in `assets/model-app.js`.
- **Done when:** A keyboard/screen-reader user can distinguish each field, unit and row action without its visual position. Verify initial and dynamically added rows.

### 7. Complete tab and stepper keyboard behavior

- [ ] **Observed:** On the financial-model tab, ArrowRight leaves both focus and selection unchanged. All five tabs lack explicit `tabindex`, and the workbench has no elements with `role="tabpanel"`. **Source:** The shared cooperative stepper also only handles clicks.
- **Change:** Implement a consistent tab pattern with arrow keys, Home/End, roving focus, stable IDs and associated panels. Apply it to model tabs and the steppers on `data-safe.html`, `cooperative-projects.html` and `social-web.html`.
- **Files:** `assets/model-app.js`, the stepper handlers in `assets/site.js`, and tab/panel markup in `content/pages.mjs`.
- **Done when:** All tabs and steps work without a pointer; selection is announced; hidden panels do not expose interactive controls; focus remains visible after selection.

### 8. Make EOI errors actionable and preserve the user's work

- [ ] **Observed:** Submitting an empty local form displays a summary, leaves focus on the submit button, and marks no fields with `aria-invalid`. **Source:** `novalidate` disables native validation, email validation only checks for `@`, and server failures redirect to a fresh form. Backend error details are copied into the URL and displayed to visitors.
- **Change:** Add field-level errors linked to inputs, focus the summary or first invalid field, and use consistent client/server validation. Preserve entered values through failed delivery/CAPTCHA retries without putting personal information in URLs. Show a useful public error and keep provider diagnostics in server logs. Add an in-progress submit state and a clear retry path.
- **Files:** EOI markup/inline script in `content/pages.mjs`; `handleEOI()` in `src/index.js`; EOI styles.
- **Done when:** Empty/invalid fields are identified individually; valid user entries survive a simulated backend failure; retry works; double submission is discouraged; the error text names the missing interest type as well as name/email. Verify with mocks/local fixtures, without emailing real submissions.

### 9. Verify EOI behavior for the actual deployment targets

- [ ] **Source:** The form posts to `/eoi`; the development server always redirects that POST to success without sending email. The workflow publishes both static GitHub Pages and a Cloudflare Worker; only the latter supplies the handler. The Worker falls back to an always-pass Turnstile test secret when its binding is missing, while the form contains a non-test site key.
- **Change:** Document and enforce which origins can accept submissions. Give static-only hosting a working supported endpoint or an explicit contact alternative. Make missing live CAPTCHA configuration fail with a controlled error rather than a test-secret fallback. Catch CAPTCHA-service network failures as well as mail failures. Keep local simulation visibly distinguishable from real delivery.
- **Files:** `src/index.js`, `scripts/serve.mjs`, `content/pages.mjs`, `.github/workflows/deploy.yml`, `wrangler.jsonc`, `README.md`.
- **Done when:** Local success cannot be mistaken for evidence of email delivery. Missing configuration, rejected CAPTCHA, network failure and mail rejection have tested recovery paths. A production delivery check is a separate coordinated verification; do not deploy or send test email merely to complete this polish pass.

## P2 — Improve visual hierarchy, reading paths and trust

### 10. Give the homepage one clear starting action

- [ ] **Editorial:** Three hero CTAs use the same filled treatment (“Start here”, “For participants”, “For communities”), followed by “Run the numbers”. The fuller explanation that this is a working proposal appears much further down, after philosophy and eight component cards.
- **Change:** Make “Start here” visually primary and the audience/tools routes secondary. Add a compact, concrete explanation of what visitors can do now near the hero. Retain the diagram and human-purpose statement; shorten or move dense philosophy text so practical orientation is easy to scan.
- **Files:** Home page data in `content/pages.mjs`; hero/CTA styles and template where necessary.
- **Done when:** At desktop and phone widths a first-time reader can identify what the initiative proposes, its current status, and the relevant next step without working through the full page.

### 11. Make “In plain terms” a genuinely short entry point

- [ ] **Editorial:** `plain-terms.html` opens with a section called “The whole idea in one breath” that is several hundred words long. The navigation offers a 15-page sequence, including very short pages such as `fair-loop.html` and `web-of-data.html`.
- **Change:** Begin with a short summary and a small set of reader questions/routes. Keep personal history and the full argument available below. Give the sequence a clear overview and optional shortcuts to practical pages; avoid requiring the full sequence to understand the offer. Explain specialist words at first use.
- **Files:** Plain-language page objects in `content/pages.mjs`.
- **Done when:** A new reader can get the central proposal in roughly a minute and choose where to go next. Preserve the author's meaning and existing URLs; propose substantial changes to sensitive/personal passages separately instead of silently rewriting them.

### 12. Resolve navigation names, page numbers and audience placement

- [ ] **Observed/Source:** Navigation numbers are generated from the 38-page order, but page eyebrows retain earlier numbering: EOI says “13” while navigation says “37”; setup says “02”. `site-planner.html` is grouped under participants despite explaining infrastructure for ground operators. The model's continuation says “Overview” but links to the opportunities page. The hero rendering omits the configured `next` link on `the-idea.html`.
- **Change:** Choose one numbering convention or remove obsolete public-facing numbers. Use descriptive continuation labels, provide a communities/tools route to the site planner, and give the community landing page a clear continuation into the grounds page.
- **Files:** Page `nav`, `group`, `order`, `eyebrow` and `next` metadata in `content/pages.mjs`; `renderNav()` and hero rendering in `scripts/build.mjs`.
- **Done when:** Names and numbers agree across navigation, headings and continuation cards. Participant, community and technical journeys each have an obvious next step without an unexplained audience switch.

### 13. Reduce the distance from a planner's introduction to its controls

- [ ] **Editorial:** Setup repeats its audience explanation in both the long intro and “Who this is for”, then puts a comparison table and a substantial scenario explanation before Step 1. The modelling lab also has a long introduction before the workbench. Results are far below the inputs on phones.
- **Change:** Add a visible “Open planner”/“Jump to workbench” link near the intro, shorten repeated copy, and move advanced explanations into optional details. Add compact step navigation and a “View results” route; consider a small persistent summary only if it does not obscure controls.
- **Files:** Setup/model/site-planner content, `assets/styles.css`, and minimal interaction code as needed.
- **Done when:** Users can reach the first control and current results without traversing long prose repeatedly. Current inputs survive moving between sections. The floating model TOC does not cover focused controls on phones.

### 14. Correct the utility-page desktop layout

- [ ] **Observed/Source:** On `404.html`, the message and return button occupy the narrow first column with a large empty area to the right. Both utility templates use the two-column `.reading` layout but omit its TOC, putting the article in the 210px sidebar column.
- **Change:** Use the single-column/full-width reading variant for `404.html` and `eoi-sent.html`, with a comfortable text measure. Fix the confirmation page's heading hierarchy (`h1` currently jumps to `h3`).
- **Files:** Utility templates in `scripts/build.mjs`; existing layout classes in `assets/styles.css`.
- **Done when:** Both pages look intentionally composed on desktop and phone, and the return action is easy to find. Check a real nonexistent local route as well as `/404.html`.

### 15. Give long technical pages a consistent reading structure

- [ ] **Editorial:** `databox.html` has ten sections; `cooperative-projects.html` mixes policy, tutorials, simulation, procurement, technical ledgers and humanitarian applications across nine sections. Long technical titles consume much of the first phone screen.
- **Change:** Add a brief “What this enables” summary, choose shorter scannable headings, and place detailed architecture behind clearly labelled subsections/details where appropriate. Use consistent spacing for section headings, examples, notes and tables. Preserve content rather than flattening important distinctions.
- **Files:** Especially databox, cooperative-projects, digital-economy, concession-card, review, journey-out and IT-support content; shared typography/spacing styles.
- **Done when:** Readers can scan each page for purpose, practical example, limits and next action. Headings wrap cleanly at 320px; no cramped multi-column cards or excessive empty sections remain.

### 16. Make the glossary useful at the point of confusion

- [ ] **Editorial:** `glossary.html` has roughly 1,300 words under a single “A–Z” section, so the shared TOC offers little help finding an individual term.
- **Change:** Add stable term anchors and a compact alphabetical/term index, or a small accessible filter with a clear empty state. Link first-use technical terms from relevant pages to the specific definition. Keep all definitions available without JavaScript.
- **Files:** Glossary and referring content in `content/pages.mjs`; small shared styles/script only if needed.
- **Done when:** A reader can go directly to a term, return to the article, and find every definition with keyboard navigation. Existing links still work.

### 17. Align proposal language, demo labels and evidence

- [ ] **Editorial/Source:** The site already has helpful concept notices, but some body copy reads as established delivery or guaranteed outcomes. Examples include “zero financial speculation risk” in cooperative projects, the review's categorical claim that the proposal “substantially reduces” government expenditure, and absolute safety statements in the social-web page. Stay-duration explanations also vary in detail between setup and EOI.
- **Change:** Keep proposed capabilities, illustrative examples, measured results and unresolved assumptions distinguishable next to the relevant claim. Label the commit inspector and payback simulator as examples. Consolidate stay-duration/rate assumptions and link to their fuller explanation. Ask the owner to resolve policy/evidence gaps; do not invent commitments, rates, legal conclusions or citations.
- **Files:** `content/pages.mjs`, particularly cooperative-projects, social-web, review, setup, EOI, bigger-picture and financial-model explanatory copy.
- **Done when:** Concrete benefit/cost/statistical claims have a relevant source/date or are explicitly assumptions. Guarantees are not implied by a general disclaimer elsewhere. Any factual research uses authoritative sources; formula agreement is described as arithmetic verification, not validation of the proposal.

### 18. Explain local computation, external maps and saved data accurately

- [ ] **Source:** The site-planner introduction says “Nothing is stored or sent anywhere”, yet location search sends queries to Nominatim, building scan sends coordinates to Overpass, map tiles come from external providers, and adding a report entry stores it in the browser. The lab's general “nothing is transmitted to a server” wording is similarly broad.
- **Change:** State plainly that model calculations run locally, saved reports live on this browser, and optional map/search services make external requests. Put concise explanations beside the relevant feature. Move low-level implementation details such as JSON-LD and hash/runtime versions out of the primary visitor flow unless needed for verification.
- **Files:** `content/pages.mjs`; map/search behavior and empty/error states in `assets/sites.js` and `assets/sunmap.js`; model status copy in `assets/model-app.js`.
- **Done when:** Privacy/storage statements match actual behavior, including search and building scan. Users know what survives refresh and what needs export. No new tracking or data service is introduced as part of this task.

### 19. Polish model saving, reporting and error feedback

- [ ] **Source / verify:** Model and report persistence write directly to `localStorage` without handling failed writes; import failures do have a status message. A financial JSON export and the accumulated report serve different purposes, but the toolbar does not make that distinction especially clear. Report printing was not exercised in this review.
- **Change:** Handle storage failures without losing the current in-memory work; offer the appropriate export route. Clarify which state Save/Export JSON captures, whether site edits are included, and that PDF export opens the browser print flow. Review unsaved scenario replacement, import validation, empty report, reset/delete feedback and the feedback when site inputs are transferred into other models.
- **Files:** `assets/model-app.js`, `assets/sites.js`, model markup and print CSS.
- **Done when:** A synthetic model can be saved, restored and exported; an invalid import fails clearly; unavailable storage has a recovery path; and a multi-entry report prints legibly with its assumptions and status. Do not overwrite/delete a user's existing saved data during testing.

## P3 — Finish media, metadata and maintenance polish

### 20. Reserve media space and improve embedded-content fallbacks

- [ ] **Source:** The JPEG illustrations omit intrinsic width/height and lazy-loading hints. The Vimeo/YouTube embeds load directly, and the YouTube frame has the generic title “YouTube video player”.
- **Change:** Add correct intrinsic dimensions/aspect ratios and suitable loading behavior; defer below-fold images/embeds. Give every film a descriptive title, a direct viewing link and an adjacent summary/transcript route where available. Keep generated/concept artwork clearly captioned; do not imply photos of an operating site.
- **Files:** Media markup in `content/pages.mjs`; media styles; existing assets.
- **Done when:** Slow loading does not shift surrounding text substantially; blocked embeds leave useful context; media remain readable on phones. Measure before converting/compressing assets, and preserve quality.

### 21. Polish loading, unavailable and empty states for external data

- [ ] **Source / verify:** Site geosearch silently hides results on no match or network failure. Other map components have partial fallback behavior. The review did not simulate offline conditions.
- **Change:** Distinguish searching, no results and request failure; prevent stale search results from replacing newer ones. Make manual entry and the map's limits obvious when services fail. Preserve calculator access if optional maps or financial-model data cannot load.
- **Files:** `assets/sites.js`, `assets/sunmap.js`, `assets/model-app.js`, and associated markup.
- **Done when:** Offline/failed-request checks produce an understandable recovery path, not a blank or inert widget. Users can still enter assumptions manually wherever the page promises this.

### 22. Finish metadata and deployment-aware discovery

- [ ] **Source / verify:** All pages share one Open Graph image; canonical URLs are hard-coded to `https://civics.au/{slug}.html`, while the Worker configuration names `dev.civics.au`. The build emits no sitemap or robots file and treats confirmation/404 pages like ordinary indexable pages.
- **Change:** Confirm the intended public canonical origin and URL format against hosting behavior. Make metadata generation environment-aware where necessary; add deliberate indexing rules for preview/utility pages and generate a sitemap from public page metadata. Retain useful descriptions and add differentiated share images only where worthwhile.
- **Files:** `scripts/build.mjs`, deployment configuration and page metadata.
- **Done when:** Canonicals, redirects and sitemap agree for the intended public deployment; preview/success/error pages have deliberate indexing behavior; share previews use valid absolute assets. Do not change DNS or publish as part of verification.

### 23. Update the maintenance guide and remove misleading setup instructions

- [ ] **Source:** README lists 14 published pages although there are 38, describes only three setup choices instead of five, and says all features work directly from files without dependencies. The model fetches JSON over HTTP and maps/embeds use external services. The Worker header describes MailChannels although the handler uses Resend.
- **Change:** Update README with the current route groups, source-of-truth files, local server instructions, external dependencies, actual EOI provider, and the distinction between static and Worker hosting. Explain how to build/check and where generated files belong. Make any outdated runtime warning cleanup a small separate change; the model currently logs a deprecated WASM-initialization warning.
- **Files:** `README.md`, comments in `src/index.js`, relevant initialization in `assets/model-app.js`.
- **Done when:** A new agent can run and verify the site from documented steps without inferring missing behavior or mistaking the local EOI stub for production delivery.

## Route-by-route final pass

All rows were visited during this review. The implementing agent should tick them only after checking the polished version at desktop and phone widths. Apply shared fixes consistently rather than redesigning each route separately.

| Complete | Routes | Main focus |
| --- | --- | --- |
| [ ] | `index.html` | Hero hierarchy, concrete orientation, component-card rhythm |
| [ ] | `plain-terms.html`, `the-problem.html` | Short introduction, film fallback, reading routes |
| [ ] | `a-place-to-land.html`, `the-way-through.html` | Practical next action, concise layout |
| [ ] | `data-safe.html`, `knowledge-bank.html`, `guardianship.html` | Stepper, first-use definitions, limits |
| [ ] | `web-of-data.html`, `honest-helpers.html`, `fair-loop.html` | Short-page rhythm, examples and glossary links |
| [ ] | `proofs-you-carry.html`, `community-ledger.html`, `new-ecosystem.html` | Clear terminology and proposal status |
| [ ] | `bigger-picture.html`, `glossary.html` | Sources, term navigation, useful exits |
| [ ] | `solarpunk.html`, `the-idea.html` | Media and continuation into practical community pages |
| [ ] | `walkabout.html`, `setup.html`, `site-planner.html` | Audience path, controls, comparisons, responsive layout |
| [ ] | `community-grounds.html`, `infrastructure.html`, `journey-out.html`, `review.html` | Tables, assumptions, sources, consistent stay/rate wording |
| [ ] | `concession-card.html`, `databox.html` | Technical structure, definitions, concise examples |
| [ ] | `model.html` | All five tabs, validation, accessible inputs, storage and print |
| [ ] | `opportunities.html`, `digital-economy.html`, `cooperative-projects.html` | Descriptive links, demonstration status, viewer/stepper/simulator |
| [ ] | `community-library.html`, `social-web.html`, `food-health.html` | Proposal limits, accessibility, cross-links |
| [ ] | `it-support.html`, `community-manifold.html`, `international.html` | Terminology, practical next step, consistent visual rhythm |
| [ ] | `eoi.html`, `eoi-sent.html`, `404.html` | Form branches/errors, confirmation layout, recovery |

## Final verification and handback

- [ ] Run `npm run build`, then `npm run check`; inspect the diff for accidental content or generated-file churn.
- [ ] Recheck key routes at 320px, 390px, 768px and a normal desktop width, plus 200% browser zoom. Compare document scroll width to client width; allow scrolling inside designated tables only.
- [ ] Walk the main journeys with keyboard alone: navigation → article → planner → results; model tabs; shared steppers; EOI conditional fields and errors. Check focus visibility and one screen-reader pass where available.
- [ ] Verify calculator changes with meaningful regression cases, retaining the workbook baseline. Do not add tests that merely mirror CSS or implementation details.
- [ ] Exercise all EOI interest branches and mocked failure paths. Record real delivery as unverified unless separately coordinated and actually checked.
- [ ] Inspect representative screenshots and a printed model report for clipping, orphaned labels, split tables and overlapping controls. Check reduced-motion behavior for scripted scrolling as well as CSS.
- [ ] Recheck console errors and unavailable external services; record any remaining external dependency failures honestly.
- [ ] Hand back completed task IDs, changed source files, verification results, representative before/after screenshots, and unresolved factual/product decisions. Leave unresolved boxes unchecked with a short reason. Do not deploy automatically.
