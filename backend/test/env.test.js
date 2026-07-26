const test = require('node:test');
const assert = require('node:assert/strict');
const { validateEnvironment } = require('../config/env');

test('server refuses to start without required secrets', () => {
  const original = {
    JWT_SECRET: process.env.JWT_SECRET,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  };

  delete process.env.JWT_SECRET;
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  assert.throws(validateEnvironment, /Missing required environment variables/);

  for (const [key, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});
