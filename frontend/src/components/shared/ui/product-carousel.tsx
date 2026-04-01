'use client';

import React, { useState, useCallback } from 'react';
import ProductCard from './product-card';
import ProductSkeleton from './product-skeleton';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCarouselProps {
  products: any[];
  loading?: boolean;
  title?: string;
  slidesPerView?: number;
  className?: string;
}

export default function ProductCarousel({ 
  products = [], 
  loading = false, 
  title,
  slidesPerView = 4,
  className = ''
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getSlidesPerView = useCallback(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return 1;
      if (width < 768) return 2;
      if (width < 1024) return 3;
      return slidesPerView;
    }
    return slidesPerView;
  }, [slidesPerView]);

  const maxIndex = Math.max(0, products.length - getSlidesPerView());

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {title && <h2 className="text-2xl font-bold">{title}</h2>}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: getSlidesPerView() }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {title && <h2 className="text-2xl font-bold">{title}</h2>}
        <div className="text-center py-12 text-gray-500">
          No products found
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={!canGoPrev}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={!canGoNext}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-6"
          style={{
            transform: `translateX(-${currentIndex * (100 / getSlidesPerView())}%)`
          }}
        >
          {products.map((product) => (
            <div
              key={product._id}
              className="flex-shrink-0"
              style={{ width: `${100 / getSlidesPerView()}%` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots for mobile */}
      <div className="flex justify-center gap-2 lg:hidden">
        {Array.from({ length: Math.min(products.length, getSlidesPerView()) }).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
