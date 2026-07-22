require('dotenv').config();
const db = require('./config/db');

async function migrateCoupons() {
  console.log('Starting coupons migration...');
  
  const connection = await db.getConnection();
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS coupons (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_type ENUM('Percentage', 'Fixed') NOT NULL DEFAULT 'Percentage',
        discount_value DECIMAL(10, 2) NOT NULL,
        min_order_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
        expiry_date DATE NOT NULL,
        status ENUM('Active', 'Inactive', 'Expired') NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await connection.query(createTableQuery);
    console.log('Created coupons table.');
    
    // Insert default 'MYNTRA10' coupon
    const insertDefaultCoupon = `
      INSERT IGNORE INTO coupons (code, discount_type, discount_value, min_order_value, expiry_date, status)
      VALUES ('MYNTRA10', 'Percentage', 10, 0, '2026-12-31', 'Active')
    `;
    await connection.query(insertDefaultCoupon);
    console.log('Inserted default MYNTRA10 coupon.');
    
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrateCoupons();
