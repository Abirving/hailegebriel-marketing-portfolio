import { createHash } from 'node:crypto';
import {
  contactEmail,
  normalizeContact,
  validateContact,
} from '../src/lib/contact.mjs';

const MAX_BODY_BYTES = 20_000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;

/** Vercel Node function. Never expose these environment variables to Vite. */
export function createContactHandler({
  env = process.env,
  send = globalThis.fetch,
  now = Date.now,
} = {}) {
  // Best-effort per-instance abuse control. For high-volume public deployments,
  // also enable the host's WAF rate-limiting rule for POST /api/contact.
  const attempts = new Map();

  return async function contactHandler(req, res) {
    const respond = (status, body) => res.status(status).json(body);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return respond(405, {
        ok: false,
        error: 'Use POST to submit a message.',
      });
    }
    if (
      !env.RESEND_API_KEY ||
      !env.CONTACT_FROM_EMAIL ||
      !env.CONTACT_ALLOWED_ORIGIN
    ) {
      return respond(503, {
        ok: false,
        error: 'Direct delivery is not configured. Please use the email link.',
      });
    }

    let allowedOrigin;
    try {
      allowedOrigin = new URL(env.CONTACT_ALLOWED_ORIGIN).origin;
    } catch {
      return respond(503, {
        ok: false,
        error: 'Direct delivery is not configured. Please use the email link.',
      });
    }
    if (req.headers.origin !== allowedOrigin) {
      return respond(403, {
        ok: false,
        error: 'This submission origin is not allowed.',
      });
    }
    if (
      !String(req.headers['content-type'] || '')
        .toLowerCase()
        .startsWith('application/json')
    ) {
      return respond(415, { ok: false, error: 'Use a JSON request.' });
    }
    if (Number(req.headers['content-length'] || 0) > MAX_BODY_BYTES) {
      return respond(413, { ok: false, error: 'The message is too large.' });
    }

    let body;
    try {
      const raw = Buffer.isBuffer(req.body)
        ? req.body.toString('utf8')
        : typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body ?? {});
      if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES)
        return respond(413, { ok: false, error: 'The message is too large.' });
      body = JSON.parse(raw);
      if (!body || typeof body !== 'object' || Array.isArray(body))
        throw new Error('Invalid body');
    } catch {
      return respond(400, {
        ok: false,
        error: 'Please check the submitted fields.',
      });
    }

    const values = normalizeContact(body);
    if (values.website || Object.keys(validateContact(values)).length) {
      return respond(400, {
        ok: false,
        error: 'Please check the submitted fields.',
      });
    }

    // Only trust Vercel's canonical forwarding header when running on Vercel.
    const ip = env.VERCEL
      ? String(req.headers['x-vercel-forwarded-for'] || 'unknown')
          .split(',')[0]
          .trim()
      : req.socket?.remoteAddress || 'local';
    const key = createHash('sha256').update(ip).digest('hex');
    const time = now();
    for (const [entryKey, entry] of attempts)
      if (time - entry.started >= RATE_WINDOW_MS) attempts.delete(entryKey);
    const bucket = attempts.get(key) || { started: time, count: 0 };
    if (bucket.count >= RATE_LIMIT) {
      res.setHeader(
        'Retry-After',
        String(Math.ceil((RATE_WINDOW_MS - (time - bucket.started)) / 1000)),
      );
      return respond(429, {
        ok: false,
        error: 'Please wait before sending another message.',
      });
    }
    if (!attempts.has(key) && attempts.size >= 5000)
      return respond(503, {
        ok: false,
        error: 'Please try again later or use the email link.',
      });
    attempts.set(key, { ...bucket, count: bucket.count + 1 });

    try {
      const response = await send('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL,
          to: [env.CONTACT_TO_EMAIL || contactEmail],
          reply_to: values.email,
          subject: `Portfolio inquiry: ${values.service || 'Let’s collaborate'}`,
          // Plain text prevents user-supplied HTML from being rendered.
          text: `New portfolio inquiry\n\nName: ${values.name}\nEmail: ${values.email}\nProject type: ${values.service || 'Not specified'}\n\n${values.message}`,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || typeof result.id !== 'string' || !result.id)
        throw new Error('Provider did not accept the message');
      return respond(200, { ok: true });
    } catch {
      // Never return provider bodies, credentials, or request content.
      return respond(502, {
        ok: false,
        error: 'Delivery could not be confirmed. Please use the email link.',
      });
    }
  };
}

export default createContactHandler();
