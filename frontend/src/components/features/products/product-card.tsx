'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Star, ArrowUpRight } from 'lucide-react';
import type { Product, ProductImage } from '@/types';
import { DEFAULT_PLACEHOLDER } from '@/constants';
import { aiService } from '@/services/ai.service';
import { Badge } from '@/components/common/badge';
import { QuickView } from './quick-view';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const imageSet = product.imageSet as ProductImage | null;
  const thumbnail =
    product.thumbnail ?? imageSet?.thumbnail ?? DEFAULT_PLACEHOLDER;
  const hover = product.images?.[1] ?? imageSet?.hover ?? thumbnail;

  // Products can arrive from several sources (paginated catalog, AI rails,
  // search, bundles). Some come back via `.lean()`, which skips Mongoose schema
  // defaults, so never assume these fields are present.
  const attributes = product.attributes ?? [];
  const onSale = attributes.includes('onSale');
  const isNew = attributes.includes('newArrival');
  const rating = product.rating ?? 0;
  const price = product.price ?? 0;

  return (
    <Link
      href={`/shoe/${product._id}`}
      className="group block border border-ink/15 bg-paper transition-colors duration-300 hover:border-ink"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // Every grid, rail and search result renders this card, so tracking the
      // click here is what makes CTR a real number rather than a constant zero.
      onClick={() => {
        aiService.trackEvent({ type: 'click', productId: product._id });
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-bone">
        <Image
          src={isHovered ? hover : thumbnail}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="media-zoom object-cover"
        />

        {/* Tags */}
        <div className="absolute left-0 top-4 flex flex-col gap-1.5">
          {onSale && <Badge variant="accent">Sale</Badge>}
          {isNew && <Badge variant="default">New</Badge>}
        </div>

        {/* Corner cue */}
        <div className="absolute right-0 top-0 flex h-10 w-10 translate-x-full items-center justify-center bg-cobalt text-white transition-transform duration-300 group-hover:translate-x-0">
          <ArrowUpRight className="h-5 w-5" />
        </div>

        <QuickView product={product} />
      </div>

      <div className="border-t border-ink/15 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
            {product.brand}
          </p>
          <div className="flex items-center gap-1 font-mono text-[11px] text-ink/60">
            <Star className="h-3.5 w-3.5 fill-cobalt text-cobalt" />
            {rating.toFixed(1)}
          </div>
        </div>

        <h3 className="mt-2 line-clamp-1 font-serif text-xl uppercase leading-none text-ink">
          {product.name}
        </h3>

        <div className="mt-4 flex items-end justify-between border-t border-dashed border-ink/15 pt-3">
          <span className="font-mono text-lg font-bold text-ink">
            ₹{price.toLocaleString('en-IN')}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-cobalt opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
