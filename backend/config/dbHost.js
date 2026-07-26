const normalizeDbHost = (host) => {
  const normalized = String(host || '').trim();
  if (!normalized || normalized.toLowerCase() === 'localhost' || normalized === '::1') {
    return '127.0.0.1';
  }
  return normalized;
};

module.exports = { normalizeDbHost };
