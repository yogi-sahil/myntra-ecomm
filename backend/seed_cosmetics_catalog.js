require('dotenv').config();
const db = require('./config/db');
const imageManifest = require('./catalog/cosmeticsImages.json');
const { categories, products: baseProducts, buildReviews } = require('./catalog/cosmeticsCatalog');
const { loadExpansionProducts } = require('./catalog/catalogExpansion');

const productImages = (product) => product.images || imageManifest[product.sku];

const validateCatalog = (products) => {
  const categoryNames = new Set(categories.map((category) => category.name));
  if (categories.length !== 20) throw new Error('Catalog must contain exactly 20 focused categories');
  if (products.length !== 120) throw new Error('Catalog must contain exactly 120 products');

  for (const product of products) {
    const images = productImages(product);
    if (!categoryNames.has(product.category)) throw new Error(`${product.sku}: invalid category`);
    if (product.price < 199 || product.price > 499) throw new Error(`${product.sku}: price must be between ₹199 and ₹499`);
    if (product.originalPrice <= product.price) throw new Error(`${product.sku}: MRP must be higher than selling price`);
    if (product.discount < 10 || product.discount > 90) throw new Error(`${product.sku}: invalid discount`);
    if (!Array.isArray(images) || images.length < 3 || images.length > 4) throw new Error(`${product.sku}: requires 3-4 verified images`);
    if (!Array.isArray(product.reviews) || product.reviews.length < 4 || product.reviews.length > 5) throw new Error(`${product.sku}: requires 4-5 reviews`);
  }

  for (const category of categories) {
    const count = products.filter((product) => product.category === category.name).length;
    if (count !== 6) throw new Error(`${category.name}: expected 6 products, found ${count}`);
  }
};

async function ensureColumns(connection) {
  const additions = [
    ['review_data', 'ALTER TABLE products ADD COLUMN review_data JSON NULL AFTER reviews'],
  ];
  for (const [column, statement] of additions) {
    const [rows] = await connection.query(
      'SELECT COUNT(*) AS count FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      ['products', column],
    );
    if (!Number(rows[0].count)) await connection.query(statement);
  }
}

async function ensureIndexes(connection) {
  const [indexes] = await connection.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'products'
       AND COLUMN_NAME = 'sku'
       AND NON_UNIQUE = 0`,
  );
  if (!Number(indexes[0].count)) {
    const [[skuState]] = await connection.query(
      `SELECT COUNT(*) AS total, COUNT(DISTINCT sku) AS distinctSkus,
              SUM(sku IS NULL OR TRIM(sku) = '') AS emptySkus
       FROM products`,
    );
    if (Number(skuState.total) !== Number(skuState.distinctSkus) || Number(skuState.emptySkus) > 0) {
      throw new Error('Cannot create the product SKU index until duplicate or empty SKUs are resolved');
    }
    await connection.query('ALTER TABLE products ADD UNIQUE KEY unique_products_sku (sku)');
  }
}

async function seedCosmeticsCatalog() {
  console.log('Auditing current, relevance-ranked cosmetic products and exact images...');
  const expansionProducts = await loadExpansionProducts({
    existingProducts: baseProducts,
    buildReviews,
    onProgress: (message) => console.log(`✓ ${message}`),
  });
  const products = [...baseProducts, ...expansionProducts];
  validateCatalog(products);

  const connection = await db.getConnection();
  try {
    await ensureColumns(connection);
    await ensureIndexes(connection);
    await connection.beginTransaction();

    const expansionSkus = expansionProducts.map((product) => product.sku);
    const skuPlaceholders = expansionSkus.map(() => '?').join(',');
    const [orderedStaleProducts] = await connection.query(
      `SELECT DISTINCT p.sku
       FROM products p
       JOIN order_items oi ON oi.product_id = p.id
       WHERE p.sku LIKE 'BB-%'
         AND p.sku NOT IN (${skuPlaceholders})`,
      expansionSkus,
    );
    if (orderedStaleProducts.length) {
      throw new Error(`Catalog refresh stopped because ${orderedStaleProducts.length} retired products are referenced by order history`);
    }
    await connection.query(
      `DELETE FROM products
       WHERE sku LIKE 'BB-%'
         AND sku NOT IN (${skuPlaceholders})`,
      expansionSkus,
    );

    for (const category of categories) {
      const firstProduct = products.find((product) => product.category === category.name);
      await connection.query(
        `INSERT INTO categories (name, slug, status, image_url)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           status = VALUES(status),
           image_url = VALUES(image_url)`,
        [category.name, category.slug, 'Active', productImages(firstProduct)[0]],
      );
    }

    for (const product of products) {
      const images = productImages(product);
      await connection.query(
        `INSERT INTO products
          (brand, title, price, original_price, discount, rating, reviews, review_data, image_url, images, description, category, seller, stock_quantity, sku, available_sizes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           brand = VALUES(brand),
           title = VALUES(title),
           price = VALUES(price),
           original_price = VALUES(original_price),
           discount = VALUES(discount),
           rating = VALUES(rating),
           reviews = VALUES(reviews),
           review_data = VALUES(review_data),
           image_url = VALUES(image_url),
           images = VALUES(images),
           description = VALUES(description),
           category = VALUES(category),
           seller = VALUES(seller),
           stock_quantity = VALUES(stock_quantity),
           available_sizes = VALUES(available_sizes)`,
        [
          product.brand,
          product.title,
          product.price,
          product.originalPrice,
          product.discount,
          product.rating,
          product.ratingsCount,
          JSON.stringify(product.reviews),
          images[0],
          JSON.stringify(images),
          product.description,
          product.category,
          `${product.brand} Authorized Seller`,
          75,
          product.sku,
          'One Size',
        ],
      );
    }

    const categoryNames = categories.map((category) => category.name);
    const placeholders = categoryNames.map(() => '?').join(',');
    const [[catalogState]] = await connection.query(
      `SELECT COUNT(*) AS productCount, COUNT(DISTINCT category) AS categoryCount
       FROM products
       WHERE category IN (${placeholders})`,
      categoryNames,
    );
    if (Number(catalogState.productCount) !== 120 || Number(catalogState.categoryCount) !== 20) {
      throw new Error(`Database catalog validation failed: ${catalogState.categoryCount} categories, ${catalogState.productCount} products`);
    }

    await connection.commit();
    console.log(`Cosmetics catalog ready: ${categories.length} categories, ${products.length} products.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await db.end();
  }
}

seedCosmeticsCatalog().catch((error) => {
  console.error(`Catalog seed failed: ${error.message}`);
  process.exitCode = 1;
});
