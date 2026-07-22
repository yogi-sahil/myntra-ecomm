const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const validateProduct = ({ brand, title, price, original_price, discount, image_url, category }) => {
  if (!brand || !title || !category || !image_url) return 'Brand, title, category, and image URL are required';
  if (Number(price) <= 0 || Number(original_price) <= 0) return 'Prices must be greater than zero';
  if (Number(original_price) < Number(price)) return 'Original price cannot be lower than selling price';
  if (discount !== '' && discount !== null && discount !== undefined && (Number(discount) < 0 || Number(discount) > 100)) return 'Discount must be between 0 and 100';
  if (!image_url.startsWith('/uploads/')) {
    try { new URL(image_url); } catch { return 'Enter a valid image URL'; }
  }
  return null;
};

// @route   GET /api/products
// @desc    Get all products (with optional search, filter, and sort)
router.get('/', async (req, res) => {
  try {
    const { search, category, brand, sort } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const queryParams = [];

    if (search) {
      query += ' AND (title LIKE ? OR brand LIKE ? OR category LIKE ? OR sku LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      const categories = category.split(',').map(c => c.trim());
      if (categories.length > 0) {
        query += ` AND category IN (${categories.map(() => '?').join(',')})`;
        queryParams.push(...categories);
      }
    }

    if (brand) {
      const brands = brand.split(',').map(b => b.trim());
      if (brands.length > 0) {
        query += ` AND brand IN (${brands.map(() => '?').join(',')})`;
        queryParams.push(...brands);
      }
    }

    if (sort === 'price_asc') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY price DESC';
    } else {
      query += ' ORDER BY id DESC'; // default sort
    }

    const [rows] = await db.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching product' });
  }
});

// @route   POST /api/admin/products
// @desc    Add a new product (Admin)
router.post('/', protect, adminOnly, async (req, res) => {
  const { brand, title, price, original_price, discount, image_url, description, category, stock_quantity = 50, sku, available_sizes = 'S,M,L,XL' } = req.body;
  try {
    const validationError = validateProduct(req.body);
    if (validationError) return res.status(400).json({ message: validationError });
    
    const finalSku = sku ? sku.trim() : `SKU-${Date.now().toString().slice(-6)}`;
    const [result] = await db.query(
      'INSERT INTO products (brand, title, price, original_price, discount, image_url, description, category, stock_quantity, sku, available_sizes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [brand, title, price, original_price, discount, image_url, description, category, Number(stock_quantity), finalSku, available_sizes]
    );
    res.status(201).json({ message: 'Product added successfully', productId: result.insertId, sku: finalSku });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error adding product' });
  }
});

// @route   POST /api/admin/products/bulk-delete
// @desc    Bulk delete products (Admin)
router.post('/bulk-delete', protect, adminOnly, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'Select products to delete' });

    // Check which products are used in orders
    const [ordered] = await db.query('SELECT DISTINCT product_id FROM order_items WHERE product_id IN (?)', [ids]);
    const orderedIds = new Set(ordered.map((item) => item.product_id));
    const deletableIds = ids.filter((id) => !orderedIds.has(Number(id)));

    if (deletableIds.length === 0) {
      return res.status(409).json({ message: 'Selected products exist in customer orders and cannot be deleted' });
    }

    await db.query('DELETE FROM products WHERE id IN (?)', [deletableIds]);
    res.json({ message: `Successfully deleted ${deletableIds.length} product(s)`, deletedIds: deletableIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error carrying out bulk product deletion' });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update a product (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { brand, title, price, original_price, discount, image_url, description, category, stock_quantity = 50, sku, available_sizes = 'S,M,L,XL' } = req.body;
  try {
    const validationError = validateProduct(req.body);
    if (validationError) return res.status(400).json({ message: validationError });
    const [result] = await db.query(
      'UPDATE products SET brand = ?, title = ?, price = ?, original_price = ?, discount = ?, image_url = ?, description = ?, category = ?, stock_quantity = ?, sku = ?, available_sizes = ? WHERE id = ?',
      [brand, title, price, original_price, discount, image_url, description, category, Number(stock_quantity), sku, available_sizes, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating product' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const [[{ orderItemCount }]] = await db.query('SELECT COUNT(*) AS orderItemCount FROM order_items WHERE product_id = ?', [req.params.id]);
    if (Number(orderItemCount) > 0) return res.status(409).json({ message: 'This product appears in order history and cannot be deleted' });
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error deleting product' });
  }
});

module.exports = router;
