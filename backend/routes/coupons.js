const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const validateCoupon = ({ code, type, value, minOrder, expiry, status }) => {
  if (!code || !/^[A-Z0-9_-]{3,32}$/.test(code.toUpperCase())) return 'Use a valid coupon code';
  if (!['Percentage', 'Fixed'].includes(type)) return 'Choose a valid discount type';
  if (Number(value) <= 0 || (type === 'Percentage' && Number(value) > 100)) return 'Choose a valid discount value';
  if (Number(minOrder) < 0) return 'Minimum order value cannot be negative';
  if (!expiry || Number.isNaN(new Date(expiry).getTime())) return 'Choose a valid expiry date';
  if (!['Active', 'Inactive'].includes(status)) return 'Choose a valid coupon status';
  return null;
};

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code (Public / Authenticated)
router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const [rows] = await db.query('SELECT * FROM coupons WHERE code = ?', [code.toUpperCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    const coupon = rows[0];

    if (coupon.status !== 'Active') {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    const currentDate = new Date();
    const expiryDate = new Date(coupon.expiry_date);
    if (currentDate > expiryDate) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    if (cartTotal < coupon.min_order_value) {
      return res.status(400).json({ message: `Minimum order value of ₹${coupon.min_order_value} required` });
    }

    res.json({
      message: 'Coupon applied successfully',
      coupon: {
        code: coupon.code,
        type: coupon.discount_type,
        value: coupon.discount_value
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error validating coupon' });
  }
});

// Admin Routes (all protected by adminOnly)

// @route   GET /api/coupons
// @desc    Get all coupons (Admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching coupons' });
  }
});

// @route   POST /api/coupons
// @desc    Create a new coupon (Admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { code, type, value, minOrder, expiry, status } = req.body;
    const validationError = validateCoupon(req.body);
    if (validationError) return res.status(400).json({ message: validationError });
    
    // Check if exists
    const [existing] = await db.query('SELECT id FROM coupons WHERE code = ?', [code.toUpperCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO coupons (code, discount_type, discount_value, min_order_value, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [code.toUpperCase(), type, value, minOrder, expiry, status]
    );
    
    res.status(201).json({ message: 'Coupon created successfully', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating coupon' });
  }
});

// @route   PUT /api/coupons/:id
// @desc    Update a coupon (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { code, type, value, minOrder, expiry, status } = req.body;
    const validationError = validateCoupon(req.body);
    if (validationError) return res.status(400).json({ message: validationError });
    
    const [result] = await db.query(
      'UPDATE coupons SET code = ?, discount_type = ?, discount_value = ?, min_order_value = ?, expiry_date = ?, status = ? WHERE id = ?',
      [code.toUpperCase(), type, value, minOrder, expiry, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json({ message: 'Coupon updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating coupon' });
  }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete a coupon (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting coupon' });
  }
});

module.exports = router;
