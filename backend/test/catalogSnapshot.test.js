const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeDbHost } = require('../config/dbHost');
const snapshot = require('../catalog/cosmeticsCatalogSnapshot.json');

test('Hostinger local database host uses IPv4', () => {
  assert.equal(normalizeDbHost('localhost'), '127.0.0.1');
  assert.equal(normalizeDbHost('::1'), '127.0.0.1');
  assert.equal(normalizeDbHost('db.example.internal'), 'db.example.internal');
});

test('production catalog snapshot contains the verified 20 by 6 catalog', () => {
  assert.equal(snapshot.categories.length, 20);
  assert.equal(snapshot.products.length, 120);

  const categoryNames = new Set(snapshot.categories.map((category) => category.name));
  for (const category of snapshot.categories) {
    assert.equal(
      snapshot.products.filter((product) => product.category === category.name).length,
      6,
      `${category.name} must contain six products`,
    );
  }

  for (const product of snapshot.products) {
    assert.ok(categoryNames.has(product.category), `${product.sku} has an unknown category`);
    assert.ok(product.price >= 199 && product.price <= 499, `${product.sku} has an invalid price`);
    assert.ok(product.originalPrice > product.price, `${product.sku} has an invalid MRP`);
    assert.ok(product.discount >= 10 && product.discount <= 90, `${product.sku} has an invalid discount`);
    assert.ok(product.images.length >= 3 && product.images.length <= 4, `${product.sku} has invalid images`);
    assert.ok(product.reviews.length >= 4 && product.reviews.length <= 5, `${product.sku} has invalid reviews`);
  }
});
