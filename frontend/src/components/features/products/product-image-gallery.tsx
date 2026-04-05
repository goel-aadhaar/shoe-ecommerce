'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_PLACEHOLDER } from '@/constants';
import type { Product, ProductImage } from '@/types';

interface ProductImageGalleryProps {
  product: Product;
}

export function ProductImageGallery({
  product,
}: ProductImageGalleryProps) {
  const imageSet = product.imageSet as ProductImage | null;

  // Prefer inline images/thumbnail, fall back to imageSet ref
  const allImages = product.images?.length
    ? product.images
    : [
        imageSet?.thumbnail ?? DEFAULT_PLACEHOLDER,
        imageSet?.hover,
        ...(imageSet?.sides ?? []),
      ].filter(Boolean) as string[];

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
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="group relative aspect-square overflow-hidden rounded-lg border border-brown-200 bg-white">
        <Image
          src={mainImage}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 rounded-full bg-white/80 p-2 text-brown-900 opacity-0 shadow-sm backdrop-blur transition-all hover:bg-copper hover:text-white group-hover:opacity-100"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {allImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border-2 transition-all ${
                i === selectedIndex
                  ? 'border-copper'
                  : 'border-brown-200 opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={src}
                alt={`${productName} view ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-6 top-6 text-white/70 hover:text-white"
          >
            <X className="h-8 w-8" />
          </button>

          {allImages.length > 1 && (
            <>
              <button onClick={handlePrev} className="absolute left-4 p-4 text-white/70 hover:text-white">
                <ChevronLeft className="h-10 w-10" />
              </button>
              <button onClick={handleNext} className="absolute right-4 p-4 text-white/70 hover:text-white">
                <ChevronRight className="h-10 w-10" />
              </button>
            </>
          )}

          <div className="relative h-[80vh] w-full max-w-5xl">
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
