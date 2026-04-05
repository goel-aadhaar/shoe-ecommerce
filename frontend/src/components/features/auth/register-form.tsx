'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(fullName, email, password);
      toast.success('Account created successfully!');
      router.push('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-lg border-2 border-brown-200 bg-white p-8 shadow-sm">
        <h1 className="text-center font-serif text-3xl font-bold text-brown-900">
          Create Account
        </h1>
        <p className="mt-2 text-center text-sm text-brown-500">
          Join the Urban Sole family
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-brown-700">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 w-full rounded border border-brown-200 bg-cream px-3 py-2.5 text-sm text-brown-800 placeholder:text-brown-400 focus:border-copper focus:outline-none"
              placeholder="John Doe"
            />
          </div>
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
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-brown-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded border border-brown-200 bg-cream px-3 py-2.5 text-sm text-brown-800 placeholder:text-brown-400 focus:border-copper focus:outline-none"
              placeholder="Re-enter password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brown-800 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brown-900 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brown-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-copper hover:text-sienna"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
