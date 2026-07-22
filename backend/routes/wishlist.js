const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/wishlist
// @desc    Get all wishlist items for logged-in user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(`
      SELECT w.id as wishlist_item_id, p.* 
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
    `, [userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching wishlist' });
  }
});

// @route   POST /api/wishlist
// @desc    Add item to wishlist
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Insert ignore handles duplicates smoothly due to unique constraint
    await db.query('INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)', [userId, productId]);

    res.status(200).json({ message: 'Added to wishlist successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error adding to wishlist' });
  }
});

// @route   DELETE /api/wishlist/:productId
// @desc    Remove an item from wishlist
router.delete('/:productId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await db.query('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
    res.status(200).json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error removing from wishlist' });
  }
});

module.exports = router;
