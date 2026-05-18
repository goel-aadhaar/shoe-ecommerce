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
  const thumbnail =
    product?.thumbnail ?? imageSet?.thumbnail ?? DEFAULT_PLACEHOLDER;

  return (
    <div className="flex gap-5 border border-ink/15 bg-paper p-4 transition-colors hover:border-ink">
      <Link
        href={`/shoe/${product?._id}`}
        className="relative h-28 w-28 shrink-0 overflow-hidden bg-bone"
      >
        <Image
          src={thumbnail}
          alt={product?.name ?? 'Product'}
          fill
          sizes="112px"
          className="object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40">
            {product?.brand}
          </p>
          <Link
            href={`/shoe/${product?._id}`}
            className="font-serif text-2xl uppercase leading-none text-ink transition-colors hover:text-cobalt"
          >
            {product?.name}
          </Link>
          <div className="mt-2 flex gap-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink/50">
            {item.selectedSize && <span>Size · {item.selectedSize}</span>}
            {item.selectedColor && <span>Qty · {item.quantity}</span>}
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-dashed border-ink/15 pt-3">
          <span className="font-mono text-lg font-bold text-ink">
            ₹{((product?.price ?? 0) * item.quantity).toLocaleString('en-IN')}
          </span>
          <button
            onClick={() => removeItem(item._id)}
            className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40 transition-colors hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
