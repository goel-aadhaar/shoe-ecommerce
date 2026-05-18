'use client';

import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { CartItem } from '@/components/features/cart/cart-item';
import { CartSummary } from '@/components/features/cart/cart-summary';

export default function CartPage() {
  const { items, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
        <div className="h-12 w-12 animate-spin border-2 border-ink/15 border-t-cobalt" />
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink/40">
          Loading Cart
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <ShoppingBag className="h-14 w-14 text-ink/20" strokeWidth={1.5} />
        <h2 className="mt-6 font-serif text-5xl uppercase leading-[0.85] text-ink">
          Empty
          <br />
          <span className="text-cobalt">Cart</span>
        </h2>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-ink/40">
          You haven&apos;t added anything yet
        </p>
        <Link href="/collections/all" className="btn-primary mt-8">
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-inner py-12 lg:py-16">
      <div className="border-b border-ink/15 pb-7">
        <p className="section-tag text-ink/60">Checkout</p>
        <h1 className="mt-4 font-serif text-[clamp(2.5rem,7vw,6rem)] leading-[0.85] text-ink">
          Shopping Cart
        </h1>
      </div>
      <div className="mt-10 flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
        </div>
        <div className="lg:w-96">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
