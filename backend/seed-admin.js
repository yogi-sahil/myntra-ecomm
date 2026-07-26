require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    const adminEmail = String(process.env.ADMIN_SEED_EMAIL || '').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_SEED_PASSWORD;
    if (!adminEmail || !adminPassword || adminPassword.length < 12) {
      throw new Error('Set ADMIN_SEED_EMAIL and an ADMIN_SEED_PASSWORD of at least 12 characters');
    }
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'myntra_clone'
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Check if admin exists
    const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
    
    if (rows.length > 0) {
      // Update existing
      await conn.query('UPDATE users SET password = ?, role = ? WHERE email = ?', [hashedPassword, 'admin', adminEmail]);
      console.log(`Admin password updated for ${adminEmail}`);
    } else {
      // Insert new
      await conn.query('INSERT INTO users (name, mobile, email, password, role) VALUES (?, ?, ?, ?, ?)', 
        [process.env.ADMIN_SEED_NAME || 'Store Admin', process.env.ADMIN_SEED_MOBILE || '9999999999', adminEmail, hashedPassword, 'admin']);
      console.log(`Admin created for ${adminEmail}`);
    }
    
    await conn.end();
  } catch(e) {
    console.error('Failed to seed admin:', e);
    process.exitCode = 1;
  }
}

seed();
