'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import { ProductGrid } from '@/components/features/products/product-grid';
import { ProductCardSkeleton } from '@/components/common/skeleton';
import type { SearchProduct } from '@/types';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();

  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    setError(false);

    // Feeds the "Search Behaviour" analytics panel and the CTR denominator.
    aiService.trackEvent({ type: 'search', query });

    aiService
      .semanticSearch(query, { limit: 24 })
      .then((res) => {
        if (active) setResults(res.data.results);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  return (
    <div className="container-inner py-12 lg:py-16">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/15 pb-7">
        <div>
          <p className="section-tag flex items-center gap-2 text-copper">
            <Sparkles className="h-3.5 w-3.5" />
            AI Semantic Search
          </p>
          <h1 className="mt-4 font-serif text-[clamp(2.5rem,7vw,6rem)] leading-[0.85] text-ink">
            {query ? `“${query}”` : 'Search'}
          </h1>
        </div>
        {!loading && query && !error && (
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/40">
            {results.length} {results.length === 1 ? 'Match' : 'Matches'}
          </p>
        )}
      </div>

      {query && (
        <p className="mt-4 max-w-2xl font-mono text-xs uppercase tracking-[0.15em] text-ink/40">
          Ranked by meaning, not keywords — results reflect what you described,
          even when the exact words aren’t in the product.
        </p>
      )}

      <div className="mt-10">
        {!query ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-ink/20 py-24 text-center">
            <p className="font-serif text-4xl uppercase text-ink">
              Describe what you need
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-ink/40">
              e.g. “comfortable office shoes” · “white running shoes under 5000”
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-ink/20 py-24 text-center">
            <p className="font-serif text-4xl uppercase text-ink">
              Search Unavailable
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-ink/40">
              The AI search service isn’t responding. Please try again shortly.
            </p>
          </div>
        ) : (
          <ProductGrid products={results} />
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-inner py-24 text-center font-mono text-xs uppercase tracking-[0.2em] text-ink/40">
          Loading…
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
