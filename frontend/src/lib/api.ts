import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import type { ApiResponse } from '@/types';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/login')
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
  const res = await api.get<ApiResponse<T>>(url, { params });
  return res.data;
}

export async function apiPost<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  const res = await api.post<ApiResponse<T>>(url, data);
  return res.data;
}

export async function apiPut<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  const res = await api.put<ApiResponse<T>>(url, data);
  return res.data;
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  const res = await api.delete<ApiResponse<T>>(url);
  return res.data;
}

export default api;
