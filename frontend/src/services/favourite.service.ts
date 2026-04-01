import { apiGet, apiPost, apiDelete } from '@/lib/api';
import type { Favourite, PaginatedData } from '@/types';

export const favouriteService = {
  getAll: (page = 1, limit = 20) =>
    apiGet<PaginatedData<Favourite>>('/users/favourites', { page, limit }),

  add: (productId: string) =>
    apiPost<Favourite>('/users/favourites', { productId }),

  remove: (productId: string) =>
    apiDelete<null>(`/users/favourites/${productId}`),
};
