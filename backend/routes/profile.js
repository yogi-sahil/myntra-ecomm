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
    const address = {
      name: String(name || '').trim(),
      mobile: String(mobile || '').replace(/\D/g, ''),
      pincode: String(pincode || '').replace(/\D/g, ''),
      address_line: String(address_line || '').trim(),
      city: String(city || '').trim(),
      state: String(state || '').trim()
    };

    if (
      address.name.length < 2 ||
      address.address_line.length < 5 ||
      address.city.length < 2 ||
      address.state.length < 2
    ) {
      return res.status(400).json({ message: 'Please enter a complete delivery address' });
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      return res.status(400).json({ message: 'Pincode must be exactly 6 digits' });
    }
    if (!/^\d{10,15}$/.test(address.mobile)) {
      return res.status(400).json({ message: 'Mobile number must contain 10 to 15 digits' });
    }

    if (is_default) {
      // Set all other addresses for this user to not default
      await db.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    const [result] = await db.query(
      'INSERT INTO user_addresses (user_id, name, mobile, pincode, address_line, city, state, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        address.name,
        address.mobile,
        address.pincode,
        address.address_line,
        address.city,
        address.state,
        is_default ? true : false
      ]
    );

    res.status(201).json({
      message: 'Address added successfully',
      address: {
        id: result.insertId,
        ...address,
        is_default: Boolean(is_default)
      }
    });
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
