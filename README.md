# civics.au

Concept collection and web architecture exploring community grounds, the Walkabout Strategy, cooperative physical innovation, and connected civics infrastructure in regional Australia.

## Review the pages

Open `index.html` directly in a browser. All pages, styles and scripts work locally without external dependencies. Alternatively, run `npm run dev` and visit `http://127.0.0.1:4173`.

### Published Pages
1. **00 / The idea (`index.html`)**: Overview of community grounds, living costs, and Solarpunk philosophy.
2. **01 / Community grounds (`community-grounds.html`)**: The proposition, supporting life milestones, protecting grassroots innovators, everyday essentials, and global SDG alignment.
3. **02 / The Walkabout Strategy (`walkabout.html`)**: Australian concession card holder baseline (~$600/wk), $15/night electronic payments, living cost simulator, and 3-tier pricing architecture.
4. **03 / Generative infrastructure (`infrastructure.html`)**: Physical facilities, islandable renewable microgrids, and decentralised digital services.
5. **04 / Digital economy (`digital-economy.html`)**: W3C Solid-compatible portable data pods, offline-first edge controllers (Solid-CSS-Databox), transactive microgrids, and community AI orchestration hubs.
6. **05 / Cooperative projects (`cooperative-projects.html`)**: Version control for physical projects, 3-stage milestone pipeline, and real-world commit log inspector.
7. **06 / The journey out (`journey-out.html`)**: Transition framework, cohort profiles, stepping stones, and continued connection beyond the campsite.
8. **07 / Review & next steps (`review.html`)**: Economic hypotheses, pilot evaluation questions, and open-standard references.

## Development & Build

- `content/pages.mjs` holds the editorial content, page metadata and stable section identifiers.
- `scripts/build.mjs` generates the HTML files. Run `npm run build` after editing content or templates.
- `scripts/check.mjs` verifies local links, anchors, semantic markup, and content consistency. Run `npm run check`.
- `assets/styles.css`, `assets/site.js`, and `assets/grounds.svg` provide layout, interactive calculators, commit inspector, and original schematics.

No external package installation is required; scripts run with Node.js built-ins.

## GitHub Pages Deployment

The site is published to GitHub Pages via GitHub Actions:
- Workflow configuration: `.github/workflows/deploy.yml`
- Triggered automatically on push to `main` (and via manual workflow dispatch).
- Rebuilds all pages, verifies link and content integrity, and deploys static artifacts to GitHub Pages.
