import { apiGet } from '@/lib/api';
import type { Review, PaginatedData } from '@/types';

export const reviewService = {
  getMyReviews: (page = 1, limit = 10) =>
    apiGet<PaginatedData<Review>>('/reviews/me', { page, limit }),
};
