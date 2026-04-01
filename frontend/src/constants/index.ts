// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'ShoeCommerce',
  DESCRIPTION: 'Premium shoe e-commerce platform',
  VERSION: '1.0.0',
} as const;

// Image Configuration
export const IMAGE_CONFIG = {
  DEFAULT_PLACEHOLDER: 'https://www.superkicks.in/cdn/shop/files/1_23_63d4bcad-2f4f-4dff-8606-1b9687a04aa5.png?v=1754314154',
  OPTIMIZATION: {
    DEFAULT_WIDTH: 268 * 2,
    DEFAULT_HEIGHT: 268 * 2,
    QUALITY: 'auto',
    FORMAT: 'auto',
  },
  CLOUDINARY_BASE: 'res.cloudinary.com',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
} as const;

// Cart Configuration
export const CART_CONFIG = {
  MAX_QUANTITY: 10,
  MIN_QUANTITY: 1,
  SESSION_KEY: 'shoe_cart',
} as const;

// User Session
export const SESSION_CONFIG = {
  TOKEN_KEY: 'shoe_token',
  USER_KEY: 'shoe_user',
  EXPIRY_DAYS: 7,
} as const;

// Available Shoe Sizes
export const SHOE_SIZES = ['6', '7', '8', '9', '10', '11', '12'] as const;

// Available Categories
export const CATEGORIES = [
  'Running',
  'Basketball',
  'Casual',
  'Formal',
  'Training',
  'Skateboarding',
] as const;

// Available Brands
export const BRANDS = [
  'Nike',
  'Adidas',
  'Puma',
  'Jordan',
  'New Balance',
  'Reebok',
  'Converse',
  'Vans',
] as const;

// Price Ranges
export const PRICE_RANGES = [
  { min: 0, max: 50, label: 'Under $50' },
  { min: 50, max: 100, label: '$50 - $100' },
  { min: 100, max: 150, label: '$100 - $150' },
  { min: 150, max: 200, label: '$150 - $200' },
  { min: 200, max: 1000, label: 'Over $200' },
] as const;

// Color Options
export const COLORS = [
  'Black',
  'White',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Orange',
  'Purple',
  'Pink',
  'Gray',
  'Brown',
  'Navy',
] as const;

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/shoecommerce',
  INSTAGRAM: 'https://instagram.com/shoecommerce',
  TWITTER: 'https://twitter.com/shoecommerce',
  YOUTUBE: 'https://youtube.com/shoecommerce',
} as const;

// Contact Information
export const CONTACT_INFO = {
  EMAIL: 'support@shoecommerce.com',
  PHONE: '+1-800-SHOES',
  ADDRESS: '123 Commerce St, Shop City, SC 12345',
} as const;
