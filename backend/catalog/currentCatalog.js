const snapshot = require('./cosmeticsCatalogSnapshot.json');
const featured = require('./featuredCatalogAdditions');

module.exports = {
  categories: snapshot.categories,
  products: [...snapshot.products, ...featured.products],
  version: featured.version,
};
