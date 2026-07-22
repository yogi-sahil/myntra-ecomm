require('dotenv').config();
const db = require('./config/db');

async function migrateSize() {
  console.log('Starting size migration for cart_items...');
  
  const connection = await db.getConnection();
  try {
    // Add size column to cart_items if it doesn't exist
    // We can't easily do IF NOT EXISTS for columns in MySQL, so we wrap it in a try-catch to ignore error if it exists
    try {
      await connection.query(`ALTER TABLE cart_items ADD COLUMN size VARCHAR(10) DEFAULT 'M'`);
      console.log('Added size column to cart_items.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('size column already exists in cart_items.');
      } else {
        throw e;
      }
    }
    
    // In wishlist, size doesn't matter until they move to cart, but we can leave it out of wishlist for now.

    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrateSize();
