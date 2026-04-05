'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ProfileForm } from '@/components/features/profile/profile-form';
import { OrderHistory } from '@/components/features/profile/order-history';
import { FavouritesGrid } from '@/components/features/profile/favourites-grid';
import { useEffect } from 'react';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'orders', label: 'Orders' },
  { key: 'favourites', label: 'Favourites' },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, user } = useAuth();
  const tab = (searchParams.get('tab') ?? 'profile') as (typeof TABS)[number]['key'];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brown-200 border-t-copper" />
      </div>
    );
  }

  return (
    <div className="container-inner py-8 lg:py-12" style={{ maxWidth: '56rem' }}>
      <h1 className="font-serif text-3xl font-bold text-brown-900">
        Welcome, {user?.fullName}
      </h1>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-brown-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => router.push(`/profile?tab=${t.key}`)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-b-2 border-copper text-copper'
                : 'text-brown-500 hover:text-brown-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'profile' && <ProfileForm />}
        {tab === 'orders' && <OrderHistory />}
        {tab === 'favourites' && <FavouritesGrid />}
      </div>
    </div>
  );
}
