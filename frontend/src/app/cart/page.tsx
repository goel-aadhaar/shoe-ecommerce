'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { CartItem } from '@/components/features/cart/cart-item';
import { CartSummary } from '@/components/features/cart/cart-summary';

export default function CartPage() {
  const { items, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brown-200 border-t-copper" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <ShoppingBag className="h-16 w-16 text-brown-300" />
        <h2 className="mt-4 font-serif text-2xl font-bold text-brown-800">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-brown-500">
          Looks like you haven&apos;t added any items yet.
        </p>
        <Link
          href="/collections/all"
          className="mt-6 rounded-md bg-copper px-6 py-2.5 text-sm font-semibold text-white hover:bg-sienna transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-brown-900">
        Shopping Cart
      </h1>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
        </div>
        <div className="lg:w-80">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
