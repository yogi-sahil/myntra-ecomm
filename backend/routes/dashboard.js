const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics (Admin)
router.get('/stats', async (req, res) => {
  try {
    // 1. Total Revenue (sum of total_amount from non-cancelled orders)
    const [[{ revenue }]] = await db.query("SELECT SUM(total_amount) as revenue FROM orders WHERE status != 'Cancelled'");
    
    // 2. Total Orders
    const [[{ totalOrders }]] = await db.query('SELECT COUNT(*) as totalOrders FROM orders');
    
    // 3. Total Products
    const [[{ totalProducts }]] = await db.query('SELECT COUNT(*) as totalProducts FROM products');
    
    // 4. Active Users
    const [[{ activeUsers }]] = await db.query("SELECT COUNT(*) as activeUsers FROM users WHERE role IN ('customer', 'user')");
    
    // 5. Recent Activity (latest 5 orders combined with latest users)
    const [recentOrders] = await db.query(`
      SELECT o.id, o.total_amount, o.created_at, u.name as customer_name, 'order' as type
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC LIMIT 5
    `);
    
    const [recentUsers] = await db.query(`
      SELECT id, name as customer_name, created_at, 'user' as type
      FROM users
      WHERE role IN ('customer', 'user')
      ORDER BY created_at DESC LIMIT 5
    `);
    
    // Combine and sort by created_at DESC, then take top 5
    const activity = [...recentOrders, ...recentUsers]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    // 6. Category breakdown for pie chart
    const [categoryBreakdown] = await db.query(`
      SELECT category, COUNT(*) as count 
      FROM products 
      WHERE category IS NOT NULL AND category != '' 
      GROUP BY category
    `);

    // 7. Low stock items (< 10 units if stock column exists)
    let lowStockProducts = [];
    try {
      const [lowStock] = await db.query(`SELECT id, title, brand, stock_quantity FROM products WHERE stock_quantity < 10 ORDER BY stock_quantity ASC LIMIT 5`);
      lowStockProducts = lowStock;
    } catch {
      // Column might not exist yet before migration runs
      lowStockProducts = [];
    }

    res.json({
      revenue: revenue || 0,
      totalOrders: totalOrders || 0,
      totalProducts: totalProducts || 0,
      activeUsers: activeUsers || 0,
      activity,
      categoryBreakdown,
      lowStockProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching dashboard stats' });
  }
});

// @route   GET /api/admin/dashboard/health
// @desc    Verify the API process and database connection (Admin)
router.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({
      api: 'operational',
      database: 'operational',
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(503).json({
      api: 'operational',
      database: 'unavailable',
      checkedAt: new Date().toISOString(),
      message: 'The database health check failed',
    });
  }
});

module.exports = router;
