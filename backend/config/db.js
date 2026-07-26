const mysql = require('mysql2/promise');
const { normalizeDbHost } = require('./dbHost');
try { require('dotenv').config(); } catch {}

// Create a connection pool to MySQL
const pool = mysql.createPool({
  // Hostinger's local MySQL account is commonly granted to 127.0.0.1, while
  // Node may resolve "localhost" to IPv6 ::1. Force the equivalent IPv4 host.
  host: normalizeDbHost(process.env.DB_HOST),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
