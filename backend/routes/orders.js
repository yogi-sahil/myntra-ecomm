const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   POST /api/orders
// @desc    Create a new order (Checkout)
router.post('/', async (req, res) => {
  const { userId, totalAmount, shippingAddress, items } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Create the Order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)',
      [userId || 2, totalAmount, shippingAddress || 'Default Address'] // defaulting user for now
    );
    const orderId = orderResult.insertId;

    // 2. Insert Order Items
    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Order placed successfully', orderId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error placing order' });
  } finally {
    connection.release();
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders (Admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.id, o.total_amount, o.status, o.created_at, o.shipping_address, o.carrier, o.tracking_number, u.name as customer_name, u.email as customer_email, u.mobile as customer_mobile, COUNT(oi.id) as total_items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching orders' });
  }
});

// @route   GET /api/admin/orders/:id/items
// @desc    Get items for a specific order (Admin)
router.get('/:id/items', protect, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT oi.*, p.title, p.brand, p.image_url, p.sku
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching order items' });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get logged in user orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(`
      SELECT o.id, o.total_amount, o.status, o.created_at, o.shipping_address, o.carrier, o.tracking_number, COUNT(oi.id) as total_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching user orders' });
  }
});

// @route   POST /api/admin/orders/bulk-status
// @desc    Bulk update order statuses (Admin)
router.post('/bulk-status', protect, adminOnly, async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({ message: 'Provide order IDs and status' });
    }
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Choose a valid order status' });
    }

    await db.query('UPDATE orders SET status = ? WHERE id IN (?)', [status, ids]);
    res.json({ message: `Updated ${ids.length} order(s) to ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error performing bulk status update' });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status and optional carrier/tracking number (Admin)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, carrier, tracking_number } = req.body;
    const transitions = {
      Pending: ['Processing', 'Cancelled'],
      Processing: ['Shipped', 'Cancelled'],
      Shipped: ['Delivered', 'Cancelled'],
      Delivered: [],
      Cancelled: [],
    };
    if (!status || !Object.hasOwn(transitions, status)) return res.status(400).json({ message: 'Choose a valid order status' });
    const [orders] = await db.query('SELECT status, carrier, tracking_number FROM orders WHERE id = ?', [req.params.id]);
    if (!orders.length) return res.status(404).json({ message: 'Order not found' });
    const currentStatus = orders[0].status;

    if (status !== currentStatus && !transitions[currentStatus]?.includes(status)) {
      return res.status(400).json({ message: `Order cannot move from ${currentStatus} to ${status}` });
    }
    
    await db.query(
      'UPDATE orders SET status = ?, carrier = COALESCE(?, carrier), tracking_number = COALESCE(?, tracking_number) WHERE id = ?',
      [status, carrier || null, tracking_number || null, req.params.id]
    );
    
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating order status' });
  }
});

module.exports = router;
