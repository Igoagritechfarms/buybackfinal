/**
 * Application Constants
 * Centralized configuration for hardcoded values
 */

// Contact Information
export const CONTACT = {
  WHATSAPP_NUMBER: '919999999999',
  EMAIL: 'support@igofarmgate.com',
  PHONE: '+91-9999-999-999',
  ADDRESS: 'IGO Agritech, Chennai, Tamil Nadu',
};

// WhatsApp Links
export const WHATSAPP_LINKS = {
  SUBSCRIBE_ALERTS: `https://wa.me/${CONTACT.WHATSAPP_NUMBER}?text=Subscribe%20to%20price%20alerts`,
  SUPPORT: `https://wa.me/${CONTACT.WHATSAPP_NUMBER}?text=Hi,%20I%20need%20help`,
  SALES: `https://wa.me/${CONTACT.WHATSAPP_NUMBER}?text=I%20want%20to%20join%20as%20seller`,
};

// Social Media
export const SOCIAL_MEDIA = {
  FACEBOOK: 'https://facebook.com/igofarmgate',
  INSTAGRAM: 'https://instagram.com/igofarmgate',
  TWITTER: 'https://twitter.com/igofarmgate',
  LINKEDIN: 'https://linkedin.com/company/igofarmgate',
};

// Platform Statistics
export const STATS = {
  TRUSTED_FARMERS: 1200,
  PAID_OUT: '₹4.5Cr',
  TRANSPARENCY: '100%',
  PAYMENT_DAYS: 7,
};

// Validation Rules
export const VALIDATION = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_LOCATION_LENGTH: 3,
  MAX_LOCATION_LENGTH: 100,
  MIN_MESSAGE_LENGTH: 10,
  MAX_MESSAGE_LENGTH: 1000,
  PHONE_PATTERN: /^[6-9]\d{9}$/,
  OTP_LENGTH: 6,
};

// API Timeouts (in milliseconds)
export const TIMEOUTS = {
  API_CALL: 10000,
  OTP_SEND: 5000,
  FORM_SUBMIT: 10000,
};

// Feature Flags
export const FEATURES = {
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_LOGGING: true,
  ENABLE_RATE_LIMITING: true,
};

// Market Update Interval (in milliseconds)
export const UPDATE_INTERVALS = {
  MARKET_TICKER: 30000, // 30 seconds
  MARKET_GRAPH: 60000, // 60 seconds
  STATS_COUNTER: 2000, // 2 seconds
};
