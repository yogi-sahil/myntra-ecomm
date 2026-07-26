const bcrypt = require('bcryptjs');
const db = require('./config/db');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^\+?[0-9]{10,15}$/;

const readAdminConfig = (env) => ({
  email: String(env.ADMIN_SEED_EMAIL || '').trim().toLowerCase(),
  password: String(env.ADMIN_SEED_PASSWORD || ''),
  name: String(env.ADMIN_SEED_NAME || 'Store Admin').trim(),
  mobile: String(env.ADMIN_SEED_MOBILE || '9999999999').trim(),
});

async function ensureConfiguredAdmin({
  database = db,
  passwordHasher = bcrypt,
  env = process.env,
  required = false,
} = {}) {
  const config = readAdminConfig(env);
  if (!config.password) {
    if (required) {
      throw new Error('Set ADMIN_SEED_PASSWORD before running the admin seed');
    }
    return { status: 'skipped' };
  }

  if (!EMAIL_PATTERN.test(config.email)) {
    throw new Error('ADMIN_SEED_EMAIL must be a valid email address');
  }
  if (config.password.length < 12 || config.password.length > 128) {
    throw new Error('ADMIN_SEED_PASSWORD must contain 12 to 128 characters');
  }
  if (config.name.length < 2 || config.name.length > 100) {
    throw new Error('ADMIN_SEED_NAME must contain 2 to 100 characters');
  }
  if (!MOBILE_PATTERN.test(config.mobile)) {
    throw new Error('ADMIN_SEED_MOBILE must contain 10 to 15 digits');
  }

  const [users] = await database.query(
    'SELECT id, password, role FROM users WHERE email = ? LIMIT 1',
    [config.email],
  );
  const existingAdmin = users[0];

  if (existingAdmin) {
    const passwordMatches = existingAdmin.password
      ? await passwordHasher.compare(config.password, existingAdmin.password)
      : false;
    if (passwordMatches && existingAdmin.role === 'admin') {
      console.log('Configured production admin is already ready.');
      return { status: 'unchanged', id: existingAdmin.id };
    }

    const passwordHash = passwordMatches
      ? existingAdmin.password
      : await passwordHasher.hash(config.password, 12);
    await database.query(
      "UPDATE users SET name = ?, password = ?, role = 'admin' WHERE id = ?",
      [config.name, passwordHash, existingAdmin.id],
    );
    console.log('Configured production admin was updated.');
    return { status: 'updated', id: existingAdmin.id };
  }

  const [mobileUsers] = await database.query(
    'SELECT id FROM users WHERE mobile = ? LIMIT 1',
    [config.mobile],
  );
  if (mobileUsers.length) {
    throw new Error('ADMIN_SEED_MOBILE already belongs to another account');
  }

  const passwordHash = await passwordHasher.hash(config.password, 12);
  const [result] = await database.query(
    "INSERT INTO users (name, mobile, email, password, role) VALUES (?, ?, ?, ?, 'admin')",
    [config.name, config.mobile, config.email, passwordHash],
  );
  console.log('Configured production admin was created.');
  return { status: 'created', id: result.insertId };
}

async function ensureProductionAdmin(options = {}) {
  const env = options.env || process.env;
  if (env.NODE_ENV !== 'production') return { status: 'skipped' };
  return ensureConfiguredAdmin({ ...options, env });
}

module.exports = {
  ensureConfiguredAdmin,
  ensureProductionAdmin,
  readAdminConfig,
};
