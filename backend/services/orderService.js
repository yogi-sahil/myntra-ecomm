const crypto = require('crypto');

const MAX_LINE_ITEMS = 50;
const MAX_QUANTITY_PER_ITEM = 10;
const DEFAULT_CONVENIENCE_FEE = 99;
const DEFAULT_FREE_SHIPPING_THRESHOLD = 1000;

class CheckoutError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'CheckoutError';
    this.status = status;
  }
}

const money = (value) => Math.round(Number(value) * 100) / 100;

const normalizeItems = (rawItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > MAX_LINE_ITEMS) {
    throw new CheckoutError(`Order must contain between 1 and ${MAX_LINE_ITEMS} items`);
  }

  const combined = new Map();
  for (const rawItem of rawItems) {
    const productId = Number(rawItem.productId ?? rawItem.id);
    const quantity = Number(rawItem.quantity);
    const size = String(rawItem.size || 'Standard').trim().slice(0, 50);

    if (!Number.isInteger(productId) || productId < 1) {
      throw new CheckoutError('Every cart item must have a valid product ID');
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      throw new CheckoutError(`Item quantities must be whole numbers from 1 to ${MAX_QUANTITY_PER_ITEM}`);
    }

    const key = `${productId}:${size}`;
    const existing = combined.get(key);
    const nextQuantity = (existing?.quantity || 0) + quantity;
    if (nextQuantity > MAX_QUANTITY_PER_ITEM) {
      throw new CheckoutError(`A product cannot have more than ${MAX_QUANTITY_PER_ITEM} units`);
    }
    combined.set(key, { productId, quantity: nextQuantity, size });
  }

  return [...combined.values()].sort((a, b) =>
    a.productId - b.productId || a.size.localeCompare(b.size)
  );
};

const loadSettings = async (connection) => {
  const [rows] = await connection.query(
    "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('convenience_fee', 'free_shipping_threshold')"
  );
  const values = Object.fromEntries(rows.map((row) => [row.setting_key, Number(row.setting_value)]));
  return {
    convenienceFee: Number.isFinite(values.convenience_fee)
      ? Math.max(0, values.convenience_fee)
      : DEFAULT_CONVENIENCE_FEE,
    freeShippingThreshold: Number.isFinite(values.free_shipping_threshold)
      ? Math.max(0, values.free_shipping_threshold)
      : DEFAULT_FREE_SHIPPING_THRESHOLD,
  };
};

const calculateCoupon = async (connection, couponCode, subtotal) => {
  if (!couponCode) return { code: null, discount: 0 };

  const normalizedCode = String(couponCode).trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,32}$/.test(normalizedCode)) {
    throw new CheckoutError('Invalid coupon code');
  }

  const [rows] = await connection.query(
    'SELECT code, discount_type, discount_value, min_order_value, expiry_date, status FROM coupons WHERE code = ?',
    [normalizedCode]
  );
  if (rows.length === 0) throw new CheckoutError('Invalid coupon code');

  const coupon = rows[0];
  const expiresAt = new Date(coupon.expiry_date);
  expiresAt.setHours(23, 59, 59, 999);
  if (coupon.status !== 'Active' || Date.now() > expiresAt.getTime()) {
    throw new CheckoutError('This coupon is inactive or expired');
  }
  if (subtotal < Number(coupon.min_order_value)) {
    throw new CheckoutError(`Minimum order value of ₹${coupon.min_order_value} required`);
  }

  const rawDiscount = coupon.discount_type === 'Percentage'
    ? subtotal * (Number(coupon.discount_value) / 100)
    : Number(coupon.discount_value);

  return { code: coupon.code, discount: money(Math.min(subtotal, Math.max(0, rawDiscount))) };
};

const calculateOrder = async (connection, rawItems, couponCode, { lockProducts = false } = {}) => {
  const items = normalizeItems(rawItems);
  const ids = [...new Set(items.map((item) => item.productId))];
  const lockClause = lockProducts ? ' FOR UPDATE' : '';
  const [products] = await connection.query(
    `SELECT id, title, price, stock_quantity FROM products WHERE id IN (?)${lockClause}`,
    [ids]
  );

  if (products.length !== ids.length) {
    throw new CheckoutError('One or more products are unavailable');
  }

  const productMap = new Map(products.map((product) => [Number(product.id), product]));
  const quantitiesByProduct = new Map();
  const pricedItems = items.map((item) => {
    const product = productMap.get(item.productId);
    const totalQuantity = (quantitiesByProduct.get(item.productId) || 0) + item.quantity;
    quantitiesByProduct.set(item.productId, totalQuantity);
    if (totalQuantity > Number(product.stock_quantity || 0)) {
      throw new CheckoutError(`${product.title} has only ${product.stock_quantity || 0} unit(s) available`, 409);
    }
    return { ...item, title: product.title, price: money(product.price) };
  });

  const subtotal = money(pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const coupon = await calculateCoupon(connection, couponCode, subtotal);
  const settings = await loadSettings(connection);
  const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.convenienceFee;
  const total = money(Math.max(0, subtotal - coupon.discount + shippingFee));

  if (total <= 0) throw new CheckoutError('Order total must be greater than zero');

  return {
    items: pricedItems,
    subtotal,
    couponCode: coupon.code,
    discount: coupon.discount,
    shippingFee: money(shippingFee),
    total,
    totalPaise: Math.round(total * 100),
  };
};

const createCartDigest = ({ userId, items, couponCode, totalPaise }) => {
  const payload = JSON.stringify({
    userId: Number(userId),
    items: normalizeItems(items),
    couponCode: couponCode || null,
    totalPaise: Number(totalPaise),
  });
  return crypto.createHmac('sha256', process.env.JWT_SECRET).update(payload).digest('hex');
};

const validateShippingAddress = (value) => {
  const address = String(value || '').trim();
  if (address.length < 10 || address.length > 1000) {
    throw new CheckoutError('Please provide a valid shipping address');
  }
  return address;
};

const saveOrderAndReduceStock = async (
  connection,
  { userId, order, shippingAddress, status, paymentId = null }
) => {
  const [orderResult] = await connection.query(
    'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES (?, ?, ?, ?)',
    [userId, order.total, shippingAddress, status]
  );
  const orderId = orderResult.insertId;

  for (const item of order.items) {
    await connection.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, item.productId, item.quantity, item.price]
    );
    const [stockResult] = await connection.query(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
      [item.quantity, item.productId, item.quantity]
    );
    if (stockResult.affectedRows !== 1) {
      throw new CheckoutError(`${item.title} went out of stock during checkout`, 409);
    }
  }

  if (paymentId) {
    await connection.query(
      'INSERT INTO order_payments (order_id, provider, provider_payment_id, amount) VALUES (?, ?, ?, ?)',
      [orderId, 'razorpay', paymentId, order.total]
    );
  }

  await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  return orderId;
};

module.exports = {
  CheckoutError,
  calculateOrder,
  createCartDigest,
  normalizeItems,
  saveOrderAndReduceStock,
  validateShippingAddress,
};
