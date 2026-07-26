'use client';

import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, ThumbsUp, ThumbsDown, Check, X } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import { DEFAULT_PLACEHOLDER } from '@/constants';
import type { ComparisonResponse, Product, SearchProduct } from '@/types';

function CompareResults() {
  const params = useSearchParams();
  const ids = (params.get('ids') ?? '').split(',').filter(Boolean);
  const [data, setData] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length < 2) {
      setLoading(false);
      return;
    }
    setLoading(true);
    aiService
      .compare(ids)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [ids.join(',')]);

  if (ids.length < 2) {
    return (
      <div className="container-inner py-24 text-center">
        <p className="font-serif text-4xl uppercase text-ink">Pick Two Or More Shoes</p>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-ink/40">
          Add product IDs to the URL: /compare?ids=id1,id2,id3
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-inner py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink/40">
          Comparing…
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-inner py-24 text-center">
        <p className="font-serif text-4xl uppercase text-ink">Comparison Unavailable</p>
      </div>
    );
  }

  return (
    <div className="container-inner py-12 lg:py-16">
      <div className="border-b border-ink/15 pb-7">
        <p className="section-tag flex items-center gap-2 text-copper">
          <Sparkles className="h-3.5 w-3.5" />
          AI Comparison
        </p>
        <h1 className="mt-3 font-serif text-[clamp(2.5rem,7vw,6rem)] leading-[0.85] text-ink">
          Side by Side
        </h1>
        <p className="mt-3 max-w-3xl font-sans text-sm leading-relaxed text-ink/70">
          {data.recommendation}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-px bg-ink/15 md:grid-cols-2 lg:grid-cols-3">
        {data.products.map((p) => (
          <ProductColumn
            key={p._id}
            product={p as SearchProduct & Product}
            facet={data.facets.find((f) => f.productId === p._id)}
          />
        ))}
      </div>
    </div>
  );
}

function ProductColumn({
  product,
  facet,
}: {
  product: SearchProduct;
  facet?: ComparisonResponse['facets'][number];
}) {
  return (
    <div className="flex flex-col bg-paper p-6">
      <Link href={`/shoe/${product._id}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-ink/5">
          <Image
            src={product.thumbnail ?? DEFAULT_PLACEHOLDER}
            alt={product.name ?? ''}
            width={500}
            height={500}
            className="h-full w-full object-cover"
          />
        </div>
        <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-cobalt">
          {product.brand}
        </p>
        <h2 className="mt-1 font-serif text-2xl leading-tight text-ink">{product.name}</h2>
        <p className="mt-1 font-serif text-3xl text-ink">
          ₹{product.price?.toLocaleString('en-IN')}
        </p>
      </Link>

      {facet && (
        <div className="mt-5 flex flex-col gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
              <ThumbsUp className="h-3.5 w-3.5" />
              Pros
            </div>
            <ul className="flex flex-col gap-1.5 font-sans text-sm text-ink">
              {facet.pros.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-ok" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
              <ThumbsDown className="h-3.5 w-3.5" />
              Cons
            </div>
            {facet.cons.length === 0 ? (
              <p className="font-sans text-sm italic text-ink/50">No notable downsides.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 font-sans text-sm text-ink">
                {facet.cons.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <X className="mt-1 h-3.5 w-3.5 shrink-0 text-crit" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {facet.bestFor && (
            <div className="border border-ink/15 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
                Best For
              </p>
              <p className="mt-1 font-sans text-sm text-ink">{facet.bestFor}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="container-inner py-24 text-center font-mono text-xs uppercase tracking-[0.2em] text-ink/40">
          Loading…
        </div>
      }
    >
      <CompareResults />
    </Suspense>
  );
}
