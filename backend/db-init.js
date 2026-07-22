require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDB() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('Connected to MySQL server');
    
    // Create database if not exists
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'myntra_clone'}\`;`);
    console.log(`Database ${process.env.DB_NAME || 'myntra_clone'} ensured.`);
    
    // Connect to the database
    await conn.changeUser({ database: process.env.DB_NAME || 'myntra_clone' });
    
    // Read init.sql
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL
    await conn.query(sql);
    console.log('Database initialized successfully from init.sql');
    
    // Insert some mock data just in case
    const [rows] = await conn.query('SELECT * FROM products');
    if (rows.length === 0) {
        await conn.query(`INSERT INTO products (brand, title, price, original_price, discount, image_url, description, category, rating, reviews) VALUES 
        ('Puma', 'Men Solid T-shirt', 799, 1599, 50, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '100% Cotton solid t-shirt', 'Men Topwear', 4.2, 120)`);
        console.log('Mock product inserted');
    }

    await conn.end();
  } catch(e) {
    console.error('Failed to initialize database:', e);
  }
}

initDB();
