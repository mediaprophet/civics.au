import { writeFile, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pages } from '../content/pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const escape = value => String(value || '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// Brand icon: Home on wheels with chassis, wheels, tow tongue, and signature terracotta sun
const brand = `<a class="brand" href="index.html" aria-label="civics.au home"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 19L20 6l14 13M11 19v7h18v-7M17 26v-4h6v4M5 26h6M3 31h34" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="15" cy="28.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="25" cy="28.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="32" cy="7" r="3" fill="#b6472b"/></svg>civics.au</a>`;

await mkdir(dist, { recursive: true });
await cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });
try {
  await cp(path.join(root, '.nojekyll'), path.join(dist, '.nojekyll'));
} catch {}

function renderHead({ title, description, slug, pageType = 'WebPage' }) {
  const safeTitle = escape(title);
  const safeDesc = escape(description);
  const pageUrl = `https://civics.au/${slug}.html`;
  const groundsImg = 'https://civics.au/assets/grounds.svg';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://civics.au/#website',
        'url': 'https://civics.au/',
        'name': 'civics.au',
        'description': 'Ideas for a more resilient society — Australia → the world',
        'publisher': {
          '@type': 'Organization',
          '@id': 'https://civics.au/#organization',
          'name': 'civics.au',
          'url': 'https://civics.au/',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://civics.au/assets/favicon.svg'
          },
          'email': 'info@civics.au'
        },
        'inLanguage': 'en-AU'
      },
      {
        '@type': pageType,
        '@id': `${pageUrl}#${pageType.toLowerCase()}`,
        'url': pageUrl,
        'name': title,
        'description': description,
        'isPartOf': { '@id': 'https://civics.au/#website' },
        'inLanguage': 'en-AU',
        'about': [
          { '@type': 'Thing', 'name': 'Community Grounds' },
          { '@type': 'Thing', 'name': 'Homes on Wheels' },
          { '@type': 'Thing', 'name': 'Walkabout Strategy' },
          { '@type': 'Thing', 'name': 'Civics Infrastructure' },
          { '@type': 'Thing', 'name': 'W3C Solid interoperable data pods' }
        ]
      }
    ]
  };

  if (slug === 'eoi') {
    schema['@graph'].push({
      '@type': 'ContactPoint',
      'contactType': 'Expressions of Interest',
      'email': 'info@civics.au',
      'availableLanguage': 'English',
      'areaServed': 'AU'
    });
  }

  const jsonLd = JSON.stringify(schema, null, 2);

  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle} | civics.au</title>
<meta name="description" content="${safeDesc}">
<meta name="theme-color" content="#183e37">
<link rel="canonical" href="${pageUrl}">
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="stylesheet" href="assets/styles.css">

<!-- Open Graph Protocol (OGP) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="civics.au">
<meta property="og:title" content="${safeTitle} | civics.au">
<meta property="og:description" content="${safeDesc}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:image" content="${groundsImg}">
<meta property="og:image:alt" content="civics.au — Community grounds concept illustration">
<meta property="og:locale" content="en_AU">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${safeTitle} | civics.au">
<meta name="twitter:description" content="${safeDesc}">
<meta name="twitter:image" content="${groundsImg}">

<!-- Schema.org RDF (JSON-LD) -->
<script type="application/ld+json">
${jsonLd}
</script>

<script src="assets/site.js" defer></script>
</head>`;
}

for (const page of pages) {
  const nav = pages.map((p, i) => `<a href="${p.slug}.html"${p.slug === page.slug ? ' aria-current="page"' : ''}><span class="num">0${i}</span>${escape(p.nav)}</a>`).join('');
  const navHtml = `<button class="nav-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="Toggle navigation"><span></span><span></span><span></span></button><div class="nav-links" id="nav-links">${nav}</div>`;
  const next = pages.find(p => p.slug === page.next);
  const nextLink = next ? `<a class="next-page" href="${next.slug}.html"><div><small>${next.slug === 'index' ? 'Return to the overview' : 'Continue exploring'}</small><strong>${escape(next.nav)}</strong></div><span aria-hidden="true">↗</span></a>` : '';
  const hero = `<div class="hero"><div><p class="eyebrow">Community grounds / An Australian proposal</p><h1>A place to land.<br>Room to move.</h1><p class="intro">Shared places, homes on wheels and civics infrastructure that give people more room to rebuild their lives—and communities more capacity to thrive.</p><a class="button" href="community-grounds.html">Explore community grounds <span aria-hidden="true">↗</span></a><br><span class="draft">Concept notes · Initial draft for discussion</span></div><figure class="ground-figure"><div class="figure-top"><span>The shared ground</span><span>Concept / 01</span></div><img src="assets/grounds.svg" alt="Concept diagram: a shared oval surrounded by solar sheds, a community hub, battery, amenities and homes on wheels, connected to the town." width="560" height="450" style="width:100%;height:auto;display:block"><figcaption>One place. Several purposes. An illustration, not a site design.</figcaption></figure></div>`;
  const body = page.hero ? hero + page.sections.map(s => `<div id="${s.id}">${s.html}</div>`).join('') : `<header class="page-head"><p class="eyebrow">${escape(page.eyebrow)}</p><h1>${escape(page.title)}</h1><p class="intro">${escape(page.intro)}</p><span class="draft">Concept notes · Initial draft for discussion</span></header><div class="reading"><aside class="toc" aria-label="On this page"><p class="label">On this page</p>${page.sections.map(s => `<a href="#${s.id}">${escape(s.title)}</a>`).join('')}<p class="reading-note">Part of the Community Grounds concept collection.<br><a href="review.html#reading-the-source">Intentions, assumptions & sources ↗</a></p></aside><article class="article">${page.sections.map(s => `<section id="${s.id}" aria-labelledby="${s.id}-title"><h2 id="${s.id}-title">${escape(s.title)}</h2>${s.html}</section>`).join('')}${nextLink}</article></div>`;

  const pageTitle = page.hero ? 'Community Grounds — A place to land. Room to move.' : page.nav;
  const pageType = page.slug === 'eoi' ? 'ContactPage' : (page.hero ? 'WebSite' : 'WebPage');
  const headHtml = renderHead({ title: pageTitle, description: page.description, slug: page.slug, pageType });

  const html = `<!doctype html>
<html lang="en-AU"><head prefix="og: https://ogp.me/ns#">${headHtml.replace('<head>', '').replace('</head>', '')}</head><body><a class="skip" href="#main">Skip to content</a><div class="wrap"><header class="masthead">${brand}<span class="mast-note">Ideas for a more resilient society<br>Australia → the world</span></header><nav class="nav" aria-label="Main navigation">${navHtml}</nav><main id="main">${body}</main><footer class="footer"><span>civics.au / Community Grounds · Concept collection · September 2026</span><div><a href="review.html#sources">Sources & scope</a><a href="review.html#pilot-questions">Questions for a pilot</a></div></footer></div></body></html>\n`;

  await writeFile(path.join(root, `${page.slug}.html`), html);
  await writeFile(path.join(dist, `${page.slug}.html`), html);
  console.log(`Built ${page.slug}.html`);
}

