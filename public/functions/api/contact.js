/*
 * eManisha form endpoint — contact + newsletter + notify.
 * GitHub Pages Function (public/functions/api/contact.js) -> /api/contact.
 *
 * Contract (unchanged from the former PHP endpoint):
 *   POST { kind: 'contact'|'newsletter'|'notify', name?, email, message?, source? }
 *   -> 200 { ok: true }  or  { ok: false, error }
 */
const OWNER_EMAIL = 'mrxubr@gmail.com';
const FORMSPREE_ENDPOINT = '';
const MAX = { kind: 20, email: 254, name: 120, message: 5000, source: 80 };

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });

/**
 * Trim, strip CR/LF (blocks mail header injection), and cap length.
 * The CR/LF and percent-encoded variants are replaced as whole sequences —
 * a character class would also strip the letters a and d, mangling emails.
 */
function str(value, max) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\r\n/g, '')
    .replace(/\r/g, '')
    .replace(/\n/g, '')
    .replace(/%0a/gi, '')
    .replace(/%0d/gi, '')
    .trim()
    .slice(0, max);
}

export async function onRequest({ request }) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'method not allowed' }, 405);
  }

  let input = {};
  const contentType = request.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      input = (await request.json()) || {};
    } else {
      const form = await request.formData();
      for (const [key, value] of form.entries()) input[key] = value;
    }
  } catch {
    return json({ ok: false, error: 'could not read the submission' }, 400);
  }

  const kind = str(input.kind, MAX.kind);
  const email = str(input.email, MAX.email);
  const name = str(input.name, MAX.name);
  const message = str(input.message, MAX.message);
  const source = str(input.source, MAX.source);

  // Honeypot: bots fill it, humans never see it. Pretend it worked.
  if (input.website) return json({ ok: true });

  if (!['contact', 'newsletter', 'notify'].includes(kind)) {
    return json({ ok: false, error: 'unknown form kind' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'please give a valid email address' }, 400);
  }
  if (kind === 'contact' && (message.length < 10 || !name)) {
    return json({ ok: false, error: 'please add your name and a few words' }, 400);
  }

  const labels = {
    contact: 'Contact message',
    newsletter: 'Newsletter signup',
    notify: 'Notify-me signup',
  };

  if (!FORMSPREE_ENDPOINT) {
    // Nothing is configured to deliver with. Say so rather than pretending.
    return json({ ok: false, error: 'delivery is not configured' }, 503);
  }

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        kind,
        name,
        email,
        message,
        source,
        subject: `[emanisha.in] ${labels[kind]}${source ? ' (' + source + ')' : ''}`,
        _reply_to: email || OWNER_EMAIL,
        _to: OWNER_EMAIL,
      }),
    });
    if (!res.ok) return json({ ok: false, error: 'delivery failed' }, 502);
  } catch {
    return json({ ok: false, error: 'delivery failed' }, 502);
  }

  return json({ ok: true });
}
