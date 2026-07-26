require('dotenv').config();
const db = require('./config/db');

const migrateSecureCheckout = async () => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        provider VARCHAR(30) NOT NULL,
        provider_payment_id VARCHAR(100) NOT NULL UNIQUE,
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    console.log('Secure checkout migration completed.');
  } catch (error) {
    console.error('Secure checkout migration failed:', error);
    process.exitCode = 1;
  } finally {
    connection?.release();
    await db.end();
  }
};

migrateSecureCheckout();
