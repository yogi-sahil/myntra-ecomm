const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';

const { protect, adminOnly } = require('../middleware/authMiddleware');

const makeResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const sign = (role = 'customer') => jwt.sign(
  { id: 42, role },
  process.env.JWT_SECRET,
  { algorithm: 'HS256', issuer: 'myntra-api', audience: 'myntra-web' }
);

test('protect accepts a valid HttpOnly session cookie', () => {
  const req = { headers: { cookie: `myntra_session=${encodeURIComponent(sign())}` } };
  const res = makeResponse();
  let called = false;

  protect(req, res, () => { called = true; });

  assert.equal(called, true);
  assert.equal(req.user.id, 42);
});

test('protect rejects forged or missing sessions', () => {
  const missingResponse = makeResponse();
  protect({ headers: {} }, missingResponse, () => assert.fail('next should not run'));
  assert.equal(missingResponse.statusCode, 401);

  const forgedResponse = makeResponse();
  protect(
    { headers: { cookie: 'myntra_session=forged-token' } },
    forgedResponse,
    () => assert.fail('next should not run')
  );
  assert.equal(forgedResponse.statusCode, 401);
});

test('adminOnly enforces the admin role', () => {
  const denied = makeResponse();
  adminOnly({ user: { role: 'customer' } }, denied, () => assert.fail('next should not run'));
  assert.equal(denied.statusCode, 403);

  let called = false;
  adminOnly({ user: { role: 'admin' } }, makeResponse(), () => { called = true; });
  assert.equal(called, true);
});
