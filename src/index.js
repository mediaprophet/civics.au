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

    if (request.method === 'POST' && url.pathname === '/eoi') {
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
    return redirectTo('/eoi.html?error=validation');
  }

  const honeypot  = formData.get('website') || '';
  const token     = formData.get('cf-turnstile-response') || '';
  const name      = sanitise(formData.get('name') || '');
  const email     = sanitise(formData.get('email') || '');
  const phone     = sanitise(formData.get('phone') || '');
  const state     = sanitise(formData.get('state') || '');
  const interest  = sanitise(formData.get('interest') || '');
  const message   = sanitise(formData.get('message') || '');

  // Silent drop for bots filling the honeypot
  if (honeypot) return redirectTo('/eoi-sent.html');

  // Basic field validation
  if (!name || !email || !email.includes('@')) {
    return redirectTo('/eoi.html?error=validation');
  }

  // ── Turnstile verification ─────────────────────────────────────────────────
  if (!token) return redirectTo('/eoi.html?error=captcha');

  const secret = env.TURNSTILE_SECRET || TEST_SECRET;
  const ip     = request.headers.get('CF-Connecting-IP') || '';

  const verifyResp = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip })
  });

  let verifyData;
  try {
    verifyData = await verifyResp.json();
  } catch {
    return redirectTo('/eoi.html?error=captcha');
  }

  if (!verifyData.success) {
    console.error('Turnstile verification failed', verifyData['error-codes']);
    return redirectTo('/eoi.html?error=captcha');
  }
  // ──────────────────────────────────────────────────────────────────────────

  const body = buildEmailBody({ name, email, phone, state, interest, message });

  const emailPayload = {
    personalizations: [{ to: [{ email: RECIPIENT, name: 'civics.au Team' }] }],
    from:     { email: FROM_ADDRESS, name: FROM_NAME },
    reply_to: { email: email, name: name },
    subject:  `[EOI] ${name} — ${interest || 'Expression of Interest'}`,
    content: [
      { type: 'text/plain', value: body.text },
      { type: 'text/html',  value: body.html }
    ]
  };

  try {
    const resp = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload)
    });
    if (resp.status >= 300 && resp.status !== 202) {
      console.error('MailChannels error', resp.status, await resp.text());
      return redirectTo('/eoi.html?error=send');
    }
  } catch (err) {
    console.error('MailChannels fetch failed', err);
    return redirectTo('/eoi.html?error=send');
  }

  return redirectTo('/eoi-sent.html');
}

function redirectTo(path) {
  return Response.redirect(`${SITE_ORIGIN}${path}`, 303);
}

function sanitise(str) {
  return String(str).trim().slice(0, 2000);
}

function buildEmailBody({ name, email, phone, state, interest, message }) {
  const now = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });

  const text = [
    'NEW EXPRESSION OF INTEREST — civics.au',
    '═'.repeat(50),
    '',
    `Name:     ${name}`,
    `Email:    ${email}`,
    `Phone:    ${phone || '—'}`,
    `State:    ${state || '—'}`,
    `Interest: ${interest || '—'}`,
    '',
    'Message:',
    '─'.repeat(40),
    message || '(no message provided)',
    '─'.repeat(40),
    '',
    `Submitted: ${now} AEST`,
    '',
    'Reply directly to this email to respond to the enquirer.',
  ].join('\n');

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
<div class="row"><span class="lbl">Name</span><span class="val">${escHtml(name)}</span></div>
<div class="row"><span class="lbl">Email</span><span class="val"><a href="mailto:${escHtml(email)}">${escHtml(email)}</a></span></div>
<div class="row"><span class="lbl">Phone</span><span class="val">${escHtml(phone || '—')}</span></div>
<div class="row"><span class="lbl">State</span><span class="val">${escHtml(state || '—')}</span></div>
<div class="row"><span class="lbl">Interest</span><span class="val">${escHtml(interest || '—')}</span></div>
<h2 style="font-size:16px;margin:20px 0 8px">Message</h2>
<div class="msg">${escHtml(message || '(no message provided)')}</div>
<div class="ft">Submitted ${now} AEST via civics.au EOI form. Reply directly to respond to the enquirer.</div>
</body></html>`;

  return { text, html };
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
