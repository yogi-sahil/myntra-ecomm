const test = require('node:test');
const assert = require('node:assert/strict');
const { ensureOrderColumns, ensureProductionOrderSchema } = require('../orderSchema');

test('production Orders schema adds carrier and tracking number when missing', async () => {
  const statements = [];
  const connection = {
    async query(statement) {
      if (statement.includes('information_schema.COLUMNS')) return [[{ count: 0 }]];
      statements.push(statement);
      return [[]];
    },
  };

  const addedColumns = await ensureOrderColumns(connection);

  assert.deepEqual(addedColumns, ['carrier', 'tracking_number']);
  assert.deepEqual(statements, [
    'ALTER TABLE orders ADD COLUMN carrier VARCHAR(100) NULL',
    'ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100) NULL',
  ]);
});

test('production Orders schema leaves existing columns unchanged', async () => {
  let released = false;
  const database = {
    async getConnection() {
      return {
        async query() {
          return [[{ count: 1 }]];
        },
        release() {
          released = true;
        },
      };
    },
  };

  const result = await ensureProductionOrderSchema({
    database,
    env: { NODE_ENV: 'production' },
  });

  assert.deepEqual(result, { status: 'ready', addedColumns: [] });
  assert.equal(released, true);
});

test('Orders schema migration ignores a concurrent duplicate-column race', async () => {
  let informationSchemaChecks = 0;
  const connection = {
    async query(statement) {
      if (statement.includes('information_schema.COLUMNS')) {
        informationSchemaChecks += 1;
        return [[{ count: informationSchemaChecks === 1 ? 0 : 1 }]];
      }
      const error = new Error('duplicate column');
      error.code = 'ER_DUP_FIELDNAME';
      throw error;
    },
  };

  const addedColumns = await ensureOrderColumns(connection);

  assert.deepEqual(addedColumns, []);
});
