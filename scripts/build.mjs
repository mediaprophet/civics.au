import { writeFile, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pages } from '../content/pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const v = Math.floor(Date.now() / 1000);
const escape = value => String(value || '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// Brand icon: Home on wheels with chassis, wheels, tow tongue, and signature terracotta sun
const brand = `<a class="brand" href="index.html" aria-label="civics.au home"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 19L20 6l14 13M11 19v7h18v-7M17 26v-4h6v4M5 26h6M3 31h34" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="15" cy="28.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="25" cy="28.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="32" cy="7" r="3" fill="#b6472b"/></svg>civics.au</a>`;

await mkdir(dist, { recursive: true });
await cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });
try {
  await cp(path.join(root, '.nojekyll'), path.join(dist, '.nojekyll'));
} catch {}

function renderHead({ title, description, slug, pageType = 'WebPage', map = false, sites = false }) {
  const safeTitle = escape(title);
  const safeDesc = escape(description);
  const pageUrl = `https://civics.au/${slug}.html`;
  const groundsImg = 'https://civics.au/assets/civics-au-cg.jpg';

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
        'image': { '@type': 'ImageObject', 'url': groundsImg },
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
<link rel="stylesheet" href="assets/styles.css?v=${v}">

<!-- Open Graph Protocol (OGP) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="civics.au">
<meta property="og:title" content="${safeTitle} | civics.au">
<meta property="og:description" content="${safeDesc}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:image" content="${groundsImg}">
<meta property="og:image:alt" content="civics.au — community grounds concept artwork">
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

${map ? `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="" defer></script>
<script src="assets/sunmap.js?v=${v}" defer></script>` : ''}
${sites ? `<script src="assets/sites.js?v=${v}" defer></script>` : ''}
<script src="assets/site.js?v=${v}" defer></script>
</head>`;
}

const ordered = [...pages].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
const renderNav = current => {
  const link = p => {
    const i = ordered.indexOf(p);
    return `<a href="${p.slug}.html"${p.slug === current ? ' aria-current="page"' : ''}><span class="num">${String(i).padStart(2, '0')}</span>${escape(p.nav)}</a>`;
  };
  const items = [];
  let group, buf = [], groupIndex = 0;
  const flush = () => {
    if (!buf.length) return;
    if (!group) items.push(...buf.map(link));
    else {
      const active = buf.some(p => p.slug === current);
      const menuId = `nav-group-${groupIndex++}`;
      items.push(`<div class="nav-drop"><button class="nav-drop-btn" type="button" aria-expanded="false" aria-controls="${menuId}"${active ? ' data-current' : ''}>${escape(group)}<svg class="caret" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button><div class="nav-drop-menu" id="${menuId}">${buf.map(link).join('')}</div></div>`);
    }
    buf = [];
  };
  for (const p of ordered) {
    if (p.group !== group) { flush(); group = p.group; }
    buf.push(p);
  }
  flush();
  return `<button class="nav-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="Toggle navigation"><span></span><span></span><span></span></button><div class="nav-links" id="nav-links">${items.join('')}</div>`;
};

