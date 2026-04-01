import { apiGet, apiPost } from '@/lib/api';
import type { Order, OrderItem, PaginatedData } from '@/types';

interface CreateOrderPayload {
  items: {
    productId: string;
    quantity: number;
    price: number;
    selectedColor?: string;
    selectedSize?: string;
  }[];
  totalAmount: number;
}

export const orderService = {
  create: (data: CreateOrderPayload) =>
    apiPost<{ order: Order; items: OrderItem[] }>('/orders', data),

  getAll: (page = 1, limit = 10) =>
    apiGet<PaginatedData<Order>>('/orders', { page, limit }),
};
