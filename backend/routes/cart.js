const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/cart
// @desc    Get all cart items for logged-in user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(`
      SELECT c.id as cart_item_id, c.quantity, c.size, p.* 
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching cart' });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart or update quantity
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, size = 'M' } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const qty = quantity || 1;

    // Check if item already exists in cart with same size
    const [existing] = await db.query('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?', [userId, productId, size]);

    if (existing.length > 0) {
      // Update quantity
      await db.query('UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ? AND size = ?', [qty, userId, productId, size]);
    } else {
      // Insert new
      await db.query('INSERT INTO cart_items (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)', [userId, productId, qty, size]);
    }

    res.status(200).json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error adding to cart' });
  }
});

// @route   DELETE /api/cart/:cartItemId
// @desc    Remove an item from cart
router.delete('/:cartItemId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;

    // Need to delete by cart_item_id to differentiate same product with different sizes
    await db.query('DELETE FROM cart_items WHERE user_id = ? AND id = ?', [userId, cartItemId]);
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error removing item' });
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
router.delete('/', async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error clearing cart' });
  }
});

module.exports = router;
