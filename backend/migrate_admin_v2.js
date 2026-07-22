require('dotenv').config();
const db = require('./config/db');

async function migrateAdminV2() {
  console.log('Starting Admin V2 Database Migration...');
  const connection = await db.getConnection();

  try {
    // 1. Add carrier and tracking_number columns to orders table
    try {
      await connection.query(`ALTER TABLE orders ADD COLUMN carrier VARCHAR(100) DEFAULT NULL`);
      console.log('Added "carrier" column to orders table.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('"carrier" column already exists in orders.');
      else throw e;
    }

    try {
      await connection.query(`ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100) DEFAULT NULL`);
      console.log('Added "tracking_number" column to orders table.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('"tracking_number" column already exists in orders.');
      else throw e;
    }

    // 2. Add stock_quantity, sku, and available_sizes to products table
    try {
      await connection.query(`ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 50`);
      console.log('Added "stock_quantity" column to products table.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('"stock_quantity" column already exists in products.');
      else throw e;
    }

    try {
      await connection.query(`ALTER TABLE products ADD COLUMN sku VARCHAR(100) DEFAULT NULL`);
      console.log('Added "sku" column to products table.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('"sku" column already exists in products.');
      else throw e;
    }

    try {
      await connection.query(`ALTER TABLE products ADD COLUMN available_sizes VARCHAR(255) DEFAULT 'S,M,L,XL'`);
      console.log('Added "available_sizes" column to products table.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('"available_sizes" column already exists in products.');
      else throw e;
    }

    // Update existing products with generated SKU if NULL
    await connection.query(`UPDATE products SET sku = CONCAT('SKU-', id, '-', FLOOR(RAND() * 8999 + 1000)) WHERE sku IS NULL`);
    console.log('Populated default SKUs for existing products.');

    // 3. Create admin_audit_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admin_id INT,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created admin_audit_logs table.');

    console.log('Admin V2 Migration successfully completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrateAdminV2();
