const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isDevelopmentLoopbackOrigin,
  isOriginAllowed,
  parseAllowedOrigins,
} = require('../config/cors');

test('development CORS accepts safe loopback origins on any local port', () => {
  const allowedOrigins = parseAllowedOrigins('');

  assert.equal(isOriginAllowed('http://localhost:5175', {
    nodeEnv: 'development',
    allowedOrigins,
  }), true);
  assert.equal(isOriginAllowed('http://127.0.0.1:4173', {
    nodeEnv: 'development',
    allowedOrigins,
  }), true);
  assert.equal(isOriginAllowed('http://[::1]:5173', {
    nodeEnv: 'development',
    allowedOrigins,
  }), true);
});

test('development CORS rejects lookalike and remote origins', () => {
  assert.equal(isDevelopmentLoopbackOrigin('http://localhost.evil.test:5175'), false);
  assert.equal(isDevelopmentLoopbackOrigin('https://example.com'), false);
});

test('production CORS accepts only exact configured origins', () => {
  const allowedOrigins = parseAllowedOrigins('https://shop.example.com');

  assert.equal(isOriginAllowed('https://shop.example.com', {
    nodeEnv: 'production',
    allowedOrigins,
  }), true);
  assert.equal(isOriginAllowed('http://localhost:5175', {
    nodeEnv: 'production',
    allowedOrigins,
  }), false);
});
