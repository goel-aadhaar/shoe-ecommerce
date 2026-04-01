import { Star } from 'lucide-react';
import type { Review, User } from '@/types';

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="mt-6 text-sm text-brown-500">No reviews yet. Be the first!</p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {reviews.map((review) => {
        const reviewer = review.userId as User;
        return (
          <div
            key={review._id}
            className="rounded-lg border border-brown-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-brown-800">
                {reviewer?.fullName ?? 'Anonymous'}
              </span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < review.rating
                        ? 'fill-copper text-copper'
                        : 'text-brown-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            {review.reviewText && (
              <p className="mt-2 text-sm text-brown-600">{review.reviewText}</p>
            )}
            <p className="mt-2 text-xs text-brown-400">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
