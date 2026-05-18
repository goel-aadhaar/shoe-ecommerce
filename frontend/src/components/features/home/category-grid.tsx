'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';

const CATEGORIES = [
  {
    name: 'Sneakers',
    href: '/collections/shoes',
    fetchType: 'category' as const,
    fetchKey: 'shoes',
  },
  {
    name: 'Crocs & Clogs',
    href: '/collections/clogs',
    fetchType: 'category' as const,
    fetchKey: 'crocs',
  },
  {
    name: "Men's",
    href: '/collections/men',
    fetchType: 'gender' as const,
    fetchKey: 'male',
  },
  {
    name: "Women's",
    href: '/collections/women',
    fetchType: 'gender' as const,
    fetchKey: 'female',
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
          const img =
            products[0]?.thumbnail ?? products[0]?.images?.[0] ?? null;
          if (img) setImages((prev) => ({ ...prev, [cat.fetchKey]: img }));
        })
        .catch(() => {});
    });
  }, []);

  return (
    <section className="scroll-reveal bg-ink text-bone section-padding">
      <div className="container-inner">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-bone/15 pb-7">
          <div>
            <p className="section-tag text-bone/50">Browse</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,7vw,6rem)] leading-[0.85] text-bone">
              Shop By <span className="text-cobalt">Category</span>
            </h2>
          </div>
          <p className="hidden max-w-xs font-mono text-[11px] uppercase leading-relaxed tracking-[0.15em] text-bone/40 sm:block">
            Four ways in. Pick a lane and go loud.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-px bg-bone/15 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => {
            const img = images[cat.fetchKey];
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative flex aspect-[3/4] flex-col overflow-hidden bg-ink"
              >
                {img ? (
                  <Image
                    src={img}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover opacity-50 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-70 group-hover:grayscale-0"
                  />
                ) : (
                  <div className="absolute inset-0 bg-carbon" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />

                <span className="absolute left-4 top-4 index-num text-sm text-volt">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                  <h3 className="font-serif text-3xl uppercase leading-none text-bone sm:text-4xl">
                    {cat.name}
                  </h3>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-bone text-ink transition-colors duration-300 group-hover:bg-volt">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
