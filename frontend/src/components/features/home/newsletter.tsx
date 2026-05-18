'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
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
    <section className="relative overflow-hidden bg-cobalt text-white section-padding">
      {/* Ghost word */}
      <span
        className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 select-none font-serif text-[24vw] leading-none text-white/[0.07]"
        aria-hidden
      >
        CLUB
      </span>

      <div className="relative container-inner">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-volt">
            Stay Updated
          </p>
          <h2 className="mt-5 font-serif text-[clamp(2.75rem,8vw,7rem)] leading-[0.85]">
            Join The
            <br />
            Urban Sole Club
          </h2>
          <p className="mx-auto mt-6 max-w-md font-sans text-sm leading-relaxed text-white/70">
            Early access to new drops, exclusive deals, and the loudest style
            intel — straight to your inbox.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row sm:gap-0"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              suppressHydrationWarning
              className="flex-1 border border-white/30 bg-transparent px-5 py-4 font-mono text-sm uppercase tracking-wider text-white placeholder:text-white/40 focus:border-volt focus:outline-none"
            />
            <button
              type="submit"
              suppressHydrationWarning
              className="group flex items-center justify-center gap-2 bg-volt px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-white"
            >
              Subscribe
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
