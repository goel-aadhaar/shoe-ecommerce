'use client';

import { useState } from 'react';
import { X, Search } from 'lucide-react';
import type { Product } from '@/types';
import { ProductDetail } from './product-detail';

interface QuickViewProps {
  product: Product;
}

export function QuickView({ product }: QuickViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 translate-y-4 items-center gap-2 bg-ink px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-bone opacity-0 backdrop-blur-sm transition-all hover:bg-cobalt hover:text-white group-hover:translate-y-0 group-hover:opacity-100"
        title="Quick View"
      >
        <Search className="h-4 w-4" /> Quick View
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
            }} 
          />
          <div 
            className="relative z-10 max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="absolute right-4 top-4 z-20 rounded-full bg-white p-2 text-brown-500 shadow-sm hover:bg-brown-50 hover:text-brown-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-2 sm:p-4">
               {/* Reusing ProductDetail for consistency, wrapped in a localized container */}
              <div className="scale-[0.95] origin-top">
                <ProductDetail product={product} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
