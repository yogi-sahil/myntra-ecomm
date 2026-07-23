require('dotenv').config();
const db = require('./config/db');

async function migrate() {
  console.log('Starting categories and settings migration...');
  
  const connection = await db.getConnection();
  try {
    // 1. Categories Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created categories table.');
    
    // Insert default categories
    await connection.query(`
      INSERT IGNORE INTO categories (name, slug, status) VALUES 
      ('Men Topwear', 'men-topwear', 'Active'),
      ('Men Bottomwear', 'men-bottomwear', 'Active'),
      ('Women Ethnic', 'women-ethnic', 'Active'),
      ('Women Western', 'women-western', 'Active'),
      ('Kids', 'kids', 'Active')
    `);
    console.log('Inserted default categories.');

    // 2. Settings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Created settings table.');

    // Insert default settings
    await connection.query(`
      INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
      ('store_name', 'Myntra'),
      ('contact_email', 'support@myntra.com'),
      ('support_phone', '+91 98765 43210'),
      ('currency', 'INR'),
      ('razorpay_key_id', 'rzp_test_QvFiXZe6iRfjAH'),
      ('razorpay_key_secret', 'uPdWXYO71FQeOgpfNApnPh6T'),
      ('convenience_fee', '99'),
      ('free_shipping_threshold', '1000')
    `);
    console.log('Inserted default settings.');
    
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrate();
