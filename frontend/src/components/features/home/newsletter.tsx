'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export function Newsletter() {
  const [email, setEmail] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('Thanks for subscribing!');
    setEmail('');
  }

  return (
    <section className="relative overflow-hidden bg-brown-900 section-padding">
      {/* Decorative circles */}
      <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-copper/5" />
      <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-copper/5" />

      <div className="relative container-inner">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-copper">
            Stay Updated
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-cream">
            Join the Urban Sole Club
          </h2>
          <p className="mt-4 text-base text-brown-300">
            Get early access to new drops, exclusive deals, and style
            inspiration delivered to your inbox.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-0"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              suppressHydrationWarning
              className="flex-1 rounded-lg border border-brown-700 bg-brown-800 px-5 py-3.5 text-base text-cream placeholder:text-brown-500 focus:border-copper focus:outline-none sm:rounded-r-none"
            />
            <button
              type="submit"
              suppressHydrationWarning
              className="flex items-center justify-center gap-2 rounded-lg bg-copper px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-sienna sm:rounded-l-none"
            >
              Subscribe <Send className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-4 text-sm text-brown-500">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
}
