'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_PLACEHOLDER } from '@/constants';
import type { Product, ProductImage } from '@/types';

interface ProductImageGalleryProps {
  product: Product;
}

export function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const imageSet = product.imageSet as ProductImage | null;

  const allImages = product.images?.length
    ? product.images
    : ([
        imageSet?.thumbnail ?? DEFAULT_PLACEHOLDER,
        imageSet?.hover,
        ...(imageSet?.sides ?? []),
      ].filter(Boolean) as string[]);

  const productName = product.name;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const mainImage = allImages[selectedIndex] ?? DEFAULT_PLACEHOLDER;

  function handleNext() {
    setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  }

  function handlePrev() {
    setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="group relative aspect-square overflow-hidden border border-ink/15 bg-bone">
        <Image
          src={mainImage}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <span className="absolute left-0 top-4 bg-ink px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-bone">
          {product.brand}
        </span>
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center bg-ink text-bone opacity-0 transition-all hover:bg-cobalt group-hover:opacity-100"
          aria-label="Expand image"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden border transition-all ${
                i === selectedIndex
                  ? 'border-cobalt'
                  : 'border-ink/15 opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={src}
                alt={`${productName} view ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-6 top-6 text-bone/60 transition-colors hover:text-volt"
            aria-label="Close"
          >
            <X className="h-8 w-8" />
          </button>

          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 p-4 text-bone/60 transition-colors hover:text-volt"
                aria-label="Previous"
              >
                <ChevronLeft className="h-10 w-10" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 p-4 text-bone/60 transition-colors hover:text-volt"
                aria-label="Next"
              >
                <ChevronRight className="h-10 w-10" />
              </button>
            </>
          )}

          <div className="relative h-[82vh] w-full max-w-5xl">
            <Image
              src={mainImage}
              alt={productName}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
