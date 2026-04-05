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
          const img = products[0]?.thumbnail ?? products[0]?.images?.[0] ?? null;
          if (img) setBrandImages((prev) => ({ ...prev, [brand]: img }));
        })
        .catch(() => {});
    });
  }, []);

  return (
    <section className="section-padding">
      <div className="container-inner">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-copper">
            Trusted By The Best
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-brown-900">
            Shop by Brand
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {BRANDS.map((brand) => {
            const img = brandImages[brand];
            return (
              <Link
                key={brand}
                href={`/collections/brand?brand=${encodeURIComponent(brand)}`}
                className="group flex flex-col items-center gap-4 rounded-2xl border border-brown-200 bg-white p-5 transition-all hover:border-copper hover:shadow-md"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-brown-50">
                  {img ? (
                    <Image
                      src={img}
                      alt={brand}
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brown-100">
                      <span className="font-serif text-xl font-bold text-brown-300">
                        {brand[0]}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-brown-600 transition-colors group-hover:text-copper">
                  {brand}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
