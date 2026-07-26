const test = require('node:test');
const assert = require('node:assert/strict');
const { ensureColumns } = require('../seed_cosmetics_catalog');

test('catalog bootstrap adds seller for legacy production schemas', async () => {
  const executedStatements = [];
  const connection = {
    async query(statement, params) {
      if (statement.includes('information_schema.COLUMNS')) {
        return [[{ count: params[1] === 'seller' ? 0 : 1 }]];
      }
      executedStatements.push(statement);
      return [[]];
    },
  };

  await ensureColumns(connection);

  assert.deepEqual(executedStatements, [
    'ALTER TABLE products ADD COLUMN seller VARCHAR(255) NULL',
  ]);
});
