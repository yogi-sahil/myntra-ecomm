const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/categories
// @desc    Get all categories (Public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

// @route   POST /api/admin/categories
// @desc    Create a new category (Admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, slug, status } = req.body;
    if (!name || !slug || !['Active', 'Inactive'].includes(status)) return res.status(400).json({ message: 'Name, slug, and a valid status are required' });
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return res.status(400).json({ message: 'Use a valid lowercase URL slug' });
    
    // Check if exists
    const [existing] = await db.query('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Category slug already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO categories (name, slug, status) VALUES (?, ?, ?)',
      [name, slug, status]
    );
    
    res.status(201).json({ message: 'Category created successfully', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating category' });
  }
});

// @route   PUT /api/admin/categories/:id
// @desc    Update a category (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, slug, status } = req.body;
    if (!name || !slug || !['Active', 'Inactive'].includes(status)) return res.status(400).json({ message: 'Name, slug, and a valid status are required' });
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return res.status(400).json({ message: 'Use a valid lowercase URL slug' });
    
    // Check if slug exists for other categories
    const [existing] = await db.query('SELECT id FROM categories WHERE slug = ? AND id != ?', [slug, req.params.id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Category slug already exists for another category' });
    }

    const [result] = await db.query(
      'UPDATE categories SET name = ?, slug = ?, status = ? WHERE id = ?',
      [name, slug, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating category' });
  }
});

// @route   DELETE /api/admin/categories/:id
// @desc    Delete a category (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const [categories] = await db.query('SELECT name FROM categories WHERE id = ?', [req.params.id]);
    if (!categories.length) return res.status(404).json({ message: 'Category not found' });
    const [[{ productCount }]] = await db.query('SELECT COUNT(*) AS productCount FROM products WHERE category = ?', [categories[0].name]);
    if (Number(productCount) > 0) return res.status(409).json({ message: 'This category contains products. Reassign them before deleting it' });
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting category' });
  }
});

module.exports = router;
