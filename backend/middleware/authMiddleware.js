const jwt = require('jsonwebtoken');

const readCookie = (req, name) => {
  const cookies = String(req.headers.cookie || '').split(';');
  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return null;
};

const protect = (req, res, next) => {
  const authorization = req.headers.authorization;
  const bearerToken = authorization?.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : null;
  const cookieToken = readCookie(req, 'myntra_session');
  const tokens = [bearerToken, cookieToken].filter(Boolean);

  if (tokens.length === 0) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  for (const token of tokens) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'myntra-api',
        audience: 'myntra-web',
      });
      return next();
    } catch {
      // Try the HttpOnly cookie when an obsolete bearer header is present.
    }
  }
  return res.status(401).json({ message: 'Session is invalid or expired' });
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
};

module.exports = { protect, adminOnly };
