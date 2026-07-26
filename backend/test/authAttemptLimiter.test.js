const test = require('node:test');
const assert = require('node:assert/strict');
const { shouldLimitAuthAttempt } = require('../middleware/authAttemptLimiter');

test('rate limiting applies only to credential submission endpoints', () => {
  assert.equal(shouldLimitAuthAttempt('POST', '/register'), true);
  assert.equal(shouldLimitAuthAttempt('POST', '/login'), true);
  assert.equal(shouldLimitAuthAttempt('POST', '/admin-login'), true);
  assert.equal(shouldLimitAuthAttempt('GET', '/me'), false);
  assert.equal(shouldLimitAuthAttempt('POST', '/logout'), false);
});
