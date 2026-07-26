const express = require('express');
const router = express.Router();
const db = require('../config/db');

const loadCart = async (userId) => {
  const [rows] = await db.query(`
    SELECT c.id as cart_item_id, c.quantity, c.size, p.*
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
    ORDER BY c.id DESC
  `, [userId]);
  return rows;
};

// @route   GET /api/cart
// @desc    Get all cart items for logged-in user
router.get('/', async (req, res) => {
  try {
    res.json(await loadCart(req.user.id));
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
    const { productId, quantity, size = 'One Size' } = req.body;
    const parsedProductId = Number(productId);
    const qty = quantity === undefined ? 1 : Number(quantity);
    const normalizedSize = String(size).trim().slice(0, 50);

    if (!Number.isInteger(parsedProductId) || parsedProductId < 1) {
      return res.status(400).json({ message: 'A valid product ID is required' });
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
      return res.status(400).json({ message: 'Quantity must be a whole number from 1 to 10' });
    }
    if (!normalizedSize) return res.status(400).json({ message: 'A size or variant is required' });

    // The current schema stores one cart row per user/product. Cosmetics use a
    // variant label, so update that row instead of attempting a duplicate insert.
    const [products] = await db.query(
      'SELECT stock_quantity FROM products WHERE id = ?',
      [parsedProductId]
    );
    if (!products.length) return res.status(404).json({ message: 'Product not found' });

    const [existing] = await db.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, parsedProductId]
    );
    const nextQuantity = Number(existing[0]?.quantity || 0) + qty;
    if (nextQuantity > 10 || nextQuantity > Number(products[0].stock_quantity || 0)) {
      return res.status(409).json({ message: 'Requested quantity is not available' });
    }

    if (existing.length > 0) {
      await db.query(
        'UPDATE cart_items SET quantity = quantity + ?, size = ? WHERE id = ? AND user_id = ?',
        [qty, normalizedSize, existing[0].id, userId]
      );
    } else {
      await db.query(
        'INSERT INTO cart_items (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)',
        [userId, parsedProductId, qty, normalizedSize]
      );
    }

    res.status(200).json({
      message: 'Cart updated successfully',
      items: await loadCart(userId)
    });
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
    res.status(200).json({
      message: 'Item removed from cart',
      items: await loadCart(userId)
    });
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

// @route   PUT /api/cart/update-qty
// @desc    Update exact quantity for a cart item
router.put('/update-qty', async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId, productId, size, quantity } = req.body;

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 10) {
      return res.status(400).json({ message: 'Quantity must be a whole number from 1 to 10' });
    }

    let targetRows;
    if (cartItemId) {
      [targetRows] = await db.query(
        'SELECT c.id, p.stock_quantity FROM cart_items c JOIN products p ON p.id = c.product_id WHERE c.user_id = ? AND c.id = ?',
        [userId, cartItemId]
      );
    } else if (productId && size) {
      [targetRows] = await db.query(
        'SELECT c.id, p.stock_quantity FROM cart_items c JOIN products p ON p.id = c.product_id WHERE c.user_id = ? AND c.product_id = ? AND c.size = ?',
        [userId, productId, size]
      );
    } else {
      return res.status(400).json({ message: 'Cart item ID is required' });
    }
    if (!targetRows.length) return res.status(404).json({ message: 'Cart item not found' });
    if (parsedQuantity > Number(targetRows[0].stock_quantity || 0)) {
      return res.status(409).json({ message: 'Requested quantity is not available' });
    }

    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND id = ?',
      [parsedQuantity, userId, targetRows[0].id]
    );

    res.status(200).json({
      message: 'Quantity updated',
      quantity: parsedQuantity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating quantity' });
  }
});

module.exports = router;
