'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import { ProductCard } from '@/components/features/products/product-card';
import type { HomeSectionBlock } from '@/types';

/**
 * Personalized homepage rails powered by the AI recommendation engine.
 * Renders nothing if the AI service is unavailable or has no sections yet, so
 * the homepage degrades gracefully.
 */
export function AiRecommendations() {
  const [sections, setSections] = useState<HomeSectionBlock[]>([]);

  useEffect(() => {
    let active = true;
    aiService
      .home()
      .then((res) => {
        if (active) setSections(res.data.sections.filter((s) => s.items.length > 0));
      })
      .catch(() => {
        /* AI service down — render nothing */
      });
    return () => {
      active = false;
    };
  }, []);

  if (sections.length === 0) return null;

  return (
    <section className="container-inner py-12 lg:py-16">
      {sections.map((block) => (
        <div key={block.section} className="mb-16 last:mb-0">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink/15 pb-5">
            <div>
              <p className="section-tag flex items-center gap-2 text-copper">
                <Sparkles className="h-3.5 w-3.5" />
                AI Personalized
              </p>
              <h2 className="mt-3 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-none text-ink">
                {block.title}
              </h2>
            </div>
          </div>

          <div className="mt-6 flex gap-px overflow-x-auto bg-ink/10 pb-1">
            {block.items.map((product) => (
              <div
                key={product._id}
                className="min-w-[78%] shrink-0 sm:min-w-[46%] lg:min-w-[24%]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
