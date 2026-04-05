'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';

const CATEGORIES = [
  {
    name: 'Sneakers',
    href: '/collections/shoes',
    fetchType: 'category' as const,
    fetchKey: 'shoes',
    color: 'from-brown-900 to-brown-800',
  },
  {
    name: 'Crocs & Clogs',
    href: '/collections/clogs',
    fetchType: 'category' as const,
    fetchKey: 'crocs',
    color: 'from-brown-800 to-brown-700',
  },
  {
    name: "Men's Collection",
    href: '/collections/men',
    fetchType: 'gender' as const,
    fetchKey: 'male',
    color: 'from-brown-950 to-brown-900',
  },
  {
    name: "Women's Collection",
    href: '/collections/women',
    fetchType: 'gender' as const,
    fetchKey: 'female',
    color: 'from-sienna to-copper',
  },
];

export function CategoryGrid() {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    CATEGORIES.forEach((cat) => {
      const fetcher =
        cat.fetchType === 'category'
          ? productService.getByCategory(cat.fetchKey, 2)
          : productService.getByGender(cat.fetchKey, 2);

      fetcher
        .then((res) => {
          const products = res.data as Product[];
          const img = products[0]?.thumbnail ?? products[0]?.images?.[0] ?? null;
          if (img) setImages((prev) => ({ ...prev, [cat.fetchKey]: img }));
        })
        .catch(() => {});
    });
  }, []);

  return (
    <section className="bg-brown-50 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-copper">
            Browse
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-brown-900">
            Shop by Category
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const img = images[cat.fetchKey];
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-brown-800"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  {img ? (
                    <Image
                      src={img}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className={`h-full w-full bg-gradient-to-br ${cat.color}`} />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brown-950/90 to-transparent" />
                </div>

                {/* Label */}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-serif text-xl font-bold text-cream">
                    {cat.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-sm font-bold text-copper opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    Browse <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
