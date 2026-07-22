const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/admin/settings
// @desc    Get all settings (Admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM settings');
    // Convert array of {setting_key, setting_value} to an object
    const settingsMap = {};
    rows.forEach(row => {
      settingsMap[row.setting_key] = row.setting_value;
    });
    res.json(settingsMap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update settings (Admin)
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const settings = req.body; // Expecting an object like { store_name: '...', contact_email: '...' }
    const allowedSettings = new Set(['store_name', 'contact_email', 'support_phone', 'currency', 'razorpay_key_id', 'razorpay_key_secret', 'convenience_fee', 'free_shipping_threshold']);
    if (Object.keys(settings).some(key => !allowedSettings.has(key))) return res.status(400).json({ message: 'One or more settings are not supported' });
    if (!['INR', 'USD'].includes(settings.currency)) return res.status(400).json({ message: 'Choose a supported store currency' });
    if (Number(settings.convenience_fee) < 0 || Number(settings.free_shipping_threshold) < 0) return res.status(400).json({ message: 'Shipping values cannot be negative' });
    
    for (const [key, value] of Object.entries(settings)) {
      await db.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, String(value), String(value)]
      );
    }
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

module.exports = router;
