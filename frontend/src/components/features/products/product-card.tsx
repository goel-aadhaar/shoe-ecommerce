'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Star } from 'lucide-react';
import type { Product, ProductImage } from '@/types';
import { DEFAULT_PLACEHOLDER } from '@/constants';
import { Badge } from '@/components/common/badge';
import { QuickView } from './quick-view';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const imageSet = product.imageSet as ProductImage | null;
  const thumbnail = product.thumbnail ?? imageSet?.thumbnail ?? DEFAULT_PLACEHOLDER;
  const hover = product.images?.[1] ?? imageSet?.hover ?? thumbnail;

  return (
    <Link
      href={`/shoe/${product._id}`}
      className="group block overflow-hidden rounded-xl border border-brown-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-brown-300"
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
          <div className="absolute left-3 top-3">
            <Badge variant="accent">SALE</Badge>
          </div>
        )}
        {product.attributes.includes('newArrival') && (
          <div className="absolute left-3 top-3">
             <Badge variant="default">NEW</Badge>
          </div>
        )}
        <QuickView product={product} />
      </div>

      <div className="p-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-brown-500">
          {product.brand}
        </p>
        <h3 className="mt-1 font-serif text-base font-bold text-brown-900 line-clamp-1">
          {product.name}
        </h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold text-brown-800">
            &#8377;{product.price.toLocaleString('en-IN')}
          </span>
          <div className="flex items-center gap-1 text-brown-500">
            <Star className="h-4 w-4 fill-copper text-copper" />
            <span className="text-sm">{product.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
