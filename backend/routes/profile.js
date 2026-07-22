const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/profile/addresses
// @desc    Get all saved addresses for logged in user
router.get('/addresses', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching addresses' });
  }
});

// @route   POST /api/profile/addresses
// @desc    Add a new address
router.post('/addresses', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, mobile, pincode, address_line, city, state, is_default } = req.body;

    if (is_default) {
      // Set all other addresses for this user to not default
      await db.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    await db.query(
      'INSERT INTO user_addresses (user_id, name, mobile, pincode, address_line, city, state, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, mobile, pincode, address_line, city, state, is_default ? true : false]
    );

    res.status(201).json({ message: 'Address added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error adding address' });
  }
});

// @route   DELETE /api/profile/addresses/:id
// @desc    Delete an address
router.delete('/addresses/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error deleting address' });
  }
});

module.exports = router;