// Generate 404 page
const notFoundNav = pages.map((p, i) => `<a href="${p.slug}.html"><span class="num">0${i}</span>${escape(p.nav)}</a>`).join('');
const notFoundNavHtml = `<button class="nav-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="Toggle navigation"><span></span><span></span><span></span></button><div class="nav-links" id="nav-links">${notFoundNav}</div>`;
const notFoundBody = `<header class="page-head"><p class="eyebrow">404 / Not Found</p><h1>Page not found</h1><p class="intro">The page you were looking for doesn't exist or has moved.</p></header><div class="reading"><article class="article"><p>You can return to the main overview or explore one of the concept sections above.</p><p style="margin-top:2rem"><a class="button" href="index.html">Return to the overview <span aria-hidden="true">↗</span></a></p></article></div>`;
const notFoundHead = renderHead({ title: 'Page not found', description: 'The page you requested could not be found.', slug: '404', pageType: 'WebPage' });
const notFoundHtml = `<!doctype html>
<html lang="en-AU"><head prefix="og: https://ogp.me/ns#">${notFoundHead.replace('<head>', '').replace('</head>', '')}</head><body><a class="skip" href="#main">Skip to content</a><div class="wrap"><header class="masthead">${brand}<span class="mast-note">Ideas for a more resilient society<br>Australia → the world</span></header><nav class="nav" aria-label="Main navigation">${notFoundNavHtml}</nav><main id="main">${notFoundBody}</main><footer class="footer"><span>civics.au / Community Grounds · Concept collection · September 2026</span><div><a href="review.html#sources">Sources & scope</a><a href="review.html#pilot-questions">Questions for a pilot</a></div></footer></div></body></html>\n`;
await writeFile(path.join(root, '404.html'), notFoundHtml);
await writeFile(path.join(dist, '404.html'), notFoundHtml);
console.log('Built 404.html');

// Generate EOI success page (eoi-sent.html)
const sentNav = pages.map((p, i) => `<a href="${p.slug}.html"><span class="num">0${i}</span>${escape(p.nav)}</a>`).join('');
const sentNavHtml = `<button class="nav-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="Toggle navigation"><span></span><span></span><span></span></button><div class="nav-links" id="nav-links">${sentNav}</div>`;
const sentBody = `<header class="page-head"><p class="eyebrow">Expression of interest</p><h1>Thank you — we'll be in touch.</h1><p class="intro">Your expression of interest has been received and forwarded to the civics.au team at info@civics.au.</p></header><div class="reading"><article class="article"><div class="eoi-success"><h3>What happens next?</h3><p>A member of the team will review your submission and respond by email within a few business days. If you have an urgent enquiry, you can also reach us directly at <a href="mailto:info@civics.au">info@civics.au</a>.</p></div><p style="margin-top:2.5rem"><a class="button" href="index.html">Return to the overview <span aria-hidden="true">↗</span></a></p></article></div>`;
const sentHead = renderHead({ title: 'Expression of interest received', description: 'Your expression of interest has been received by the civics.au team.', slug: 'eoi-sent', pageType: 'WebPage' });
const sentHtml = `<!doctype html>
<html lang="en-AU"><head prefix="og: https://ogp.me/ns#">${sentHead.replace('<head>', '').replace('</head>', '')}</head><body><a class="skip" href="#main">Skip to content</a><div class="wrap"><header class="masthead">${brand}<span class="mast-note">Ideas for a more resilient society<br>Australia → the world</span></header><nav class="nav" aria-label="Main navigation">${sentNavHtml}</nav><main id="main">${sentBody}</main><footer class="footer"><span>civics.au / Community Grounds · Concept collection · September 2026</span><div><a href="review.html#sources">Sources & scope</a><a href="review.html#pilot-questions">Questions for a pilot</a></div></footer></div></body></html>\n`;
await writeFile(path.join(root, 'eoi-sent.html'), sentHtml);
await writeFile(path.join(dist, 'eoi-sent.html'), sentHtml);
console.log('Built eoi-sent.html');
