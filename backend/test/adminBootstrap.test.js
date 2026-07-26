const test = require('node:test');
const assert = require('node:assert/strict');
const { ensureConfiguredAdmin, ensureProductionAdmin } = require('../adminBootstrap');

const configuredEnv = {
  NODE_ENV: 'production',
  ADMIN_SEED_EMAIL: 'owner@example.com',
  ADMIN_SEED_PASSWORD: 'StrongAdminPass123!',
  ADMIN_SEED_NAME: 'Store Owner',
  ADMIN_SEED_MOBILE: '9876543210',
};

test('production admin bootstrap skips safely after the password is removed', async () => {
  const result = await ensureProductionAdmin({
    env: { ...configuredEnv, ADMIN_SEED_PASSWORD: '' },
    database: { query: async () => assert.fail('database should not be queried') },
  });

  assert.deepEqual(result, { status: 'skipped' });
});

test('production admin bootstrap creates a bcrypt-backed admin', async () => {
  const calls = [];
  const database = {
    async query(statement, params) {
      calls.push({ statement, params });
      if (statement.startsWith('SELECT id, password')) return [[]];
      if (statement.startsWith('SELECT id FROM users')) return [[]];
      return [{ insertId: 42 }];
    },
  };
  const passwordHasher = {
    async hash(password, rounds) {
      assert.equal(password, configuredEnv.ADMIN_SEED_PASSWORD);
      assert.equal(rounds, 12);
      return 'hashed-admin-password';
    },
    async compare() {
      assert.fail('new admins do not need a password comparison');
    },
  };

  const result = await ensureConfiguredAdmin({
    env: configuredEnv,
    database,
    passwordHasher,
  });

  assert.deepEqual(result, { status: 'created', id: 42 });
  assert.match(calls[2].statement, /INSERT INTO users/);
  assert.deepEqual(calls[2].params, [
    'Store Owner',
    '9876543210',
    'owner@example.com',
    'hashed-admin-password',
  ]);
});

test('production admin bootstrap does not rewrite an unchanged admin', async () => {
  let queryCount = 0;
  const database = {
    async query() {
      queryCount += 1;
      return [[{ id: 7, password: 'stored-hash', role: 'admin' }]];
    },
  };
  const passwordHasher = {
    async compare(password, hash) {
      assert.equal(password, configuredEnv.ADMIN_SEED_PASSWORD);
      assert.equal(hash, 'stored-hash');
      return true;
    },
  };

  const result = await ensureConfiguredAdmin({
    env: configuredEnv,
    database,
    passwordHasher,
  });

  assert.deepEqual(result, { status: 'unchanged', id: 7 });
  assert.equal(queryCount, 1);
});

test('production admin bootstrap rejects a duplicate mobile', async () => {
  let queryCount = 0;
  const database = {
    async query() {
      queryCount += 1;
      if (queryCount === 1) return [[]];
      return [[{ id: 8 }]];
    },
  };

  await assert.rejects(
    ensureConfiguredAdmin({
      env: configuredEnv,
      database,
      passwordHasher: { hash: async () => 'unused' },
    }),
    /ADMIN_SEED_MOBILE already belongs to another account/,
  );
});
