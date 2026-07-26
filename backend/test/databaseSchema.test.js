const test = require('node:test');
const assert = require('node:assert/strict');
const {
  REQUIRED_TABLES,
  SETTINGS_DEFAULTS,
  ensureApplicationSchema,
  ensureProductionDatabaseSchema,
} = require('../databaseSchema');

const legacyColumns = {
  cart_items: [
    { COLUMN_NAME: 'id', COLUMN_TYPE: 'int(11)' },
    { COLUMN_NAME: 'user_id', COLUMN_TYPE: 'int(11)' },
    { COLUMN_NAME: 'product_id', COLUMN_TYPE: 'int(11)' },
  ],
  coupons: [
    { COLUMN_NAME: 'id', COLUMN_TYPE: 'int(11)' },
    { COLUMN_NAME: 'discount_percentage', COLUMN_TYPE: 'int(11)', IS_NULLABLE: 'NO' },
    { COLUMN_NAME: 'min_order_amount', COLUMN_TYPE: 'decimal(10,2)' },
    { COLUMN_NAME: 'valid_until', COLUMN_TYPE: 'date' },
    { COLUMN_NAME: 'status', COLUMN_TYPE: "enum('Active','Expired','Disabled')" },
  ],
  users: [
    { COLUMN_NAME: 'role', COLUMN_TYPE: "enum('customer','admin')" },
  ],
};

test('application bootstrap repairs the production dump schema', async () => {
  const statements = [];
  const connection = {
    async query(statement, params = []) {
      if (statement.includes('information_schema.COLUMNS')) {
        if (params.length === 1 && legacyColumns[params[0]]) {
          return [legacyColumns[params[0]]];
        }
        // orderSchema checks carrier and tracking_number one at a time.
        return [[{ count: 1 }]];
      }
      statements.push(statement);
      return [[]];
    },
  };

  const changes = await ensureApplicationSchema(connection);

  assert.equal(
    statements.filter((statement) => statement.startsWith('CREATE TABLE IF NOT EXISTS')).length,
    REQUIRED_TABLES.length,
  );
  assert.ok(statements.some((statement) => statement.includes('CREATE TABLE IF NOT EXISTS cart_items')));
  assert.ok(statements.some((statement) => statement.includes('CREATE TABLE IF NOT EXISTS wishlist_items')));
  assert.ok(statements.some((statement) => statement.includes('CREATE TABLE IF NOT EXISTS user_addresses')));
  assert.ok(statements.some((statement) => statement.includes('CREATE TABLE IF NOT EXISTS order_payments')));
  assert.ok(statements.includes('ALTER TABLE cart_items ADD COLUMN quantity INT NOT NULL DEFAULT 1'));
  assert.ok(statements.some((statement) => statement.includes('ADD COLUMN discount_type')));
  assert.ok(statements.some((statement) => statement.includes('MODIFY COLUMN discount_percentage INT NULL')));
  assert.ok(statements.some((statement) => statement.includes("MODIFY COLUMN role ENUM('customer','user','admin')")));
  assert.equal(
    statements.filter((statement) => statement.includes('INSERT INTO settings')).length,
    SETTINGS_DEFAULTS.length,
  );
  assert.ok(changes.includes('quantity'));
  assert.ok(changes.includes('discount_type'));
  assert.ok(changes.includes('users.role'));
});

test('production wrapper releases its database connection', async () => {
  let released = false;
  const database = {
    async getConnection() {
      return {
        async query(statement, params = []) {
          if (statement.includes('information_schema.COLUMNS')) {
            if (params.length === 1 && params[0] === 'users') {
              return [[{
                COLUMN_NAME: 'role',
                COLUMN_TYPE: "enum('customer','user','admin')",
              }]];
            }
            if (params.length === 1 && params[0] === 'coupons') {
              return [[{
                COLUMN_NAME: 'status',
                COLUMN_TYPE: "enum('Active','Inactive','Expired','Disabled')",
              }, {
                COLUMN_NAME: 'discount_type',
                COLUMN_TYPE: "enum('Percentage','Fixed')",
              }, {
                COLUMN_NAME: 'discount_value',
                COLUMN_TYPE: 'decimal(10,2)',
              }, {
                COLUMN_NAME: 'min_order_value',
                COLUMN_TYPE: 'decimal(10,2)',
              }, {
                COLUMN_NAME: 'expiry_date',
                COLUMN_TYPE: 'date',
              }]];
            }
            if (params.length === 1 && params[0] === 'cart_items') {
              return [[
                { COLUMN_NAME: 'quantity', COLUMN_TYPE: 'int(11)' },
                { COLUMN_NAME: 'size', COLUMN_TYPE: 'varchar(50)' },
              ]];
            }
            return [[{ count: 1 }]];
          }
          return [[]];
        },
        release() {
          released = true;
        },
      };
    },
  };

  const result = await ensureProductionDatabaseSchema({
    database,
    env: { NODE_ENV: 'production' },
  });

  assert.deepEqual(result, { status: 'ready', changes: [] });
  assert.equal(released, true);
});

test('database bootstrap is skipped outside production', async () => {
  const result = await ensureProductionDatabaseSchema({
    database: {
      async getConnection() {
        assert.fail('database should not be opened');
      },
    },
    env: { NODE_ENV: 'test' },
  });
  assert.deepEqual(result, { status: 'skipped', changes: [] });
});
