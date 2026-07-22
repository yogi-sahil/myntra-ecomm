require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'myntra_clone'
    });

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin exists
    const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', ['admin@myntra.local']);
    
    if (rows.length > 0) {
      // Update existing
      await conn.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@myntra.local']);
      console.log('Admin password updated to "admin123"');
    } else {
      // Insert new
      await conn.query('INSERT INTO users (name, mobile, email, password, role) VALUES (?, ?, ?, ?, ?)', 
        ['Admin Sahil', '9999999999', 'admin@myntra.local', hashedPassword, 'admin']);
      console.log('Admin created with password "admin123"');
    }
    
    await conn.end();
  } catch(e) {
    console.error('Failed to seed admin:', e);
  }
}

seed();
