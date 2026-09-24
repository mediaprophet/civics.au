/**
 * civics.au — Cloudflare Worker
 * Serves static assets and handles EOI form submissions via MailChannels.
 *
 * ── Setup steps ──────────────────────────────────────────────────────────────
 * 1. Create a Turnstile widget at dash.cloudflare.com → Turnstile
 *    - Copy the Site Key into the EOI form HTML (TURNSTILE_SITE_KEY placeholder)
 *    - Run: wrangler secret put TURNSTILE_SECRET   (paste your Secret Key)
 *
 * 2. Add this DNS TXT record so MailChannels trusts your Worker to send mail:
 *    Type: TXT   Name: _mailchannels   Value: v=mc1 cfid=civics-au.workers.dev
 *
 * During development, test keys are used (always pass). Replace before go-live.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const RECIPIENT    = 'info@civics.au';
const FROM_ADDRESS = 'noreply@civics.au';
const FROM_NAME    = 'civics.au — Expression of Interest';
const SITE_ORIGIN  = 'https://dev.civics.au';

// Cloudflare Turnstile siteverify endpoint
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Fallback test secret — always passes. Replace with real key via wrangler secret.
const TEST_SECRET = '1x0000000000000000000000000000000AA';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cleanPath = url.pathname.replace(/\/$/, '');

    if (request.method === 'POST' && (cleanPath === '/eoi' || cleanPath === '/eoi.html')) {
      return handleEOI(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleEOI(request, env) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/x-www-form-urlencoded') &&
      !contentType.includes('multipart/form-data')) {
    return new Response('Bad Request', { status: 400 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return redirectTo('/eoi.html?error=validation', request);
  }

  const honeypot  = formData.get('website') || '';
  const token     = formData.get('cf-turnstile-response') || '';
  const name                  = sanitise(formData.get('name') || '');
  const email                 = sanitise(formData.get('email') || '');
  const organisation          = sanitise(formData.get('organisation') || '');
  const role                  = sanitise(formData.get('role') || '');
  const phone                 = sanitise(formData.get('phone') || '');
  const state                 = sanitise(formData.get('state') || '');
  const respondentType        = sanitise(formData.get('respondent_type') || '');
  const geographicScope       = sanitise(formData.get('geographic_scope') || '');
  const location              = sanitise(formData.get('location') || '');
  const participationInterest = sanitiseAll(formData.getAll('participation_interest'));
  const longerConnection      = sanitise(formData.get('longer_connection') || '');
  const supportTypes          = sanitiseAll(formData.getAll('support_type'));
  const fundingStage          = sanitise(formData.get('funding_stage') || '');
  const timing                = sanitise(formData.get('timing') || '');
  const offer                 = sanitise(formData.get('offer') || '');
  const siteDetails           = sanitise(formData.get('site_details') || '');
  const story                 = sanitise(formData.get('story') || '');
  const message               = sanitise(formData.get('message') || '');
  const publicationPermission = sanitise(formData.get('publication_permission') || 'private');

  // Silent drop for bots filling the honeypot
  if (honeypot) return redirectTo('/eoi-sent.html', request);

  // Basic field validation
  if (!name || !email || !email.includes('@') || !respondentType) {
    return redirectTo('/eoi.html?error=validation', request);
  }

  // ── Turnstile verification ─────────────────────────────────────────────────
  if (!token) return redirectTo('/eoi.html?error=captcha', request);

  const secret = env.TURNSTILE_SECRET || TEST_SECRET;
  const ip     = request.headers.get('CF-Connecting-IP') || '';

  let verifyResp;
  try {
    verifyResp = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip })
    });
  } catch (err) {
    console.error('Turnstile verification request failed', err);
    return redirectTo('/eoi.html?error=verification', request);
  }

  let verifyData;
  try {
    verifyData = await verifyResp.json();
  } catch {
    return redirectTo('/eoi.html?error=captcha', request);
  }

  if (!verifyData.success) {
    console.error('Turnstile verification failed', verifyData['error-codes']);
    return redirectTo('/eoi.html?error=captcha', request);
  }
  // ──────────────────────────────────────────────────────────────────────────

  const submission = {
    reference: crypto.randomUUID(), name, email, organisation, role, phone, state,
    respondentType, geographicScope, location, participationInterest, longerConnection,
    supportTypes, fundingStage, timing, offer, siteDetails, story, message, publicationPermission
  };
  const body = buildEmailBody(submission);
  const rdfAttachment = buildRdfAttachment(submission);

  const resendApiKey = env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('Missing RESEND_API_KEY binding');
    return redirectTo('/eoi.html?error=send', request);
  }

  const fromSender = env.RESEND_FROM || 'civics.au <noreply@civics.au>';

  const emailPayload = {
    from: fromSender,
    to: [RECIPIENT],
    reply_to: email,
    subject: `[EOI] ${name} — ${label(respondentType) || 'Expression of Interest'}`,
    text: body.text,
    html: body.html,
    attachments: [rdfAttachment]
  };

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error('Resend error', resp.status, errBody);
      return redirectTo('/eoi.html?error=send', request);
    }
  } catch (err) {
    console.error('Resend fetch failed', err);
    return redirectTo('/eoi.html?error=send', request);
  }

  return redirectTo('/eoi-sent.html', request);
}

function redirectTo(path, request) {
  const origin = request ? new URL(request.url).origin : SITE_ORIGIN;
  return Response.redirect(`${origin}${path}`, 303);
}

function sanitise(str, maxLength = 4000) {
  return String(str).trim().slice(0, maxLength);
}

function sanitiseAll(values) {
  return values.map(value => sanitise(value, 200)).filter(Boolean).slice(0, 20);
}

function label(value) {
  return String(value || '').replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function display(value) {
  if (Array.isArray(value)) return value.length ? value.map(label).join(', ') : '—';
  return value || '—';
}

function buildEmailBody(submission) {
  const {
    reference, name, email, organisation, role, phone, state, respondentType, geographicScope,
    location, participationInterest, longerConnection, supportTypes, fundingStage, timing,
    offer, siteDetails, story, message, publicationPermission
  } = submission;
  const now = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });
  const rows = [
    ['Reference', reference], ['Name', name], ['Email', email], ['Organisation', organisation],
    ['Role', role], ['Phone', phone], ['State / Territory', state], ['Interest type', label(respondentType)],
    ['Geographic scope', label(geographicScope)], ['Town, region or site', location],
    ['Participation interest', display(participationInterest)], ['Longer location connection', longerConnection],
    ['Support types', display(supportTypes)], ['Funding stage', label(fundingStage)], ['Indicative timing', timing],
    ['Offer', offer], ['Site or facilities', siteDetails], ['Why it matters', story],
    ['Further context', message], ['Publication permission', label(publicationPermission)]
  ];

  const text = [
    'NEW EXPRESSION OF INTEREST — civics.au',
    '═'.repeat(50),
    '',
    ...rows.map(([field, value]) => `${field}: ${display(value)}`),
    '',
    `Submitted: ${now} AEST`,
    '',
    'A private JSON-LD catalogue record is attached. Reply directly to this email to respond to the enquirer.',
  ].join('\n');

  const htmlRows = rows.map(([field, value]) => `<div class="row"><span class="lbl">${escHtml(field)}</span><span class="val">${field === 'Email' ? `<a href="mailto:${escHtml(email)}">${escHtml(email)}</a>` : escHtml(display(value))}</span></div>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en-AU"><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;color:#183e37;max-width:620px;margin:0 auto;padding:24px}
h1{font-size:22px;border-bottom:2px solid #183e37;padding-bottom:10px}
.row{display:flex;gap:12px;padding:8px 0;border-bottom:1px solid #d7ddd1}
.lbl{font-weight:700;min-width:80px;color:#596b61;font-size:13px}
.val{font-size:14px}
.msg{background:#f7f6ef;border-left:3px solid #799367;padding:16px 20px;margin-top:16px;font-size:14px;line-height:1.6;white-space:pre-wrap}
.ft{margin-top:28px;font-size:12px;color:#596b61;border-top:1px solid #d7ddd1;padding-top:14px}
</style></head><body>
<h1>Expression of Interest — civics.au</h1>
${htmlRows}
<div class="ft">Submitted ${now} AEST via civics.au EOI form. A private JSON-LD catalogue record is attached. Reply directly to respond to the enquirer.</div>
</body></html>`;

  return { text, html };
}

function buildRdfAttachment(submission) {
  const submittedAt = new Date().toISOString();
  const { reference, name, email, organisation, role, phone, state, respondentType, geographicScope,
    location, participationInterest, longerConnection, supportTypes, fundingStage, timing,
    offer, siteDetails, story, message, publicationPermission } = submission;
  const record = {
    '@context': {
      'schema': 'https://schema.org/',
      'civics': 'https://civics.au/ns#',
      'supportType': 'civics:supportType',
      'respondentType': 'civics:respondentType',
      'geographicScope': 'civics:geographicScope',
      'publicationPermission': 'civics:publicationPermission',
      'participationInterest': 'civics:participationInterest',
      'privateIntake': 'civics:privateIntake'
    },
    '@id': `urn:uuid:${reference}`,
    '@type': ['schema:CreativeWork', 'civics:ExpressionOfInterest'],
    'schema:identifier': reference,
    'schema:dateCreated': submittedAt,
    'schema:isBasedOn': 'https://civics.au/eoi.html',
    'privateIntake': true,
    'respondentType': respondentType,
    'geographicScope': geographicScope || undefined,
    'schema:spatialCoverage': location || state ? { '@type': 'schema:Place', 'schema:name': location || state } : undefined,
    'supportType': supportTypes.length ? supportTypes : undefined,
    'participationInterest': participationInterest.length ? participationInterest : undefined,
    'publicationPermission': publicationPermission,
    'schema:author': {
      '@type': organisation ? 'schema:Organization' : 'schema:Person',
      'schema:name': organisation || name,
      'schema:contactPoint': {
        '@type': 'schema:ContactPoint', 'schema:name': name, 'schema:email': email,
        'schema:telephone': phone || undefined, 'schema:jobTitle': role || undefined
      }
    },
    'civics:longerLocationConnection': longerConnection || undefined,
    'civics:fundingStage': fundingStage || undefined,
    'civics:timing': timing || undefined,
    'civics:offer': offer || undefined,
    'civics:siteDetails': siteDetails || undefined,
    'schema:abstract': story || undefined,
    'schema:text': message || undefined
  };
  const json = JSON.stringify(record, null, 2);
  return {
    filename: `civics-eoi-${reference}.jsonld`,
    content: base64Encode(json)
  };
}

function base64Encode(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
