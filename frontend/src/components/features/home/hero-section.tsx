'use client';

import Link from 'next/link';
import { ArrowRight, Star, Truck, ShieldCheck } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brown-900">
      {/* Decorative background elements */}
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-copper/5" />
      <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-copper/5" />
      <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-copper/3" />

      <div className="relative container-inner">
        <div className="flex flex-col items-center py-20 text-center lg:py-28">
          <span className="inline-block rounded-full border border-copper/30 bg-copper/10 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-copper">
            Premium Collection 2025
          </span>

          <h1 className="mt-8 font-serif text-5xl font-bold leading-tight text-cream sm:text-6xl lg:text-7xl">
            Walk in{' '}
            <span className="text-copper">Confidence</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-brown-300 sm:text-lg">
            Discover handpicked footwear from the world&apos;s finest brands.
            Premium quality, timeless style, delivered to your doorstep.
          </p>

          {/* CTA */}
          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/collections/all"
              className="btn-primary"
            >
              Shop Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/brands"
              className="btn-outline"
            >
              Explore Brands
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex items-center gap-10 sm:gap-16">
            <div className="text-center">
              <p className="font-serif text-4xl font-bold text-cream">30+</p>
              <p className="mt-1 text-sm text-brown-400">Products</p>
            </div>
            <div className="h-12 w-px bg-brown-700" />
            <div className="text-center">
              <p className="font-serif text-4xl font-bold text-cream">8</p>
              <p className="mt-1 text-sm text-brown-400">Top Brands</p>
            </div>
            <div className="h-12 w-px bg-brown-700" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 fill-copper text-copper" />
                <p className="font-serif text-4xl font-bold text-cream">4.5</p>
              </div>
              <p className="mt-1 text-sm text-brown-400">Avg Rating</p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex items-center gap-8 text-brown-400">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-copper" />
              <span className="text-sm">Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-copper" />
              <span className="text-sm">100% Authentic</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
