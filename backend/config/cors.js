const parseAllowedOrigins = (value) => new Set(
  String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const isDevelopmentLoopbackOrigin = (origin) => {
  try {
    const parsed = new URL(origin);
    const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    const isLoopbackHost = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
    return isHttp && isLoopbackHost;
  } catch {
    return false;
  }
};

const isOriginAllowed = (origin, { nodeEnv, allowedOrigins }) => {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  return nodeEnv !== 'production' && isDevelopmentLoopbackOrigin(origin);
};

module.exports = {
  isDevelopmentLoopbackOrigin,
  isOriginAllowed,
  parseAllowedOrigins,
};
