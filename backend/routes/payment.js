const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const {
  CheckoutError,
  calculateOrder,
  createCartDigest,
  saveOrderAndReduceStock,
  validateShippingAddress,
} = require('../services/orderService');

const router = express.Router();
router.use(protect);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const safeEqual = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ''), 'utf8');
  const rightBuffer = Buffer.from(String(right || ''), 'utf8');
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

router.post('/quote', async (req, res) => {
  try {
    const order = await calculateOrder(db, req.body.items, req.body.couponCode);
    return res.json({
      subtotal: order.subtotal,
      discount: order.discount,
      shippingFee: order.shippingFee,
      total: order.total,
      couponCode: order.couponCode,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Checkout quote failed:', error.message);
    return res.status(500).json({ message: 'Could not calculate checkout total' });
  }
});

router.post('/create-order', async (req, res) => {
  try {
    const order = await calculateOrder(db, req.body.items, req.body.couponCode);
    const cartHash = createCartDigest({
      userId: req.user.id,
      items: order.items,
      couponCode: order.couponCode,
      totalPaise: order.totalPaise,
    });

    const providerOrder = await razorpay.orders.create({
      amount: order.totalPaise,
      currency: 'INR',
      receipt: `user_${req.user.id}_${Date.now()}`,
      notes: {
        user_id: String(req.user.id),
        cart_hash: cartHash,
        coupon_code: order.couponCode || '',
      },
    });

    res.json({
      id: providerOrder.id,
      amount: providerOrder.amount,
      currency: providerOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      pricing: {
        subtotal: order.subtotal,
        discount: order.discount,
        shippingFee: order.shippingFee,
        total: order.total,
        couponCode: order.couponCode,
      },
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Razorpay order creation failed:', error.message);
    return res.status(502).json({ message: 'Payment service is currently unavailable' });
  }
});

router.post('/verify', async (req, res) => {
  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
    shippingAddress,
    items,
    couponCode,
  } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ message: 'Incomplete payment verification data' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (!safeEqual(expectedSignature, razorpaySignature)) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  const connection = await db.getConnection();
  try {
    const providerOrder = await razorpay.orders.fetch(razorpayOrderId);
    if (
      Number(providerOrder.amount_paid) !== Number(providerOrder.amount)
      || providerOrder.status !== 'paid'
      || providerOrder.currency !== 'INR'
    ) {
      throw new CheckoutError('Payment is not fully captured', 409);
    }
    if (String(providerOrder.notes?.user_id) !== String(req.user.id)) {
      throw new CheckoutError('Payment does not belong to this user', 403);
    }

    await connection.beginTransaction();
    const order = await calculateOrder(connection, items, couponCode, { lockProducts: true });
    if (order.totalPaise !== Number(providerOrder.amount)) {
      throw new CheckoutError('Cart total does not match the paid amount', 409);
    }

    const cartHash = createCartDigest({
      userId: req.user.id,
      items: order.items,
      couponCode: order.couponCode,
      totalPaise: order.totalPaise,
    });
    if (!safeEqual(cartHash, providerOrder.notes?.cart_hash)) {
      throw new CheckoutError('Cart contents changed after payment was initiated', 409);
    }

    const address = validateShippingAddress(shippingAddress);
    const orderId = await saveOrderAndReduceStock(connection, {
      userId: req.user.id,
      order,
      shippingAddress: address,
      status: 'Processing',
      paymentId: razorpayPaymentId,
    });

    await connection.commit();
    return res.status(201).json({ message: 'Payment verified and order placed', orderId });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'This payment has already been processed' });
    }
    if (error instanceof CheckoutError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Payment verification failed:', error.message);
    return res.status(500).json({ message: 'Payment was received but order confirmation failed. Contact support.' });
  } finally {
    connection.release();
  }
});

router.post('/cod', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const order = await calculateOrder(connection, req.body.items, req.body.couponCode, { lockProducts: true });
    const address = validateShippingAddress(req.body.shippingAddress);
    const orderId = await saveOrderAndReduceStock(connection, {
      userId: req.user.id,
      order,
      shippingAddress: address,
      status: 'Pending',
    });
    await connection.commit();
    return res.status(201).json({ message: 'COD order placed successfully', orderId });
  } catch (error) {
    await connection.rollback();
    if (error instanceof CheckoutError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('COD order failed:', error.message);
    return res.status(500).json({ message: 'Failed to place COD order' });
  } finally {
    connection.release();
  }
});

module.exports = router;
