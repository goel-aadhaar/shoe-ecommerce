// Utility functions for the application

import { IMAGE_CONFIG } from '@/constants';

/**
 * Optimizes Cloudinary images with proper dimensions and quality settings
 */
export const getOptimizedImage = (
  url: string, 
  width: number = IMAGE_CONFIG.OPTIMIZATION.DEFAULT_WIDTH, 
  height: number = IMAGE_CONFIG.OPTIMIZATION.DEFAULT_HEIGHT
): string => {
  if (!url.includes(IMAGE_CONFIG.CLOUDINARY_BASE)) return url;
  
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`
  );
};

/**
 * Formats price to currency format
 */
export const formatPrice = (price: number | string, currency: string = '$'): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `${currency}${numPrice.toFixed(2)}`;
};

/**
 * Truncates text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generates a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Debounces function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Checks if an element is in viewport
 */
export const isInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Gets initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Calculates discount percentage
 */
export const calculateDiscount = (originalPrice: number, salePrice: number): number => {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * Formats date to readable string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Gets stock status text
 */
export const getStockStatus = (inStock?: boolean, quantity?: number): string => {
  if (!inStock) return 'Out of Stock';
  if (quantity !== undefined && quantity <= 5) return `Only ${quantity} left`;
  return 'In Stock';
};

/**
 * Sorts products by specified criteria
 */
export const sortProducts = <T>(
  products: T[],
  sortBy: 'price-asc' | 'price-desc' | 'name' | 'rating',
  getValue: (item: T) => any
): T[] => {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => getValue(a) - getValue(b));
    case 'price-desc':
      return sorted.sort((a, b) => getValue(b) - getValue(a));
    case 'name':
      return sorted.sort((a, b) => getValue(a).localeCompare(getValue(b)));
    case 'rating':
      return sorted.sort((a, b) => getValue(b) - getValue(a));
    default:
      return sorted;
  }
};

/**
 * Local storage utilities
 */
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silent fail for localStorage errors
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Silent fail for localStorage errors
    }
  }
};
