'use client';

import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

const STATS = [
  { value: '30+', label: 'Silhouettes' },
  { value: '08', label: 'Hyped Brands' },
  { value: '4.5', label: 'Avg Rating', star: true },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-ink text-bone">
      {/* Hairline grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-bone) 1px, transparent 1px), linear-gradient(90deg, var(--color-bone) 1px, transparent 1px)',
          backgroundSize: '7rem 7rem',
        }}
        aria-hidden
      />
      {/* Ghost word */}
      <span
        className="pointer-events-none absolute -right-10 bottom-[-3rem] select-none font-serif text-[34vw] leading-none text-bone/[0.03] sm:bottom-[-6rem]"
        aria-hidden
      >
        SOLE
      </span>
      {/* Cobalt corner wash */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-cobalt/20 blur-[120px]" />

      <div className="relative container-inner">
        <div className="grid gap-10 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28">
          {/* Left rail */}
          <div className="flex items-start gap-4 lg:col-span-1">
            <span className="reveal reveal-1 hidden font-mono text-[11px] uppercase tracking-[0.3em] text-bone/40 [writing-mode:vertical-rl] lg:block">
              Drop 01 — SS&apos;25
            </span>
          </div>

          {/* Headline */}
          <div className="lg:col-span-8">
            <p className="reveal reveal-1 section-tag text-volt">
              Premium Collection 2025
            </p>

            <h1 className="mt-6 font-serif text-[clamp(3.5rem,12vw,11rem)] leading-[0.82]">
              <span className="reveal reveal-2 block">Walk In</span>
              <span className="reveal reveal-3 block text-cobalt">
                Confidence
                <span className="ml-2 inline-block h-[0.15em] w-[0.15em] translate-y-[-0.1em] bg-volt align-baseline" />
              </span>
            </h1>

            <p className="reveal reveal-4 mt-8 max-w-md font-sans text-base leading-relaxed text-bone/60">
              Handpicked footwear from the world&apos;s loudest brands.
              Authentic only. Built for the street, engineered to be seen.
            </p>

            {/* CTA */}
            <div className="reveal reveal-5 mt-10 flex flex-wrap items-center gap-4">
              <Link href="/collections/all" className="btn-primary">
                Shop The Drop
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/brands" className="btn-outline on-dark">
                Explore Brands
              </Link>
            </div>
          </div>

          {/* Stats column */}
          <div className="reveal reveal-6 flex flex-row gap-10 lg:col-span-3 lg:flex-col lg:items-end lg:gap-12 lg:border-l lg:border-bone/10 lg:pl-8">
            {STATS.map((s) => (
              <div key={s.label} className="lg:text-right">
                <div className="flex items-center gap-1.5 lg:justify-end">
                  {s.star && (
                    <Star className="h-6 w-6 fill-volt text-volt" />
                  )}
                  <p className="font-serif text-5xl leading-none text-bone sm:text-6xl">
                    {s.value}
                  </p>
                </div>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/40">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom marquee */}
      <div className="border-t border-bone/10">
        <div className="marquee py-4">
          {[0, 1].map((dup) => (
            <div className="marquee__track" key={dup} aria-hidden={dup === 1}>
              {[
                'NIKE',
                'JORDAN',
                'ADIDAS',
                'NEW BALANCE',
                'PUMA',
                'CONVERSE',
                'VANS',
                'CROCS',
              ].map((b) => (
                <span
                  key={`${dup}-${b}`}
                  className="flex items-center gap-8 px-8 font-serif text-3xl uppercase text-bone/30 transition-colors hover:text-volt sm:text-4xl"
                >
                  {b}
                  <span className="inline-block h-2 w-2 shrink-0 bg-cobalt" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
