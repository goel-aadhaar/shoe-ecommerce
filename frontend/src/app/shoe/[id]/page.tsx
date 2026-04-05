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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brown-200 border-t-copper" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="font-serif text-xl text-brown-600">Product not found</p>
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
      <section className="container-inner pb-16">
        <div className="border-t border-brown-200 pt-10">
          <h2 className="font-serif text-2xl font-bold text-brown-900">
            Reviews ({reviews.length})
          </h2>
          <p className="mt-1 text-sm text-brown-500">
            Average rating: {avgRating} / 5
          </p>
          <ReviewForm productId={id} onReviewAdded={handleReviewAdded} />
          <ReviewList reviews={reviews} />
        </div>
      </section>

      {/* Similar products */}
      {similar.length > 0 && (
        <section className="container-inner pb-16">
          <h2 className="font-serif text-2xl font-bold text-brown-900">
            You Might Also Like
          </h2>
          <div className="mt-6">
            <ProductGrid products={similar} />
          </div>
        </section>
      )}
    </>
  );
}