for (const page of pages) {
  const navHtml = renderNav(page.slug);
  const next = pages.find(p => p.slug === page.next);
  const nextLink = next ? `<a class="next-page" href="${next.slug}.html"><div><small>${next.slug === 'index' ? 'Return to the overview' : 'Continue exploring'}</small><strong>${escape(next.nav)}</strong></div><span aria-hidden="true">↗</span></a>` : '';
  const heroFigure = `<figure class="ground-figure"><div class="figure-top"><span>The shared ground</span><span>Concept / 01</span></div><img src="assets/grounds.svg" alt="Concept diagram: a shared oval surrounded by solar sheds, a community hub, battery, amenities and homes on wheels, connected to the town." width="560" height="450" style="width:100%;height:auto;display:block"><figcaption>One place. Several purposes. An illustration, not a site design.</figcaption></figure>`;
  const heroCtas = page.heroCtas || [{ href: 'walkabout.html', label: 'For participants: the Walkabout Strategy' }, { href: 'community-grounds.html', label: 'For communities: the grounds', alt: true }];
  const hero = `<div class="hero"><div><p class="eyebrow">${escape(page.heroEyebrow || 'Community grounds / An Australian proposal')}</p><h1>${page.heroTitle || 'A place to land.<br>Room to move.'}</h1><p class="intro">${escape(page.heroIntro || 'Shared places, homes on wheels and civics infrastructure that give people more room to rebuild their lives—and communities more capacity to thrive.')}</p><div class="hero-ctas">${heroCtas.map(c => `<a class="button${c.alt ? ' alt' : ''}" href="${c.href}">${escape(c.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div>${page.heroNote || ''}<span class="draft">Concept notes · Initial draft for discussion</span></div>${page.heroFigure === false ? '' : heroFigure}</div>`;
  let body;
  if (page.hero) {
    body = hero + page.sections.map(s => `<div id="${s.id}">${s.html}</div>`).join('');
  } else if (page.toc === 'right') {
    const tocLinks = page.sections.map(s => `<a href="#${s.id}">${escape(s.title)}</a>`).join('');
    const rightToc = `<details class="toc toc--right"><summary class="label toc-summary">On this page</summary><div class="toc-panel">${tocLinks}<p class="reading-note">Part of the civics.au concept collection.<br><a href="review.html#reading-the-source">Intentions, assumptions &amp; sources ↗</a></p></div></details>`;
    body = `<header class="page-head"><p class="eyebrow">${escape(page.eyebrow)}</p><h1>${escape(page.title)}</h1><p class="intro">${escape(page.intro)}</p><span class="draft">Concept notes · Initial draft for discussion</span></header><div class="reading reading--full">${rightToc}<article class="article article--full">${page.sections.map(s => `<section id="${s.id}" aria-labelledby="${s.id}-title"><h2 id="${s.id}-title">${escape(s.title)}</h2>${s.html}</section>`).join('')}${nextLink}</article></div>`;
  } else if (page.toc === false) {
    body = `<header class="page-head"><p class="eyebrow">${escape(page.eyebrow)}</p><h1>${escape(page.title)}</h1><p class="intro">${escape(page.intro)}</p><span class="draft">Concept notes · Initial draft for discussion</span></header><div class="reading reading--full"><article class="article article--full">${page.sections.map(s => `<section id="${s.id}" aria-labelledby="${s.id}-title"><h2 id="${s.id}-title">${escape(s.title)}</h2>${s.html}</section>`).join('')}${nextLink}</article></div>`;
  } else {
    body = `<header class="page-head"><p class="eyebrow">${escape(page.eyebrow)}</p><h1>${escape(page.title)}</h1><p class="intro">${escape(page.intro)}</p><span class="draft">Concept notes · Initial draft for discussion</span></header><div class="reading"><details class="toc" open><summary class="label toc-summary">On this page</summary>${page.sections.map(s => `<a href="#${s.id}">${escape(s.title)}</a>`).join('')}<p class="reading-note">Part of the civics.au concept collection.<br><a href="review.html#reading-the-source">Intentions, assumptions & sources ↗</a></p></details><article class="article">${page.sections.map(s => `<section id="${s.id}" aria-labelledby="${s.id}-title"><h2 id="${s.id}-title">${escape(s.title)}</h2>${s.html}</section>`).join('')}${nextLink}</article></div>`;
  }

  const pageTitle = page.htmlTitle || (page.hero ? 'Community Grounds — A place to land. Room to move.' : page.nav);
  const pageType = page.slug === 'eoi' ? 'ContactPage' : (page.slug === 'index' ? 'WebSite' : 'WebPage');
  const headHtml = renderHead({ title: pageTitle, description: page.description, slug: page.slug, pageType, map: page.map, sites: page.sites });

  const html = `<!doctype html>
<html lang="en-AU"><head prefix="og: https://ogp.me/ns#">${headHtml.replace('<head>', '').replace('</head>', '')}</head><body><a class="skip" href="#main">Skip to content</a><div class="wrap"><header class="masthead">${brand}<span class="mast-note">Ideas for a more resilient society<br>Australia → the world</span></header><nav class="nav" aria-label="Main navigation">${navHtml}</nav><main id="main">${body}</main><footer class="footer"><span>civics.au · A civics ecosystem · Concept collection · September 2026</span><div><a href="review.html#sources">Sources & scope</a><a href="review.html#pilot-questions">Questions for a pilot</a></div></footer></div></body></html>\n`;

  await writeFile(path.join(root, `${page.slug}.html`), html);
  await writeFile(path.join(dist, `${page.slug}.html`), html);
  console.log(`Built ${page.slug}.html`);
}

// Generate 404 page
const notFoundNavHtml = renderNav('404');
const notFoundBody = `<header class="page-head"><p class="eyebrow">404 / Not Found</p><h1>Page not found</h1><p class="intro">The page you were looking for doesn't exist or has moved.</p></header><div class="reading reading--full"><article class="article article--full utility-page"><p>You can return to the main overview or explore one of the concept sections above.</p><p style="margin-top:2rem"><a class="button" href="index.html">Return to the overview <span aria-hidden="true">↗</span></a></p></article></div>`;
const notFoundHead = renderHead({ title: 'Page not found', description: 'The page you requested could not be found.', slug: '404', pageType: 'WebPage' });
const notFoundHtml = `<!doctype html>
<html lang="en-AU"><head prefix="og: https://ogp.me/ns#">${notFoundHead.replace('<head>', '').replace('</head>', '')}</head><body><a class="skip" href="#main">Skip to content</a><div class="wrap"><header class="masthead">${brand}<span class="mast-note">Ideas for a more resilient society<br>Australia → the world</span></header><nav class="nav" aria-label="Main navigation">${notFoundNavHtml}</nav><main id="main">${notFoundBody}</main><footer class="footer"><span>civics.au · A civics ecosystem · Concept collection · September 2026</span><div><a href="review.html#sources">Sources & scope</a><a href="review.html#pilot-questions">Questions for a pilot</a></div></footer></div></body></html>\n`;
await writeFile(path.join(root, '404.html'), notFoundHtml);
await writeFile(path.join(dist, '404.html'), notFoundHtml);
console.log('Built 404.html');

// Generate EOI success page (eoi-sent.html)
const sentNavHtml = renderNav('eoi-sent');
const sentBody = `<header class="page-head"><p class="eyebrow">Expression of interest</p><h1>Thank you — we'll be in touch.</h1><p class="intro">Your expression of interest has been received and forwarded to the civics.au team at info@civics.au.</p></header><div class="reading reading--full"><article class="article article--full utility-page"><div class="eoi-success"><h2>What happens next?</h2><p>A member of the team will review your submission and respond by email within a few business days. If you have an urgent enquiry, you can also reach us directly at <a href="mailto:info@civics.au">info@civics.au</a>.</p></div><p style="margin-top:2.5rem"><a class="button" href="index.html">Return to the overview <span aria-hidden="true">↗</span></a></p></article></div>`;
const sentHead = renderHead({ title: 'Expression of interest received', description: 'Your expression of interest has been received by the civics.au team.', slug: 'eoi-sent', pageType: 'WebPage' });
const sentHtml = `<!doctype html>
<html lang="en-AU"><head prefix="og: https://ogp.me/ns#">${sentHead.replace('<head>', '').replace('</head>', '')}</head><body><a class="skip" href="#main">Skip to content</a><div class="wrap"><header class="masthead">${brand}<span class="mast-note">Ideas for a more resilient society<br>Australia → the world</span></header><nav class="nav" aria-label="Main navigation">${sentNavHtml}</nav><main id="main">${sentBody}</main><footer class="footer"><span>civics.au · A civics ecosystem · Concept collection · September 2026</span><div><a href="review.html#sources">Sources & scope</a><a href="review.html#pilot-questions">Questions for a pilot</a></div></footer></div></body></html>\n`;
await writeFile(path.join(root, 'eoi-sent.html'), sentHtml);
await writeFile(path.join(dist, 'eoi-sent.html'), sentHtml);
console.log('Built eoi-sent.html');
