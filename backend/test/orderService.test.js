const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';

const {
  CheckoutError,
  calculateOrder,
  createCartDigest,
  normalizeItems,
} = require('../services/orderService');

const makeDatabase = ({ products, settings = [] }) => ({
  async query(sql) {
    if (sql.includes('FROM products')) return [products];
    if (sql.includes('FROM settings')) return [settings];
    throw new Error(`Unexpected query in test: ${sql}`);
  },
});

test('server prices override prices supplied by the browser', async () => {
  const db = makeDatabase({
    products: [{ id: 7, title: 'Secure Product', price: '499.00', stock_quantity: 5 }],
    settings: [
      { setting_key: 'convenience_fee', setting_value: '99' },
      { setting_key: 'free_shipping_threshold', setting_value: '1000' },
    ],
  });

  const order = await calculateOrder(db, [{ id: 7, quantity: 2, price: 1 }], null);
  assert.equal(order.subtotal, 998);
  assert.equal(order.shippingFee, 99);
  assert.equal(order.total, 1097);
  assert.equal(order.items[0].price, 499);
});

test('invalid and excessive quantities are rejected', () => {
  assert.throws(
    () => normalizeItems([{ id: 1, quantity: -1 }]),
    (error) => error instanceof CheckoutError && error.status === 400
  );
  assert.throws(
    () => normalizeItems([{ id: 1, quantity: 11 }]),
    (error) => error instanceof CheckoutError && error.status === 400
  );
});

test('orders cannot exceed current stock', async () => {
  const db = makeDatabase({
    products: [{ id: 3, title: 'Limited Product', price: '250.00', stock_quantity: 1 }],
  });

  await assert.rejects(
    calculateOrder(db, [{ id: 3, quantity: 2 }], null),
    (error) => error instanceof CheckoutError && error.status === 409
  );
});

test('cart binding changes when user, quantity, or amount changes', () => {
  const base = {
    userId: 5,
    items: [{ id: 9, quantity: 1, size: 'M' }],
    couponCode: null,
    totalPaise: 49900,
  };
  const original = createCartDigest(base);

  assert.notEqual(original, createCartDigest({ ...base, userId: 6 }));
  assert.notEqual(original, createCartDigest({ ...base, totalPaise: 100 }));
  assert.notEqual(
    original,
    createCartDigest({ ...base, items: [{ id: 9, quantity: 2, size: 'M' }] })
  );
});
