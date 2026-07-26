const AUTH_ATTEMPT_PATHS = new Set(['/register', '/login', '/admin-login']);

const shouldLimitAuthAttempt = (method, requestPath) => {
  const normalizedPath = String(requestPath || '').replace(/\/+$/, '') || '/';
  return String(method || '').toUpperCase() === 'POST'
    && AUTH_ATTEMPT_PATHS.has(normalizedPath);
};

const authAttemptsOnly = (limiter) => (req, res, next) => {
  if (!shouldLimitAuthAttempt(req.method, req.path)) return next();
  return limiter(req, res, next);
};

module.exports = { authAttemptsOnly, shouldLimitAuthAttempt };
