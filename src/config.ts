/**
 * Application Configuration
 * Centralized configuration for URLs, API endpoints, and app constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// Applications URLs
export const APP_URLS = {
  ORDER_MANAGEMENT: import.meta.env.VITE_ORDER_MANAGEMENT_URL || 'http://localhost:8080',
  PRODUCTION_DASHBOARD: import.meta.env.VITE_PRODUCTION_DASHBOARD_URL || 'http://localhost:8082',
};

// UI Constants
export const UI_CONFIG = {
  SIDEBAR_WIDTH: '16rem',
  SIDEBAR_WIDTH_MOBILE: '18rem',
  SIDEBAR_WIDTH_ICON: '3rem',
  SIDEBAR_KEYBOARD_SHORTCUT: 'b',
  SIDEBAR_COOKIE_NAME: 'sidebar:state',
  SIDEBAR_COOKIE_MAX_AGE: 60 * 60 * 24 * 7, // 7 days
};

// Production Routing Constants
export const PRODUCTION_ROUTING = {
  DEFAULT_WORKSTATION: 'preparacao',
  DEFAULT_OPERATION: 'Escolha da Madeira',
};

// API Health Check
export const HEALTH_CHECK = {
  ENABLED: true,
  INTERVAL: 30000, // 30 seconds
};
