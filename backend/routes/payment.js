const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

// Initialize Razorpay with fallbacks
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_QvFiXZe6iRfjAH',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'uPdWXYO71FQeOgpfNApnPh6T',
});

// @route   POST /api/payment/create-order
// @desc    Create a Razorpay order
router.post('/create-order', async (req, res) => {
  const { amount } = req.body; // Amount from frontend in INR (rupees)

  if (!amount) {
    return res.status(400).json({ message: 'Amount is required' });
  }

  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment signature and save the order
router.post('/verify', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    totalAmount,
    shippingAddress,
    items
  } = req.body;

  // 1. Verify Signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  // 2. If authentic, save the order to our DB
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES (?, ?, ?, ?)',
      [userId || 2, totalAmount, shippingAddress || 'Default Address', 'Processing'] 
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    await connection.commit();
    res.status(200).json({ 
      message: 'Payment verified and order saved successfully', 
      orderId 
    });

  } catch (error) {
    await connection.rollback();
    console.error('DB Save Error:', error);
    res.status(500).json({ message: 'Payment verified but failed to save order to DB' });
  } finally {
    connection.release();
  }
});

module.exports = router;
