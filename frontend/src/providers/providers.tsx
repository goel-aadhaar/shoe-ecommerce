'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from './auth-provider';
import { CartProvider } from './cart-provider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#3b2f2f',
              color: '#faf6f1',
              border: '1px solid #6b4c3f',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}
