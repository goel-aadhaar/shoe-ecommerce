'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
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
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    'mt-2 w-full border border-ink/20 bg-bone px-4 py-3 font-mono text-sm text-ink placeholder:text-ink/30 focus:border-cobalt focus:outline-none transition-colors';
  const labelCls =
    'font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-ink/50';

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="border border-ink/20 bg-paper p-8 sm:p-10">
        <p className="section-tag text-ink/50">Account</p>
        <h1 className="mt-4 font-serif text-5xl uppercase leading-[0.85] text-ink">
          Welcome
          <br />
          <span className="text-cobalt">Back</span>
        </h1>
        <p className="mt-3 font-sans text-sm text-ink/50">
          Sign in to your Urban Sole account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={inputCls}
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Signing In…' : 'Sign In'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-8 border-t border-ink/15 pt-6 text-center font-mono text-xs uppercase tracking-[0.15em] text-ink/50">
          No account?{' '}
          <Link
            href="/register"
            className="font-bold text-cobalt hover:text-ink"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
