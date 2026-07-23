require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const profileRoutes = require('./routes/profile');
const couponsRoutes = require('./routes/coupons');
const dashboardRoutes = require('./routes/dashboard');
const categoriesRoutes = require('./routes/categories');
const settingsRoutes = require('./routes/settings');

// Middleware
const { protect, adminOnly } = require('./middleware/authMiddleware');

// Use Routes (Public / Customer)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/cart', protect, cartRoutes);
app.use('/api/wishlist', protect, wishlistRoutes);
app.use('/api/profile', protect, profileRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/categories', categoriesRoutes);

// Use Routes (Admin Protected)
app.use('/api/admin/products', protect, adminOnly, productRoutes);
app.use('/api/admin/orders', protect, adminOnly, orderRoutes);
app.use('/api/admin/users', protect, adminOnly, userRoutes);
app.use('/api/admin/dashboard', protect, adminOnly, dashboardRoutes);
app.use('/api/admin/categories', protect, adminOnly, categoriesRoutes);
app.use('/api/admin/settings', protect, adminOnly, settingsRoutes);

const path = require('path');
const fs = require('fs');

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploads statically
app.use('/uploads', express.static(uploadsDir));

// Base64 Image Upload Endpoint
app.post('/api/admin/upload', protect, adminOnly, express.json({ limit: '10mb' }), (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    const matches = imageBase64.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ message: 'Invalid base64 image string' });
    }

    const ext = matches[1] || 'png';
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    const uniqueName = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${uniqueName}`;
    res.json({ imageUrl, message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Myntra Clone API is running smoothly!' });
});

// Process error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

