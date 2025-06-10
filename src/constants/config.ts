/**
 * Ottr App Configuration
 * 
 * This file contains application-wide configuration constants.
 */

// App information
export const APP_INFO = {
  NAME: 'Ottr',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.ottr.app',
  TAGLINE: 'One person, one conversation, unlimited connection.',
};

// API endpoints and configuration
export const API_CONFIG = {
  SUPABASE_URL: 'https://zicrbmtnlppmdvwrjfur.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppY3JibXRubHBwbWR2d3JqZnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjgzMTMsImV4cCI6MjA2NTE0NDMxM30.6nVSFV6-ZwfMr48i-xy-uULcTq8N4IuUTqKj0xikT70',
};

// OAuth configuration
export const OAUTH_CONFIG = {
  GOOGLE_WEB_CLIENT_ID: '908945384430-j1sgctl5ftpv6a7ngr2u6hih3ovgqc72.apps.googleusercontent.com',
  GOOGLE_ANDROID_CLIENT_ID: '908945384430-5vlsc7j8oi9ojncd3oeqn1j0f1h7193q.apps.googleusercontent.com',
};

// Connection states
export const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  PENDING: 'pending',
  CONNECTED: 'connected',
};

// Request states
export const REQUEST_STATES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

// Validation rules
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^@[a-zA-Z0-9_]+$/,
  },
  DISPLAY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  MESSAGE: {
    MAX_LENGTH: 1000,
  },
};

// Pagination limits
export const PAGINATION = {
  MESSAGES: 20,
  SEARCH_RESULTS: 10,
};

// Timeouts
export const TIMEOUTS = {
  TYPING_INDICATOR: 3000, // 3 seconds
  CONNECTION_REQUEST_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  DEBOUNCE: {
    SEARCH: 300, // 300ms
    INPUT: 100, // 100ms
  },
};

export default {
  APP_INFO,
  API_CONFIG,
  OAUTH_CONFIG,
  CONNECTION_STATES,
  REQUEST_STATES,
  VALIDATION,
  PAGINATION,
  TIMEOUTS,
};
