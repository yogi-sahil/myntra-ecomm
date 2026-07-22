require('dotenv').config();
const db = require('./config/db');

async function fixCartUniqueKey() {
  console.log('Fixing unique key on cart_items...');
  
  const connection = await db.getConnection();
  try {
    // Drop old unique index
    try {
      await connection.query('ALTER TABLE cart_items DROP INDEX unique_user_product');
      console.log('Dropped old unique_user_product index.');
    } catch (e) {
      console.log('Old index might not exist or already dropped.', e.message);
    }

    // Add new unique index
    try {
      await connection.query('ALTER TABLE cart_items ADD UNIQUE INDEX unique_user_product_size (user_id, product_id, size)');
      console.log('Added new unique_user_product_size index.');
    } catch (e) {
      console.log('Failed to add new index.', e.message);
    }
    
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

fixCartUniqueKey();
