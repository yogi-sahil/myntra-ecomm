const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CUSTOMER_ORDER_RETENTION_DAYS,
  CUSTOMER_ORDER_VISIBILITY_CLAUSE,
  isOrderVisibleToCustomer,
} = require('../services/customerOrderVisibility');

test('customer order visibility uses a fixed three-day database window', () => {
  assert.equal(CUSTOMER_ORDER_RETENTION_DAYS, 3);
  assert.match(
    CUSTOMER_ORDER_VISIBILITY_CLAUSE,
    /DATE_SUB\(CURRENT_TIMESTAMP, INTERVAL 3 DAY\)/,
  );
});

test('customer can see an order during the first three days', () => {
  const now = new Date('2026-08-05T12:00:00.000Z');
  assert.equal(isOrderVisibleToCustomer('2026-08-02T12:00:01.000Z', now), true);
  assert.equal(isOrderVisibleToCustomer('2026-08-02T12:00:00.000Z', now), true);
});

test('customer cannot see an order after three days', () => {
  const now = new Date('2026-08-05T12:00:00.001Z');
  assert.equal(isOrderVisibleToCustomer('2026-08-02T12:00:00.000Z', now), false);
  assert.equal(isOrderVisibleToCustomer('not-a-date', now), false);
});
