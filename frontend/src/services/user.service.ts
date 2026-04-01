import { apiGet, apiPut } from '@/lib/api';
import type { User, Profile } from '@/types';

export const userService = {
  getProfile: () =>
    apiGet<{ user: User; profile: Profile | null }>('/users/profile'),

  updateProfile: (data: Partial<Profile>) =>
    apiPut<Profile>('/users/profile', data),
};
