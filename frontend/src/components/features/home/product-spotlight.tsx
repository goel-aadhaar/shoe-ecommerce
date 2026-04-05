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
        const sorted = [...items].sort((a, b) => (b.images?.length ?? 0) - (a.images?.length ?? 0));
        setProduct(sorted[0] ?? items[0] ?? null);
      })
      .catch(() => {});
  }, []);

  if (!product) return null;

  const allImages = product.images?.length ? product.images : [product.thumbnail ?? DEFAULT_PLACEHOLDER];

  return (
    <section className="bg-brown-900 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Images grid */}
          <div className="grid max-w-md grid-cols-2 gap-3 lg:max-w-none">
            <div className="relative col-span-2 aspect-[5/2] w-full overflow-hidden rounded-2xl bg-brown-700">
              <Image
                src={allImages[0]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover"
              />
            </div>
            {allImages.slice(1, 3).map((img, idx) => (
              <div key={idx} className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-brown-700">
                <Image
                  src={img}
                  alt={`${product.name} view ${idx + 2}`}
                  fill
                  sizes="250px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Product info */}
          <div>
            <span className="inline-block rounded-full bg-copper/20 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-copper">
              Featured Product
            </span>
            <h2 className="mt-6 font-serif text-3xl font-bold text-cream">
              {product.name}
            </h2>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-brown-400">
              By {product.brand}
            </p>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating)
                        ? 'fill-copper text-copper'
                        : 'text-brown-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-brown-400">
                {product.rating} ({product.ratedBy} reviews)
              </span>
            </div>

            <p className="mt-6 text-base leading-relaxed text-brown-300">
              {product.description}
            </p>

            <p className="mt-6 font-serif text-3xl font-bold text-cream">
              &#8377;{product.price.toLocaleString('en-IN')}
            </p>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-bold uppercase tracking-wider text-brown-400">
                  Available Sizes
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg border border-brown-700 px-3 py-1.5 text-sm font-medium text-brown-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-10 flex items-center gap-4">
              <Link
                href={`/shoe/${product._id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-copper px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-sienna"
              >
                <ShoppingBag className="h-4 w-4" />
                View Product
              </Link>
              <Link
                href="/collections/all"
                className="inline-flex items-center gap-2 rounded-lg border border-brown-600 px-6 py-3 text-sm font-bold text-brown-300 transition-colors hover:border-cream hover:text-cream"
              >
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
