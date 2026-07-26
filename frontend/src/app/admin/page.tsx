'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AdminDashboard } from '@/components/features/admin/admin-dashboard';
import { AiAnalyticsDashboard } from '@/components/features/admin/ai-analytics-dashboard';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brown-200 border-t-copper" />
      </div>
    );
  }

  return (
    <div className="container-inner py-8 lg:py-12">
      <h1 className="font-serif text-3xl font-bold text-brown-900">
        Admin Dashboard
      </h1>
      {/* AI intelligence metrics — funnel, CTR, top products, search behaviour */}
      <div className="mt-8">
        <AiAnalyticsDashboard />
      </div>

      <div className="mt-16">
        <AdminDashboard />
      </div>
    </div>
  );
}
