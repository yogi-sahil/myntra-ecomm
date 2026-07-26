// Centralized API Base URL Configuration
// Local development uses Vite's same-origin proxy so HttpOnly cookies work safely.
const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');
