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

// AI / semantic search
export interface SearchFilters {
  category?: string;
  brand?: string;
  colour?: string;
  gender?: 'Male' | 'Female';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

// A product enriched by the AI service with its semantic relevance score and
// a human-readable "why this matched" note.
export type SearchProduct = Product & {
  _score?: number;
  _reason?: string | null;
};

export interface SemanticSearchResponse {
  query: string;
  count: number;
  results: SearchProduct[];
}

export interface HomeSectionBlock {
  section: string;
  title: string;
  items: SearchProduct[];
}

export interface PersonalizedHome {
  sections: HomeSectionBlock[];
}

export interface BundlesData {
  productId: string;
  complements: SearchProduct[];
}

export type BehaviourEventType =
  | 'view'
  | 'click'
  | 'add_to_cart'
  | 'purchase'
  | 'search';

export interface BehaviourEvent {
  type: BehaviourEventType;
  productId?: string;
  query?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

// Conversational copilot
export interface ChatTurnResponse {
  reply: string;
  products: SearchProduct[];
  why: string[];
  followUp: string | null;
  sessionId: string;
}

export interface ExtractedFiltersResponse {
  category?: string;
  brand?: string;
  colour?: string;
  gender?: 'Male' | 'Female';
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  keywords: string[];
}

export interface AskCitation {
  source: string;
  title: string | null;
  productId: string | null;
}

export interface AskResponse {
  answer: string;
  citations: AskCitation[];
  grounded: boolean;
}

export interface ComparisonFacet {
  productId: string;
  pros: string[];
  cons: string[];
  comfort?: string;
  durability?: string;
  valueForMoney?: string;
  bestFor?: string;
}

export interface ComparisonResponse {
  products: SearchProduct[];
  facets: ComparisonFacet[];
  recommendation: string;
}

export interface ReviewSummary {
  productId: string;
  lovedFeatures: string[];
  commonComplaints: string[];
  overallSentiment: string;
  shouldYouBuy: string;
  reviewsAnalyzed: number;
}

// Analytics dashboard
export interface AnalyticsSummary {
  windowDays: number;
  generatedAt: string;
  modelVersion: string | null;
  engagement: {
    events: number;
    uniqueUsers: number;
    uniqueSessions: number;
  };
  rates: {
    ctr: number;
    cartRate: number;
    conversionRate: number;
  };
  funnel: Array<{ stage: string; count: number }>;
  topProducts: Array<{
    productId: string;
    name: string | null;
    brand: string | null;
    thumbnail: string | null;
    price: number | null;
    score: number;
    views: number;
    carts: number;
    purchases: number;
  }>;
  topSearches: Array<{ query: string; count: number }>;
  daily: Array<{ day: string; total: number; counts: Record<string, number> }>;
  copilot: { sessions: number; messages: number };
}
