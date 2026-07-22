const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes in users.js are admin-only
router.use(protect, adminOnly);

// @route   GET /api/admin/users
// @desc    Get all users (Admin)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email, mobile, CASE WHEN role = 'user' THEN 'customer' ELSE role END AS role, created_at FROM users ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching users' });
  }
});

// @route   POST /api/admin/users
// @desc    Create a customer or admin account (Admin)
router.post('/', async (req, res) => {
  try {
    const { name, email, mobile, password, role = 'customer' } = req.body;
    if (!name || !email || !mobile || !password) return res.status(400).json({ message: 'Name, email, mobile, and password are required' });
    if (!['customer', 'admin'].includes(role)) return res.status(400).json({ message: 'Choose a valid account role' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? OR mobile = ?', [email.trim().toLowerCase(), mobile.trim()]);
    if (existing.length) return res.status(400).json({ message: 'A user with this email or mobile already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const databaseRole = role === 'customer' ? 'user' : role;
    const [result] = await db.query('INSERT INTO users (name, email, mobile, password, role) VALUES (?, ?, ?, ?, ?)', [name.trim(), email.trim().toLowerCase(), mobile.trim(), hashedPassword, databaseRole]);
    res.status(201).json({ id: result.insertId, name: name.trim(), email: email.trim().toLowerCase(), mobile: mobile.trim(), role, created_at: new Date().toISOString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error creating user' });
  }
});

// @route   POST /api/admin/users/bulk-delete
// @desc    Bulk delete users (Admin)
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'Select users to delete' });
    
    // Do not allow deleting own account
    const filteredIds = ids.filter((id) => Number(id) !== Number(req.user?.id));
    if (filteredIds.length === 0) return res.status(400).json({ message: 'Cannot delete your own account' });

    // Check orders history
    const [orders] = await db.query('SELECT DISTINCT user_id FROM orders WHERE user_id IN (?)', [filteredIds]);
    const userIdsWithOrders = new Set(orders.map((o) => o.user_id));
    const deletableIds = filteredIds.filter((id) => !userIdsWithOrders.has(Number(id)));

    if (deletableIds.length === 0) {
      return res.status(409).json({ message: 'Selected users have order history and cannot be deleted' });
    }

    await db.query('DELETE FROM users WHERE id IN (?)', [deletableIds]);
    res.json({ message: `Successfully deleted ${deletableIds.length} user(s)`, deletedIds: deletableIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error performing bulk deletion' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role (Admin)
router.put('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['customer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Valid role is required' });
    }
    
    if (req.user && Number(req.params.id) === Number(req.user.id) && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin access' });
    }
    const databaseRole = role === 'customer' ? 'user' : role;
    const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [databaseRole, req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating user role' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (Admin)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user && Number(req.params.id) === Number(req.user.id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const [[{ orderCount }]] = await db.query('SELECT COUNT(*) AS orderCount FROM orders WHERE user_id = ?', [req.params.id]);
    if (Number(orderCount) > 0) return res.status(409).json({ message: 'This user has order history and cannot be deleted' });
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error deleting user' });
  }
});

module.exports = router;
