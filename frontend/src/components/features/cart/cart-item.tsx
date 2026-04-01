'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { DEFAULT_PLACEHOLDER } from '@/constants';
import type { CartItemData, Product, ProductImage } from '@/types';

interface CartItemProps {
  item: CartItemData;
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem } = useCart();
  const product = item.productId as Product;
  const imageSet = product?.imageSet as ProductImage | null;
  const thumbnail = imageSet?.thumbnail ?? DEFAULT_PLACEHOLDER;

  return (
    <div className="flex gap-4 rounded-lg border border-brown-200 bg-white p-4">
      <Link
        href={`/shoe/${product?._id}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded bg-brown-50"
      >
        <Image
          src={thumbnail}
          alt={product?.name ?? 'Product'}
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-brown-500">
            {product?.brand}
          </p>
          <Link
            href={`/shoe/${product?._id}`}
            className="font-serif text-sm font-semibold text-brown-800 hover:text-copper"
          >
            {product?.name}
          </Link>
          <div className="mt-1 flex gap-3 text-xs text-brown-500">
            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-brown-800">
            &#8377;{((product?.price ?? 0) * item.quantity).toLocaleString('en-IN')}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-brown-600">Qty: {item.quantity}</span>
            <button
              onClick={() => removeItem(item._id)}
              className="text-brown-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
