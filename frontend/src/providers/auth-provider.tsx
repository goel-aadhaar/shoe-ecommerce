'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '@/services/auth.service';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService
      .checkAuth()
      .then((res) => {
        if (res.data.isLoggedIn && res.data.userId) {
          // Fetch full user info
          import('@/services/user.service').then(({ userService }) => {
            userService
              .getProfile()
              .then((profileRes) => setUser(profileRes.data.user))
              .catch(() => setUser(null))
              .finally(() => setIsLoading(false));
          });
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setUser(res.data.user);
  }, []);

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      await authService.register({ fullName, email, password });
      // Auto-login after register
      const loginRes = await authService.login({ email, password });
      setUser(loginRes.data.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
