import { apiGet, apiPost, apiDelete } from '@/lib/api';
import type { Cart, CartItemData } from '@/types';

export const cartService = {
  getCart: () =>
    apiGet<{ cart: Cart; items: CartItemData[] }>('/cart'),

  addToCart: (data: {
    productId: string;
    quantity?: number;
    selectedColor?: string;
    selectedSize?: string;
  }) => apiPost<CartItemData>('/cart', data),

  removeFromCart: (itemId: string) =>
    apiDelete<null>(`/cart/${itemId}`),

  clearCart: () =>
    apiDelete<{ cartId: string }>('/cart/userCart/clear'),
};
