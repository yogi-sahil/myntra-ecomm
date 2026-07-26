import { API_BASE_URL } from '../config';
export const API_BASE = API_BASE_URL;

export const getAuthHeaders = (_token, includeJson = false) => ({
  ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
});

export const getApiError = async (response, fallback = 'Something went wrong. Please try again.') => {
  try {
    const contentType = response?.headers?.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const payload = await response.json();
      return payload.message || fallback;
    }
    return fallback;
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
