import axios from 'axios';
import { API_CONFIG, SESSION_CONFIG } from '@/constants';
import { User, LoginForm, RegisterForm } from '@/types';

// Configure axios defaults
axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(SESSION_CONFIG.TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear session and redirect to login
      localStorage.removeItem(SESSION_CONFIG.TOKEN_KEY);
      localStorage.removeItem(SESSION_CONFIG.USER_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginForm): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data;
    
    // Store in localStorage
    localStorage.setItem(SESSION_CONFIG.TOKEN_KEY, token);
    localStorage.setItem(SESSION_CONFIG.USER_KEY, JSON.stringify(user));
    
    return { user, token };
  },

  async register(userData: RegisterForm): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/register', userData);
    const { user, token } = response.data;
    
    // Store in localStorage
    localStorage.setItem(SESSION_CONFIG.TOKEN_KEY, token);
    localStorage.setItem(SESSION_CONFIG.USER_KEY, JSON.stringify(user));
    
    return { user, token };
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem(SESSION_CONFIG.TOKEN_KEY);
      localStorage.removeItem(SESSION_CONFIG.USER_KEY);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(SESSION_CONFIG.TOKEN_KEY);
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(SESSION_CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default api;
