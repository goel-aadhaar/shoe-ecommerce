// Matches backend MongoDB documents exactly

export interface Product {
  _id: string;
  name: string;
  description: string;
  brand: string;
  price: number;
  stock: number;
  for: 'Male' | 'Female';
  color: string;
  colors: string[];
  sizes: string[];
  category: Category | string;
  rating: number;
  ratedBy: number;
  attributes: ProductAttribute[];
  thumbnail: string | null;
  images: string[];
  imageSet: ProductImage | string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProductAttribute = 'newArrival' | 'trending' | 'bestSeller' | 'onSale';

export interface ProductImage {
  _id: string;
  productId: string;
  thumbnail: string;
  hover: string;
  sides: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: 'shoes' | 'clogs';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  _id: string;
  userId: string;
  fullname?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  _id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemData {
  _id: string;
  cartId: string;
  productId: Product | string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  userId: string;
  totalAmount: number;
  currentStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  _id: string;
  orderId: string;
  productId: Product | string;
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  userId: User | string;
  productId: Product | string;
  rating: number;
  reviewText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Favourite {
  _id: string;
  userId: string;
  productId: Product | string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'success' | 'failed';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// API response types matching backend
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}
