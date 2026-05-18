'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';

const BRANDS = [
  'Nike',
  'adidas Originals',
  'Puma',
  'Jordan',
  'New Balance',
  'Converse',
  'Crocs',
] as const;

export function BrandShowcase() {
  const [brandImages, setBrandImages] = useState<Record<string, string>>({});

  useEffect(() => {
    BRANDS.forEach((brand) => {
      productService
        .getByBrand(brand, 1)
        .then((res) => {
          const products = res.data as Product[];
          const img =
            products[0]?.thumbnail ?? products[0]?.images?.[0] ?? null;
          if (img) setBrandImages((prev) => ({ ...prev, [brand]: img }));
        })
        .catch(() => {});
    });
  }, []);

  return (
    <section className="scroll-reveal bg-bone section-padding">
      <div className="container-inner">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/15 pb-7">
          <div>
            <p className="section-tag text-ink/60">Trusted By The Best</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,7vw,6rem)] leading-[0.85] text-ink">
              The Roster
            </h2>
          </div>
        </div>

        <div className="mt-2 border-b border-ink/15">
          {BRANDS.map((brand, i) => {
            const img = brandImages[brand];
            return (
              <Link
                key={brand}
                href={`/collections/brand?brand=${encodeURIComponent(brand)}`}
                className="group relative flex items-center justify-between border-t border-ink/15 py-6 transition-colors hover:bg-ink"
              >
                <div className="flex items-center gap-6 sm:gap-10">
                  <span className="index-num text-sm text-ink/40 transition-colors group-hover:text-volt">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif text-4xl uppercase leading-none text-ink transition-colors group-hover:text-bone sm:text-6xl">
                    {brand}
                  </h3>
                </div>

                <div className="flex items-center gap-6">
                  <div className="relative hidden h-20 w-28 overflow-hidden bg-bone-deep opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
                    {img && (
                      <Image
                        src={img}
                        alt={brand}
                        fill
                        sizes="112px"
                        className="object-cover grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0"
                      />
                    )}
                  </div>
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink/40 transition-colors group-hover:text-volt">
                    Shop →
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
