'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productService } from '@/services/product.service';
import { ProductCard } from '@/components/features/products/product-card';
import type { Product } from '@/types';

interface FeaturedProductsProps {
  title: string;
  attribute: string;
  viewAllHref: string;
}

export function FeaturedProducts({
  title,
  attribute,
  viewAllHref,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getByAttribute(attribute, 8)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [attribute]);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-bold text-brown-900">
          {title}
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-brown-100"
            />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <h2 className="font-serif text-3xl font-bold text-brown-900">
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="text-sm font-medium uppercase tracking-wider text-copper hover:text-sienna transition-colors"
        >
          View All &rarr;
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
