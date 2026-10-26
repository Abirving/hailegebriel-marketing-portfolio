import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildContactDraft,
  normalizeContact,
  validateContact,
} from '../src/lib/contact.mjs';
import { createContactHandler } from '../api/contact.js';

const valid = {
  name: 'A Brand Partner',
  email: 'partner@example.com',
  service: 'Content strategy',
  message: 'We would love to discuss an organic campaign for our brand.',
  website: '',
};
const env = {
  RESEND_API_KEY: 'test-only-key',
  CONTACT_FROM_EMAIL: 'Portfolio <hello@example.com>',
  CONTACT_ALLOWED_ORIGIN: 'https://portfolio.example.com',
  CONTACT_TO_EMAIL: 'owner@example.com',
};

function request(overrides = {}) {
  return {
    method: 'POST',
    headers: {
      origin: env.CONTACT_ALLOWED_ORIGIN,
      'content-type': 'application/json',
    },
    body: valid,
    socket: { remoteAddress: '127.0.0.1' },
    ...overrides,
  };
}
function response() {
  return {
    code: 0,
    data: null,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.code = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
}

test('email drafts preserve punctuation, Unicode, and newlines through URL encoding', () => {
  const values = {
    ...valid,
    name: 'Partner & Co',
    message: 'Let’s launch! & a new line\nሰላም + more?',
  };
  const draft = buildContactDraft(values);
  const parameters = new URL(draft.href).searchParams;
  assert.equal(parameters.get('subject'), draft.subject);
  assert.equal(parameters.get('body'), draft.body);
  assert.ok(draft.body.includes(values.message));
  assert.ok(draft.body.includes(values.email));
});

test('normalization and validation reject invalid inputs and header injection', () => {
  assert.equal(
    normalizeContact({ name: '  Partner  ', message: 123 }).name,
    'Partner',
  );
  assert.deepEqual(validateContact(valid), {});
  const invalid = {
    ...valid,
    name: 'Attacker\r\nBcc: someone@example.com',
    email: 'broken@address',
    message: 'too short',
    service: 'SEO\nInjection',
  };
  assert.deepEqual(Object.keys(validateContact(invalid)).sort(), [
    'email',
    'message',
    'name',
    'service',
  ]);
});

test('valid requests go to the fixed recipient, with reply-to and plain-text body', async () => {
  let outbound;
  const handler = createContactHandler({
    env,
    send: async (url, options) => {
      outbound = { url, options };
      return { ok: true, json: async () => ({ id: 'email-test-id' }) };
    },
  });
  const res = response();
  await handler(request(), res);
  assert.equal(res.code, 200);
  assert.deepEqual(res.data, { ok: true });
  assert.equal(outbound.url, 'https://api.resend.com/emails');
  const payload = JSON.parse(outbound.options.body);
  assert.deepEqual(payload.to, ['owner@example.com']);
  assert.equal(payload.reply_to, valid.email);
  assert.ok(payload.text.includes(valid.message));
  assert.equal(payload.html, undefined);
  assert.ok(outbound.options.signal instanceof AbortSignal);
  assert.equal(res.headers['Cache-Control'], 'no-store');
});

test('provider failure never produces a false success or exposes internal data', async () => {
  const handler = createContactHandler({
    env,
    send: async () => ({
      ok: false,
      json: async () => ({ error: 'private-provider-details' }),
    }),
  });
  const res = response();
  await handler(request(), res);
  assert.equal(res.code, 502);
  assert.equal(res.data.ok, false);
  assert.ok(!JSON.stringify(res.data).includes('private-provider-details'));
});

test('an unconfirmed provider response never counts as delivery', async () => {
  const handler = createContactHandler({
    env,
    send: async () => ({ ok: true, json: async () => ({}) }),
  });
  const res = response();
  await handler(request(), res);
  assert.equal(res.code, 502);
});

test('invalid methods, origins, JSON, spam, and oversized bodies never call the provider', async () => {
  const handler = createContactHandler({
    env,
    send: async () => {
      assert.fail('Provider should not be called');
    },
  });
  const cases = [
    [request({ method: 'GET' }), 405],
    [
      request({
        headers: {
          origin: 'https://other.example.com',
          'content-type': 'application/json',
        },
      }),
      403,
    ],
    [
      request({
        headers: {
          origin: env.CONTACT_ALLOWED_ORIGIN,
          'content-type': 'text/plain',
        },
      }),
      415,
    ],
    [request({ body: '{' }), 400],
    [request({ body: [] }), 400],
    [request({ body: { ...valid, website: 'spam' } }), 400],
    [request({ body: { ...valid, email: 'bad' } }), 400],
    [request({ body: { ...valid, message: 'x'.repeat(20_001) } }), 413],
    [
      request({
        headers: {
          origin: env.CONTACT_ALLOWED_ORIGIN,
          'content-type': 'application/json',
          'content-length': '25000',
        },
      }),
      413,
    ],
  ];
  for (const [req, expected] of cases) {
    const res = response();
    await handler(req, res);
    assert.equal(res.code, expected);
    assert.equal(res.data.ok, false);
  }
});

test('missing server configuration is explicit and never pretends a message was sent', async () => {
  const handler = createContactHandler({
    env: {},
    send: async () => {
      assert.fail('Provider should not be called');
    },
  });
  const res = response();
  await handler(request(), res);
  assert.equal(res.code, 503);
  assert.equal(res.data.ok, false);
});

test('rate limiting stops a sixth attempt and expires after the window', async () => {
  let time = 1_000_000;
  let sends = 0;
  const handler = createContactHandler({
    env,
    now: () => time,
    send: async () => {
      sends += 1;
      return { ok: true, json: async () => ({ id: 'email-test-id' }) };
    },
  });
  for (let i = 0; i < 5; i += 1) {
    const res = response();
    await handler(request(), res);
    assert.equal(res.code, 200);
  }
  const limited = response();
  await handler(request(), limited);
  assert.equal(limited.code, 429);
  assert.equal(limited.headers['Retry-After'], '600');
  assert.equal(sends, 5);
  time += 600_001;
  const expired = response();
  await handler(request(), expired);
  assert.equal(expired.code, 200);
});
