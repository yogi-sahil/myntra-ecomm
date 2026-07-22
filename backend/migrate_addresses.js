require('dotenv').config();
const db = require('./config/db');

async function migrateAddresses() {
  console.log('Starting user_addresses migration...');
  
  const connection = await db.getConnection();
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS user_addresses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(100),
        mobile VARCHAR(20),
        pincode VARCHAR(20),
        address_line TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    await connection.query(createTableQuery);
    console.log('Created user_addresses table.');
    
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrateAddresses();
