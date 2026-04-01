'use client';

import Image from 'next/image';
import { useState } from 'react';
import { DEFAULT_PLACEHOLDER } from '@/constants';
import type { ProductImage } from '@/types';

interface ProductImageGalleryProps {
  imageSet: ProductImage | null;
  productName: string;
}

export function ProductImageGallery({
  imageSet,
  productName,
}: ProductImageGalleryProps) {
  const allImages = [
    imageSet?.thumbnail ?? DEFAULT_PLACEHOLDER,
    imageSet?.hover,
    ...(imageSet?.sides ?? []),
  ].filter(Boolean) as string[];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainImage = allImages[selectedIndex] ?? DEFAULT_PLACEHOLDER;

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-lg border border-brown-200 bg-white">
        <Image
          src={mainImage}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
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
    </div>
  );
}
