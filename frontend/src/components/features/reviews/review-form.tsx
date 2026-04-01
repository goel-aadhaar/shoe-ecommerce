'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { productService } from '@/services/product.service';
import type { Review } from '@/types';

interface ReviewFormProps {
  productId: string;
  onReviewAdded: (review: Review) => void;
}

export function ReviewForm({ productId, onReviewAdded }: ReviewFormProps) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setSubmitting(true);
    try {
      const res = await productService.addReview({
        productId,
        rating,
        reviewText: text || undefined,
      });
      onReviewAdded(res.data);
      setRating(0);
      setText('');
      toast.success('Review submitted');
    } catch {
      toast.error('Could not submit review');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-lg border border-brown-200 bg-white p-4"
    >
      <p className="text-sm font-medium text-brown-700">Write a Review</p>
      <div className="mt-2 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHoverRating(i + 1)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(i + 1)}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                i < (hoverRating || rating)
                  ? 'fill-copper text-copper'
                  : 'text-brown-200'
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="mt-3 w-full rounded border border-brown-200 bg-cream p-2 text-sm text-brown-800 placeholder:text-brown-400 focus:border-copper focus:outline-none"
      />
      <button
        type="submit"
        disabled={submitting}
        className="mt-3 rounded bg-brown-800 px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-brown-900 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
