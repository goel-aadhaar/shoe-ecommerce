import { apiGet, apiPost } from '@/lib/api';
import type { User } from '@/types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface CheckAuthResponse {
  isLoggedIn: boolean;
  userId?: string;
}

export const authService = {
  login: (data: LoginPayload) =>
    apiPost<LoginResponse>('/auth/login', data),

  register: (data: RegisterPayload) =>
    apiPost<User>('/auth/register', data),

  logout: () => apiPost<object>('/auth/logout'),

  checkAuth: () => apiGet<CheckAuthResponse>('/auth/check'),

  refreshToken: () =>
    apiPost<{ accessToken: string; refreshToken: string }>('/auth/refresh'),
};
