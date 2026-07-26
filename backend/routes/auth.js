const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^\+?[0-9]{10,15}$/;

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const validateRegistration = ({ name, email, mobile, password }) => {
  if (String(name || '').trim().length < 2 || String(name).trim().length > 100) {
    return 'Name must contain 2 to 100 characters';
  }
  if (!EMAIL_PATTERN.test(normalizeEmail(email))) return 'Enter a valid email address';
  if (!MOBILE_PATTERN.test(String(mobile || '').trim())) return 'Enter a valid mobile number';
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return 'Password must contain 8 to 128 characters';
  }
  return null;
};

const signToken = (user, expiresIn) => jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  {
    algorithm: 'HS256',
    expiresIn,
    issuer: 'myntra-api',
    audience: 'myntra-web',
  }
);

const setSessionCookie = (res, token, maxAgeSeconds) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `myntra_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`
  );
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role === 'user' ? 'customer' : user.role,
});

router.post('/register', async (req, res) => {
  const validationError = validateRegistration(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  const name = req.body.name.trim();
  const email = normalizeEmail(req.body.email);
  const mobile = req.body.mobile.trim();
  try {
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ? OR mobile = ?',
      [email, mobile]
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'An account with this email or mobile already exists' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const [result] = await db.query(
      'INSERT INTO users (name, email, mobile, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, mobile, hashedPassword, 'user']
    );

    const user = { id: result.insertId, name, email, mobile, role: 'user' };
    setSessionCookie(res, signToken(user, '7d'), 7 * 24 * 60 * 60);
    return res.status(201).json({ message: 'Account created successfully', user: publicUser(user) });
  } catch (error) {
    console.error('Registration failed:', error.message);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

const loginForRole = (requiredRole, expiresIn, maxAgeSeconds) => async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;
  if (!EMAIL_PATTERN.test(email) || typeof password !== 'string' || password.length > 128) {
    return res.status(400).json({ message: 'Enter valid credentials' });
  }

  try {
    const roleQuery = requiredRole === 'admin'
      ? 'role = ?'
      : "role IN ('user', 'customer')";
    const params = requiredRole === 'admin' ? [email, 'admin'] : [email];
    const [users] = await db.query(`SELECT * FROM users WHERE email = ? AND ${roleQuery}`, params);
    const user = users[0];
    const isMatch = user ? await bcrypt.compare(password, user.password || '') : false;
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    setSessionCookie(res, signToken(user, expiresIn), maxAgeSeconds);
    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ message: 'Login failed' });
  }
};

router.post('/login', loginForRole('customer', '7d', 7 * 24 * 60 * 60));
router.post('/admin-login', loginForRole('admin', '1d', 24 * 60 * 60));

router.get('/me', protect, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, mobile, role FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!users.length) return res.status(401).json({ message: 'Account no longer exists' });
    return res.json({ user: publicUser(users[0]) });
  } catch (error) {
    console.error('Session lookup failed:', error.message);
    return res.status(500).json({ message: 'Could not validate session' });
  }
});

router.post('/logout', (_req, res) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `myntra_session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`
  );
  return res.json({ message: 'Logged out' });
});

module.exports = router;
