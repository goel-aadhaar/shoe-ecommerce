'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { cartService } from '@/services/cart.service';
import { useAuth } from '@/hooks/use-auth';
import type { CartItemData, Product } from '@/types';

interface CartContextValue {
  items: CartItemData[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  addItem: (
    productId: string,
    quantity?: number,
    selectedColor?: string,
    selectedSize?: string,
  ) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItemData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await cartService.getCart();
      setItems(res.data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (
      productId: string,
      quantity = 1,
      selectedColor?: string,
      selectedSize?: string,
    ) => {
      await cartService.addToCart({ productId, quantity, selectedColor, selectedSize });
      await fetchCart();
    },
    [fetchCart],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      await cartService.removeFromCart(itemId);
      await fetchCart();
    },
    [fetchCart],
  );

  const clearCartFn = useCallback(async () => {
    await cartService.clearCart();
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => {
    const product = i.productId as Product;
    return sum + (product?.price ?? 0) * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        isLoading,
        addItem,
        removeItem,
        clearCart: clearCartFn,
        refresh: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
