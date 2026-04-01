'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Star } from 'lucide-react';
import type { Product, ProductImage } from '@/types';
import { DEFAULT_PLACEHOLDER } from '@/constants';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const imageSet = product.imageSet as ProductImage | null;
  const thumbnail = imageSet?.thumbnail ?? DEFAULT_PLACEHOLDER;
  const hover = imageSet?.hover ?? thumbnail;

  return (
    <Link
      href={`/shoe/${product._id}`}
      className="group block overflow-hidden rounded-lg border border-brown-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-brown-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-brown-50">
        <Image
          src={isHovered ? hover : thumbnail}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.attributes.includes('onSale') && (
          <span className="absolute left-3 top-3 rounded bg-copper px-2 py-0.5 text-xs font-bold text-white">
            SALE
          </span>
        )}
        {product.attributes.includes('newArrival') && (
          <span className="absolute left-3 top-3 rounded bg-brown-800 px-2 py-0.5 text-xs font-bold text-cream">
            NEW
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-brown-500">
          {product.brand}
        </p>
        <h3 className="mt-1 font-serif text-lg font-semibold text-brown-900 line-clamp-1">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-brown-800">
            &#8377;{product.price.toLocaleString('en-IN')}
          </span>
          <div className="flex items-center gap-1 text-brown-500">
            <Star className="h-3.5 w-3.5 fill-copper text-copper" />
            <span className="text-xs">{product.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
