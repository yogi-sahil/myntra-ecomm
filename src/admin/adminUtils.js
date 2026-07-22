export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8999/api').replace(/\/$/, '');

export const getAuthHeaders = (token, includeJson = false) => ({
  ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
  Authorization: `Bearer ${token || localStorage.getItem('token') || ''}`,
});

export const getApiError = async (response, fallback = 'Something went wrong. Please try again.') => {
  try {
    const payload = await response.json();
    return payload.message || fallback;
  } catch {
    return fallback;
  }
};

export const formatCurrency = (value, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatDate = (value, options = {}) => {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(value));
};

export const paginate = (items, currentPage, pageSize) =>
  items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

