import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { Product, PaginatedData, Review } from '@/types';

export const productService = {
  getAll: (page = 1, limit = 12) =>
    apiGet<PaginatedData<Product>>('/products', { page, limit }),

  getById: (id: string) =>
    apiGet<Product>(`/products/${id}`),

  getByAttribute: (attribute: string, limit = 10) =>
    apiGet<Product[]>('/products/filter/attribute', { attribute, limit }),

  getByBrand: (brand: string, limit = 10) =>
    apiGet<Product[]>('/products/filter/brand', { brand, limit }),

  getByGender: (gender: string, limit = 10) =>
    apiGet<Product[]>('/products/filter/gender', { gender, limit }),

  getByCategory: (category: string, limit = 10) =>
    apiGet<Product[]>('/products/filter/category', { category, limit }),

  getRelated: (gender: string, category: string, price: number) =>
    apiGet<Product[]>('/products/filter/related', { gender, category, price }),

  getSimilar: (shoeId: string) =>
    apiGet<Product[]>(`/products/recommend/${shoeId}`),

  getReviews: (productId: string) =>
    apiGet<{ avgRating: string; count: number; reviews: Review[] }>(
      `/products/${productId}/reviews`,
    ),

  create: (data: Partial<Product>) =>
    apiPost<Product>('/products', data),

  update: (id: string, data: Partial<Product>) =>
    apiPut<Product>(`/products/${id}`, data),

  delete: (id: string) =>
    apiDelete<null>(`/products/${id}`),

  addReview: (data: { productId: string; rating: number; reviewText?: string }) =>
    apiPost<Review>('/products/reviews', data),
};
