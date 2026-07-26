const path = require('path');
const fs = require('fs');
const os = require('os');

// Smart env loading — survives Hostinger redeployments that delete local .env
const localEnv = path.join(__dirname, '.env');
const homeEnv = path.join(os.homedir(), 'backend.env');
if (fs.existsSync(localEnv)) {
  require('dotenv').config({ path: localEnv });
} else if (fs.existsSync(homeEnv)) {
  require('dotenv').config({ path: homeEnv });
} else {
  require('dotenv').config(); // fallback to default
}

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { validateEnvironment } = require('./config/env');
const { isOriginAllowed, parseAllowedOrigins } = require('./config/cors');
const { createRateLimit } = require('./middleware/rateLimit');
const { authAttemptsOnly } = require('./middleware/authAttemptLimiter');

validateEnvironment();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGINS);
if (allowedOrigins.size > 0 || process.env.NODE_ENV !== 'production') {
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      if (isOriginAllowed(origin, {
        nodeEnv: process.env.NODE_ENV,
        allowedOrigins,
      })) {
        return callback(null, true);
      }
      return callback(new Error('Origin is not allowed'));
    },
  }));
}

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

const standardJsonParser = express.json({ limit: '1mb' });
app.use((req, res, next) => {
  if (req.path === '/api/admin/upload') return next();
  return standardJsonParser(req, res, next);
});

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
const authLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please try again later.',
});
const paymentLimiter = createRateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: 'Too many checkout requests. Please try again shortly.',
});

// Use Routes (Public / Customer)
app.use('/api/auth', authAttemptsOnly(authLimiter), authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentLimiter, paymentRoutes);
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


// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploads statically
app.use('/uploads', express.static(uploadsDir));

// Base64 Image Upload Endpoint
app.post('/api/admin/upload', protect, adminOnly, express.json({ limit: '7mb' }), (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    const matches = imageBase64.match(/^data:image\/(png|jpe?g|webp|gif);base64,([A-Za-z0-9+/=]+)$/);
    if (!matches) {
      return res.status(400).json({ message: 'Invalid base64 image string' });
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    if (buffer.length === 0 || buffer.length > 5 * 1024 * 1024) {
      return res.status(413).json({ message: 'Image must be smaller than 5 MB' });
    }

    const uniqueName = `img_${crypto.randomUUID()}.${ext}`;
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
  res.json({ status: 'ok', message: 'Myntra API is running smoothly!' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.use((error, _req, res, _next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({ message: 'Request body contains invalid JSON' });
  }
  if (error.message === 'Origin is not allowed') {
    return res.status(403).json({ message: 'Origin is not allowed' });
  }
  console.error('Unhandled request error:', error.message);
  return res.status(500).json({ message: 'Internal server error' });
});

// Process error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
