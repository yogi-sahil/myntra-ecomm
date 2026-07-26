const db = require('./config/db');
const { ensureOrderColumns } = require('./orderSchema');

const REQUIRED_TABLES = [
  `CREATE TABLE IF NOT EXISTS cart_items (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     product_id INT NOT NULL,
     quantity INT NOT NULL DEFAULT 1,
     size VARCHAR(50) NOT NULL DEFAULT 'One Size',
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     UNIQUE KEY unique_cart_user_product (user_id, product_id),
     CONSTRAINT fk_cart_items_user
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
     CONSTRAINT fk_cart_items_product
       FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS wishlist_items (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     product_id INT NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     UNIQUE KEY unique_wishlist_user_product (user_id, product_id),
     CONSTRAINT fk_wishlist_items_user
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
     CONSTRAINT fk_wishlist_items_product
       FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS user_addresses (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     name VARCHAR(100) NOT NULL,
     mobile VARCHAR(20) NOT NULL,
     pincode VARCHAR(20) NOT NULL,
     address_line TEXT NOT NULL,
     city VARCHAR(100) NOT NULL,
     state VARCHAR(100) NOT NULL,
     is_default BOOLEAN NOT NULL DEFAULT FALSE,
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     KEY idx_user_addresses_user (user_id),
     CONSTRAINT fk_user_addresses_user
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS settings (
     setting_key VARCHAR(50) PRIMARY KEY,
     setting_value VARCHAR(255) NOT NULL,
     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
       ON UPDATE CURRENT_TIMESTAMP
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS coupons (
     id INT AUTO_INCREMENT PRIMARY KEY,
     code VARCHAR(50) NOT NULL,
     discount_type ENUM('Percentage','Fixed') NOT NULL DEFAULT 'Percentage',
     discount_value DECIMAL(10,2) NOT NULL,
     min_order_value DECIMAL(10,2) NOT NULL DEFAULT 0,
     expiry_date DATE NOT NULL,
     status ENUM('Active','Inactive','Expired','Disabled') NOT NULL DEFAULT 'Active',
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     UNIQUE KEY unique_coupon_code (code)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS admin_audit_logs (
     id INT AUTO_INCREMENT PRIMARY KEY,
     admin_id INT NULL,
     action VARCHAR(255) NOT NULL,
     details TEXT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     KEY idx_admin_audit_logs_admin (admin_id)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS order_payments (
     id INT AUTO_INCREMENT PRIMARY KEY,
     order_id INT NOT NULL,
     provider VARCHAR(30) NOT NULL,
     provider_payment_id VARCHAR(100) NOT NULL,
     amount DECIMAL(10, 2) NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     UNIQUE KEY unique_provider_payment_id (provider_payment_id),
     KEY idx_order_payments_order (order_id),
     CONSTRAINT fk_order_payments_order
       FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

const SETTINGS_DEFAULTS = [
  ['store_name', 'Myntra'],
  ['contact_email', 'support@myntra.com'],
  ['support_phone', '+91 98765 43210'],
  ['currency', 'INR'],
  ['convenience_fee', '99'],
  ['free_shipping_threshold', '1000'],
];

async function getColumns(connection, table) {
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table],
  );
  return new Map(rows.map((row) => [
    String(row.COLUMN_NAME || row.column_name).toLowerCase(),
    {
      type: String(row.COLUMN_TYPE || row.column_type || '').toLowerCase(),
      nullable: String(row.IS_NULLABLE || row.is_nullable || '').toUpperCase(),
      defaultValue: row.COLUMN_DEFAULT ?? row.column_default,
    },
  ]));
}

async function addColumnIfMissing(connection, columns, column, statement, changes) {
  if (columns.has(column)) return;
  try {
    await connection.query(statement);
    columns.set(column, { type: '', nullable: '', defaultValue: undefined });
    changes.push(column);
  } catch (error) {
    // Hostinger can start more than one Node process during a deployment.
    // A concurrent process adding the same column means the schema is ready.
    if (error.code !== 'ER_DUP_FIELDNAME') throw error;
  }
}

async function ensureCartCompatibility(connection, changes) {
  const columns = await getColumns(connection, 'cart_items');
  await addColumnIfMissing(
    connection,
    columns,
    'quantity',
    'ALTER TABLE cart_items ADD COLUMN quantity INT NOT NULL DEFAULT 1',
    changes,
  );
  await addColumnIfMissing(
    connection,
    columns,
    'size',
    "ALTER TABLE cart_items ADD COLUMN size VARCHAR(50) NOT NULL DEFAULT 'One Size'",
    changes,
  );
}

async function ensureCouponCompatibility(connection, changes) {
  const columns = await getColumns(connection, 'coupons');
  const hadMinOrderValue = columns.has('min_order_value');
  const additions = [
    ['discount_type', "ALTER TABLE coupons ADD COLUMN discount_type ENUM('Percentage','Fixed') NOT NULL DEFAULT 'Percentage'"],
    ['discount_value', 'ALTER TABLE coupons ADD COLUMN discount_value DECIMAL(10,2) NULL'],
    ['min_order_value', 'ALTER TABLE coupons ADD COLUMN min_order_value DECIMAL(10,2) NOT NULL DEFAULT 0'],
    ['expiry_date', 'ALTER TABLE coupons ADD COLUMN expiry_date DATE NULL'],
  ];

  for (const [column, statement] of additions) {
    await addColumnIfMissing(connection, columns, column, statement, changes);
  }

  if (columns.has('discount_percentage')) {
    await connection.query(
      'UPDATE coupons SET discount_value = COALESCE(discount_value, discount_percentage)',
    );
    // The legacy production column was NOT NULL without a default, which makes
    // inserts using the current coupon model fail even after adding new columns.
    if (columns.get('discount_percentage').nullable !== 'YES') {
      await connection.query(
        'ALTER TABLE coupons MODIFY COLUMN discount_percentage INT NULL DEFAULT NULL',
      );
      changes.push('coupons.discount_percentage');
    }
  }
  if (columns.has('min_order_amount')) {
    await connection.query(hadMinOrderValue
      ? 'UPDATE coupons SET min_order_value = min_order_amount WHERE min_order_value IS NULL'
      : 'UPDATE coupons SET min_order_value = COALESCE(min_order_amount, 0)');
  }
  if (columns.has('valid_until')) {
    await connection.query(
      'UPDATE coupons SET expiry_date = COALESCE(expiry_date, valid_until)',
    );
  }

  const statusType = columns.get('status')?.type || '';
  if (!statusType.includes("'inactive'") || !statusType.includes("'disabled'")) {
    await connection.query(
      "ALTER TABLE coupons MODIFY COLUMN status ENUM('Active','Inactive','Expired','Disabled') NOT NULL DEFAULT 'Active'",
    );
    changes.push('coupons.status');
  }
}

async function ensureUserRoleCompatibility(connection, changes) {
  const columns = await getColumns(connection, 'users');
  const roleType = columns.get('role')?.type || '';
  if (
    roleType.includes("'customer'")
    && roleType.includes("'user'")
    && roleType.includes("'admin'")
  ) return;

  await connection.query(
    "ALTER TABLE users MODIFY COLUMN role ENUM('customer','user','admin') NOT NULL DEFAULT 'customer'",
  );
  changes.push('users.role');
}

async function ensureSettings(connection) {
  for (const [key, value] of SETTINGS_DEFAULTS) {
    await connection.query(
      `INSERT INTO settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = setting_value`,
      [key, value],
    );
  }
  await connection.query(
    "DELETE FROM settings WHERE setting_key IN ('razorpay_key_id', 'razorpay_key_secret')",
  );
}

async function ensureApplicationSchema(connection) {
  const changes = [];
  for (const statement of REQUIRED_TABLES) {
    await connection.query(statement);
  }

  changes.push(...await ensureOrderColumns(connection));
  await ensureCartCompatibility(connection, changes);
  await ensureCouponCompatibility(connection, changes);
  await ensureUserRoleCompatibility(connection, changes);
  await ensureSettings(connection);
  return changes;
}

async function ensureProductionDatabaseSchema({
  database = db,
  env = process.env,
} = {}) {
  if (env.NODE_ENV !== 'production') return { status: 'skipped', changes: [] };

  const connection = await database.getConnection();
  try {
    const changes = await ensureApplicationSchema(connection);
    console.log(
      changes.length
        ? `Production database schema repaired: ${changes.join(', ')}.`
        : 'Production database schema is ready.',
    );
    return { status: 'ready', changes };
  } finally {
    connection.release();
  }
}

module.exports = {
  REQUIRED_TABLES,
  SETTINGS_DEFAULTS,
  ensureApplicationSchema,
  ensureProductionDatabaseSchema,
};
