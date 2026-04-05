'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, X, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { DEFAULT_PLACEHOLDER } from '@/constants';
import type { Product, ProductImage } from '@/types';

export function CartDrawer() {
  const { items, itemCount, total, removeItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center text-brown-200 hover:text-copper transition-colors py-2"
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-copper text-[10px] font-bold text-white">
            {itemCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Drawer Content */}
          <div className="relative z-[110] flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform">
            <div className="flex items-center justify-between border-b border-brown-200 px-6 py-5 bg-white">
              <h2 className="font-serif text-xl font-bold text-brown-900">Your Cart ({itemCount})</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-brown-500 hover:bg-brown-50 hover:text-brown-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-brown-500">
                  <ShoppingBag className="mb-4 h-12 w-12 text-brown-200" />
                  <p className="text-lg font-medium text-brown-900">Your cart is empty</p>
                  <p className="mt-2 text-sm">Looks like you haven&apos;t added anything yet.</p>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="btn-outline mt-8"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-6">
                  {items.map((item) => {
                    const product = item.productId as Product;
                    const imageSet = product?.imageSet as ProductImage | null;
                    const thumbnail = product?.thumbnail ?? imageSet?.thumbnail ?? DEFAULT_PLACEHOLDER;

                    return (
                      <li key={item._id} className="flex gap-4 border-b border-brown-100 pb-6 last:border-0 last:pb-0">
                        <Link
                          href={`/shoe/${product?._id}`}
                          onClick={() => setIsOpen(false)}
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-brown-50 border border-brown-100"
                        >
                          <Image
                            src={thumbnail}
                            alt={product?.name ?? 'Product'}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </Link>

                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between">
                            <div>
                               <p className="text-[10px] uppercase tracking-wider text-brown-500">
                                {product?.brand}
                              </p>
                              <Link
                                href={`/shoe/${product?._id}`}
                                onClick={() => setIsOpen(false)}
                                className="font-serif text-sm font-semibold text-brown-900 hover:text-copper line-clamp-1"
                              >
                                {product?.name}
                              </Link>
                            </div>
                            <span className="font-bold text-brown-800 ml-4">
                              &#8377;{((product?.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                          
                          <div className="mt-1 flex gap-2 text-xs text-brown-500">
                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            {item.selectedSize && item.selectedColor && <span>|</span>}
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="text-sm text-brown-600 font-medium">
                              Qty: {item.quantity}
                            </div>
                            <button
                              onClick={() => removeItem(item._id)}
                              className="text-brown-400 transition-colors hover:text-red-500 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-brown-200 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="mb-4 flex items-center justify-between text-lg font-bold text-brown-900">
                  <span>Subtotal</span>
                  <span>&#8377;{total.toLocaleString('en-IN')}</span>
                </div>
                <p className="mb-6 text-sm text-brown-500">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="btn-outline w-full"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout/new" // Redirects properly or opens checkout flow
                    onClick={() => setIsOpen(false)}
                    className="btn-primary w-full"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
