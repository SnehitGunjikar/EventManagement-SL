// API configuration for Vercel deployment
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    PROFILES: `${API_BASE_URL}/api/profiles`,
    EVENTS: `${API_BASE_URL}/api/events`
  }
};