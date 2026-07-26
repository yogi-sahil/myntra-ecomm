const test = require('node:test');
const assert = require('node:assert/strict');
const {
  expansionPlan,
  priceOffers,
  parseProductCards,
  extractImages,
} = require('../catalog/catalogExpansion');

test('catalog expansion adds 84 products across all 20 categories', () => {
  assert.equal(expansionPlan.length, 20);
  assert.equal(new Set(expansionPlan.map((item) => item.category)).size, 20);
  assert.equal(expansionPlan.reduce((sum, item) => sum + item.count, 0), 84);
});

test('promotional prices stay within ₹199-₹499 and discounts never exceed 90%', () => {
  for (const offer of priceOffers) {
    assert.ok(offer.price >= 199 && offer.price <= 499);
    assert.ok(offer.originalPrice > offer.price);
    assert.ok(offer.discount >= 1 && offer.discount <= 90);
    assert.equal(Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100), offer.discount);
  }
  assert.equal(Math.max(...priceOffers.map((offer) => offer.discount)), 90);
});

test('BigBasket card parser keeps exact product IDs, brands and titles', () => {
  const html = `
    <a href="/pd/40204144/dabur-gulabari/?nc=search">
      <span class="BrandName___StyledLabel">Dabur</span>
      <div><h3 class="line-clamp-2">Gulabari Premium Rose Water</h3></div>
    </a>
    <div><span class="leading-xxs"><span>4.3</span></span>
      <span class="ReviewsAndRatings___StyledLabel">7,908 Ratings</span>
    </div></li>
  `;
  assert.deepEqual(parseProductCards(html), [{
    id: '40204144',
    path: '/pd/40204144/dabur-gulabari/',
    brand: 'Dabur',
    title: 'Gulabari Premium Rose Water',
    rating: 4.3,
    ratingsCount: 7908,
  }]);
});

test('image parser normalizes and deduplicates exact product views', () => {
  const html = `
    "https://www.bbassets.com/media/uploads/p/xl/123_1-product.jpg"
    "https://www.bbassets.com/media/uploads/p/xxl/123_1-product.jpg"
    "https://www.bbassets.com/media/uploads/p/l/123-2_1-product.jpg"
    "https://www.bbassets.com/media/uploads/p/xxl/123-3_1-product.jpg"
  `;
  assert.deepEqual(extractImages(html), [
    'https://www.bbassets.com/media/uploads/p/xxl/123_1-product.jpg',
    'https://www.bbassets.com/media/uploads/p/xxl/123-2_1-product.jpg',
    'https://www.bbassets.com/media/uploads/p/xxl/123-3_1-product.jpg',
  ]);
});
