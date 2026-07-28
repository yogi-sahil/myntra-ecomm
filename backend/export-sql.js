require('dotenv').config();
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function exportSql() {
  try {
    console.log('📦 Exporting MySQL Database Schema & Data...');
    const dbName = process.env.DB_NAME || 'myntra_clone';
    await db.query(`USE \`${dbName}\``);
    let sqlContent = `-- Myntra E-Commerce MySQL Export\nSET FOREIGN_KEY_CHECKS=0;\n\n`;

    const [tables] = await db.query('SHOW TABLES');
    const tableKey = Object.keys(tables[0])[0];

    for (const row of tables) {
      const tableName = row[tableKey];
      console.log(`Exporting table: ${tableName}`);

      // Create Table statement
      const [[createTable]] = await db.query(`SHOW CREATE TABLE \`${tableName}\``);
      sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      sqlContent += `${createTable['Create Table']};\n\n`;

      // Table Data
      const [rows] = await db.query(`SELECT * FROM \`${tableName}\``);
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]).map(col => `\`${col}\``).join(', ');
        sqlContent += `INSERT INTO \`${tableName}\` (${columns}) VALUES\n`;
        const valuesList = rows.map(r => {
          const vals = Object.values(r).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'number') return val;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return `'${String(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
          }).join(', ');
          return `(${vals})`;
        }).join(',\n');
        sqlContent += `${valuesList};\n\n`;
      }
    }

    sqlContent += `SET FOREIGN_KEY_CHECKS=1;\n`;
    const outputPath = path.join(__dirname, '..', 'myntra_database.sql');
    fs.writeFileSync(outputPath, sqlContent, 'utf8');
    console.log(`✅ Successfully exported to ${outputPath}!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Export failed:', err);
    process.exit(1);
  }
}

exportSql();
