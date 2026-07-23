// Centralized API Base URL Configuration
// Resolves to VITE_API_URL from .env.production (https://myntraindia.co/api) or falls back to relative /api
const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');
