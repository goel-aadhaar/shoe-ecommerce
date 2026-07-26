'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import { ProductCard } from './product-card';
import type { SearchProduct } from '@/types';

/**
 * "Frequently Bought Together" — association-rule (FP-Growth) complements for a
 * product. Renders nothing when there are no learned complements yet.
 */
export function FrequentlyBoughtTogether({ productId }: { productId: string }) {
  const [items, setItems] = useState<SearchProduct[]>([]);

  useEffect(() => {
    let active = true;
    aiService
      .bundles(productId)
      .then((res) => {
        if (active) setItems(res.data.complements);
      })
      .catch(() => {
        /* no bundles / AI down */
      });
    return () => {
      active = false;
    };
  }, [productId]);

  if (items.length === 0) return null;

  return (
    <section className="container-inner border-t border-ink/15 py-12 lg:py-16">
      <div className="border-b border-ink/15 pb-5">
        <p className="section-tag flex items-center gap-2 text-copper">
          <Sparkles className="h-3.5 w-3.5" />
          AI Bundle
        </p>
        <h2 className="mt-3 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-none text-ink">
          Frequently Bought Together
        </h2>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-px bg-ink/10 lg:grid-cols-4">
        {items.slice(0, 4).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
