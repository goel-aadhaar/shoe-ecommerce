'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { productService } from '@/services/product.service';
import { DEFAULT_PLACEHOLDER } from '@/constants';
import type { Product } from '@/types';

export function ProductSpotlight() {
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    productService
      .getAll(1, 12)
      .then((res) => {
        const items = res.data.items ?? [];
        const sorted = [...items].sort(
          (a, b) => (b.images?.length ?? 0) - (a.images?.length ?? 0)
        );
        setProduct(sorted[0] ?? items[0] ?? null);
      })
      .catch(() => {});
  }, []);

  if (!product) return null;

  const allImages = product.images?.length
    ? product.images
    : [product.thumbnail ?? DEFAULT_PLACEHOLDER];

  return (
    <section className="scroll-reveal relative overflow-hidden bg-bone-deep section-padding">
      <span
        className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 select-none font-serif text-[28vw] leading-none text-ink/[0.04]"
        aria-hidden
      >
        01
      </span>

      <div className="relative container-inner">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Images */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 aspect-[16/9] w-full overflow-hidden bg-ink">
              <Image
                src={allImages[0]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />
              <span className="absolute left-4 top-4 bg-volt px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
                Spotlight
              </span>
            </div>
            {allImages.slice(1, 3).map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square w-full overflow-hidden bg-ink"
              >
                <Image
                  src={img}
                  alt={`${product.name} view ${idx + 2}`}
                  fill
                  sizes="300px"
                  className="object-cover grayscale transition-all duration-500 hover:grayscale-0"
                />
              </div>
            ))}
          </div>

          {/* Info */}
          <div>
            <p className="section-tag text-ink/60">Featured Product</p>

            <h2 className="mt-5 font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.85] text-ink">
              {product.name}
            </h2>
            <p className="mt-3 font-mono text-xs font-bold uppercase tracking-[0.25em] text-cobalt">
              By {product.brand}
            </p>

            {/* Rating */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating)
                        ? 'fill-cobalt text-cobalt'
                        : 'text-ink/20'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-ink/50">
                {product.rating} — {product.ratedBy} Reviews
              </span>
            </div>

            <p className="mt-6 max-w-md font-sans text-sm leading-relaxed text-ink/60">
              {product.description}
            </p>

            <p className="mt-8 font-serif text-5xl text-ink">
              ₹{product.price.toLocaleString('en-IN')}
            </p>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-8">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink/50">
                  Available Sizes
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <span
                      key={s}
                      className="border border-ink/25 px-3.5 py-1.5 font-mono text-xs font-bold text-ink"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href={`/shoe/${product._id}`} className="btn-primary">
                <ShoppingBag className="h-4 w-4" />
                View Product
              </Link>
              <Link href="/collections/all" className="btn-outline">
                See All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
