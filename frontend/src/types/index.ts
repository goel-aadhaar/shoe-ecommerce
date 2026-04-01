// Core product and e-commerce types

export interface Shoe {
  id: string;
  name: string;
  brand: string;
  color: string;
  price: number;
  description?: string;
  category?: string;
  imageSet: {
    thumbnail: string;
    hover: string;
    gallery?: string[];
  };
  sizes?: ShoeSize[];
  inStock?: boolean;
  rating?: number;
  reviews?: number;
}

export interface ShoeSize {
  size: string;
  available: boolean;
}

export interface CartItem extends Shoe {
  quantity: number;
  selectedSize: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'cod';
  lastFour?: string;
  cardBrand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

// UI Component Types
export interface ImageSlide {
  image: string;
  title: string;
  linkText: string;
  linkUrl?: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description?: string;
  featured?: boolean;
}

export interface FilterOptions {
  brands: string[];
  sizes: string[];
  priceRange: {
    min: number;
    max: number;
  };
  categories: string[];
  colors: string[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CheckoutForm {
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  items: CartItem[];
}
