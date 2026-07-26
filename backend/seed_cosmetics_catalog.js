require('dotenv').config();
const db = require('./config/db');
const catalogSnapshot = require('./catalog/cosmeticsCatalogSnapshot.json');

const { categories, products, version: catalogVersion } = catalogSnapshot;
const productImages = (product) => product.images;

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
  const additions = {
    products: [
      ['review_data', 'ALTER TABLE products ADD COLUMN review_data JSON NULL AFTER reviews'],
      ['images', 'ALTER TABLE products ADD COLUMN images JSON NULL AFTER image_url'],
      ['stock_quantity', 'ALTER TABLE products ADD COLUMN stock_quantity INT NOT NULL DEFAULT 50'],
      ['sku', 'ALTER TABLE products ADD COLUMN sku VARCHAR(100) NULL'],
      ['available_sizes', "ALTER TABLE products ADD COLUMN available_sizes VARCHAR(255) NOT NULL DEFAULT 'One Size'"],
    ],
    categories: [
      ['image_url', 'ALTER TABLE categories ADD COLUMN image_url VARCHAR(500) NULL'],
    ],
  };

  for (const [table, columns] of Object.entries(additions)) {
    for (const [column, statement] of columns) {
      const [rows] = await connection.query(
        'SELECT COUNT(*) AS count FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [table, column],
      );
      if (!Number(rows[0].count)) await connection.query(statement);
    }
  }
}

async function normalizeLegacySkus(connection) {
  await connection.query(
    "UPDATE products SET sku = CONCAT('LEGACY-', id) WHERE sku IS NULL OR TRIM(sku) = ''",
  );
  await connection.query(
    `UPDATE products p
     JOIN (
       SELECT sku, MIN(id) AS retained_id
       FROM products
       GROUP BY sku
       HAVING COUNT(*) > 1
     ) duplicates ON duplicates.sku = p.sku AND p.id <> duplicates.retained_id
     SET p.sku = CONCAT(LEFT(p.sku, 75), '-LEGACY-', p.id)`,
  );
}

async function tableExists(connection, table) {
  const [[row]] = await connection.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table],
  );
  return Number(row.count) > 0;
}

async function removeLegacyCatalog(connection, targetSkus) {
  const skuPlaceholders = targetSkus.map(() => '?').join(',');
  const [legacyProducts] = await connection.query(
    `SELECT p.id,
            EXISTS(SELECT 1 FROM order_items oi WHERE oi.product_id = p.id) AS has_order
     FROM products p
     WHERE p.sku NOT IN (${skuPlaceholders})`,
    targetSkus,
  );

  if (!legacyProducts.length) return { deleted: 0, archived: 0 };

  const legacyIds = legacyProducts.map((product) => Number(product.id));
  for (const table of ['cart_items', 'wishlist_items']) {
    if (await tableExists(connection, table)) {
      await connection.query(`DELETE FROM ${table} WHERE product_id IN (?)`, [legacyIds]);
    }
  }

  const archivedIds = legacyProducts
    .filter((product) => Number(product.has_order) > 0)
    .map((product) => Number(product.id));
  const deletableIds = legacyProducts
    .filter((product) => Number(product.has_order) === 0)
    .map((product) => Number(product.id));

  if (archivedIds.length) {
    await connection.query(
      "UPDATE products SET category = 'Archived', stock_quantity = 0 WHERE id IN (?)",
      [archivedIds],
    );
  }
  if (deletableIds.length) {
    await connection.query('DELETE FROM products WHERE id IN (?)', [deletableIds]);
  }

  return { deleted: deletableIds.length, archived: archivedIds.length };
}

async function ensureCatalogStateTable(connection) {
  await connection.query(
    `CREATE TABLE IF NOT EXISTS deployment_catalog_state (
       catalog_version VARCHAR(100) PRIMARY KEY,
       applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
     )`,
  );
}

async function isCatalogVersionApplied() {
  const connection = await db.getConnection();
  try {
    await ensureCatalogStateTable(connection);
    const [rows] = await connection.query(
      'SELECT catalog_version FROM deployment_catalog_state WHERE catalog_version = ? LIMIT 1',
      [catalogVersion],
    );
    return rows.length > 0;
  } finally {
    connection.release();
  }
}

async function ensureIndexes(connection) {
  await normalizeLegacySkus(connection);
  const [indexes] = await connection.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'products'
       AND COLUMN_NAME = 'sku'
       AND NON_UNIQUE = 0`,
  );
  if (!Number(indexes[0].count)) {
    await connection.query('ALTER TABLE products ADD UNIQUE KEY unique_products_sku (sku)');
  }
}

async function seedCosmeticsCatalog({ closePool = true } = {}) {
  console.log(`Syncing deterministic cosmetics catalog ${catalogVersion}...`);
  validateCatalog(products);

  const connection = await db.getConnection();
  try {
    await ensureColumns(connection);
    await ensureIndexes(connection);
    await ensureCatalogStateTable(connection);
    await connection.beginTransaction();

    const cleanup = await removeLegacyCatalog(
      connection,
      products.map((product) => product.sku),
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
          product.seller || `${product.brand} Authorized Seller`,
          product.stockQuantity || 75,
          product.sku,
          product.availableSizes || 'One Size',
        ],
      );
    }

    const categorySlugs = categories.map((category) => category.slug);
    await connection.query(
      `DELETE FROM categories
       WHERE slug NOT IN (${categorySlugs.map(() => '?').join(',')})`,
      categorySlugs,
    );

    const categoryNames = categories.map((category) => category.name);
    const placeholders = categoryNames.map(() => '?').join(',');
    const [[catalogState]] = await connection.query(
      `SELECT COUNT(*) AS productCount, COUNT(DISTINCT category) AS categoryCount,
              MIN(price) AS minPrice, MAX(price) AS maxPrice
       FROM products
       WHERE category IN (${placeholders})`,
      categoryNames,
    );
    const [[categoryState]] = await connection.query(
      `SELECT COUNT(*) AS categoryCount
       FROM categories
       WHERE slug IN (${categorySlugs.map(() => '?').join(',')})`,
      categorySlugs,
    );
    if (
      Number(catalogState.productCount) !== 120
      || Number(catalogState.categoryCount) !== 20
      || Number(categoryState.categoryCount) !== 20
      || Number(catalogState.minPrice) < 199
      || Number(catalogState.maxPrice) > 499
    ) {
      throw new Error(
        `Database catalog validation failed: ${categoryState.categoryCount} categories, ${catalogState.productCount} products`,
      );
    }

    await connection.query(
      `INSERT INTO deployment_catalog_state (catalog_version)
       VALUES (?)
       ON DUPLICATE KEY UPDATE applied_at = CURRENT_TIMESTAMP`,
      [catalogVersion],
    );
    await connection.commit();
    console.log(
      `Cosmetics catalog ready: ${categories.length} categories, ${products.length} products; `
      + `${cleanup.deleted} legacy products deleted, ${cleanup.archived} preserved for order history.`,
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    if (closePool) await db.end();
  }
}

async function ensureProductionCatalog() {
  if (process.env.NODE_ENV !== 'production') return;
  if (await isCatalogVersionApplied()) {
    console.log(`Cosmetics catalog ${catalogVersion} is already applied.`);
    return;
  }
  await seedCosmeticsCatalog({ closePool: false });
}

if (require.main === module) {
  seedCosmeticsCatalog().catch((error) => {
    console.error(`Catalog seed failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  catalogVersion,
  ensureProductionCatalog,
  seedCosmeticsCatalog,
  validateCatalog,
};
