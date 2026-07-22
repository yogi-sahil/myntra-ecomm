require('dotenv').config();
const mysql = require('mysql2/promise');
async function test() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'myntra_clone'
    });
    console.log('Connected!');
    await conn.end();
  } catch(e) {
    console.error('Error:', e);
  }
}
test();
