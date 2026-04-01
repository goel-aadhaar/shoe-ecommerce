'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-lg border-2 border-brown-200 bg-white p-8 shadow-sm">
        <h1 className="text-center font-serif text-3xl font-bold text-brown-900">
          Welcome Back
        </h1>
        <p className="mt-2 text-center text-sm text-brown-500">
          Sign in to your Urban Sole account
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-brown-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded border border-brown-200 bg-cream px-3 py-2.5 text-sm text-brown-800 placeholder:text-brown-400 focus:border-copper focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-brown-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded border border-brown-200 bg-cream px-3 py-2.5 text-sm text-brown-800 placeholder:text-brown-400 focus:border-copper focus:outline-none"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brown-800 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brown-900 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brown-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-copper hover:text-sienna"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
