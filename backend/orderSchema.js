const db = require('./config/db');

const ORDER_COLUMN_MIGRATIONS = [
  ['carrier', 'ALTER TABLE orders ADD COLUMN carrier VARCHAR(100) NULL'],
  ['tracking_number', 'ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100) NULL'],
];

async function ensureOrderColumns(connection) {
  const addedColumns = [];
  for (const [column, statement] of ORDER_COLUMN_MIGRATIONS) {
    const [[state]] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'orders'
         AND COLUMN_NAME = ?`,
      [column],
    );
    if (Number(state.count) > 0) continue;

    try {
      await connection.query(statement);
      addedColumns.push(column);
    } catch (error) {
      // Multiple app processes can start together. If another process added
      // the column after our check, the desired schema is already in place.
      if (error.code !== 'ER_DUP_FIELDNAME') throw error;
    }
  }
  return addedColumns;
}

async function ensureProductionOrderSchema({
  database = db,
  env = process.env,
} = {}) {
  if (env.NODE_ENV !== 'production') return { status: 'skipped', addedColumns: [] };

  const connection = await database.getConnection();
  try {
    const addedColumns = await ensureOrderColumns(connection);
    console.log(
      addedColumns.length
        ? `Production Orders schema added: ${addedColumns.join(', ')}.`
        : 'Production Orders schema is already ready.',
    );
    return { status: 'ready', addedColumns };
  } finally {
    connection.release();
  }
}

module.exports = {
  ORDER_COLUMN_MIGRATIONS,
  ensureOrderColumns,
  ensureProductionOrderSchema,
};
