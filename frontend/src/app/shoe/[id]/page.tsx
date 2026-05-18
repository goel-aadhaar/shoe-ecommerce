'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { productService } from '@/services/product.service';
import { ProductDetail } from '@/components/features/products/product-detail';
import { ProductGrid } from '@/components/features/products/product-grid';
import { ReviewList } from '@/components/features/reviews/review-list';
import { ReviewForm } from '@/components/features/reviews/review-form';
import type { Product, Review } from '@/types';

export default function ShoeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState('0');
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      productService.getById(id),
      productService.getReviews(id),
      productService.getSimilar(id).catch(() => ({ data: [] })),
    ])
      .then(([prodRes, revRes, simRes]) => {
        setProduct(prodRes.data);
        setReviews(revRes.data.reviews);
        setAvgRating(revRes.data.avgRating);
        setSimilar(Array.isArray(simRes.data) ? simRes.data : []);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
        <div className="h-12 w-12 animate-spin border-2 border-ink/15 border-t-cobalt" />
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink/40">
          Loading
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="font-serif text-4xl uppercase text-ink">
          Product Not Found
        </p>
      </div>
    );
  }

  function handleReviewAdded(review: Review) {
    setReviews((prev) => [review, ...prev]);
  }

  return (
    <>
      <ProductDetail product={product} />

      {/* Reviews */}
      <section className="container-inner pb-20">
        <div className="border-t border-ink/15 pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] leading-[0.85] text-ink">
              Reviews
            </h2>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
              {reviews.length} Entries · Avg {avgRating} / 5
            </p>
          </div>
          <ReviewForm productId={id} onReviewAdded={handleReviewAdded} />
          <ReviewList reviews={reviews} />
        </div>
      </section>

      {/* Similar products */}
      {similar.length > 0 && (
        <section className="container-inner pb-20">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/15 pb-7">
            <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] leading-[0.85] text-ink">
              You Might Also Like
            </h2>
          </div>
          <div className="mt-10">
            <ProductGrid products={similar} />
          </div>
        </section>
      )}
    </>
  );
}
