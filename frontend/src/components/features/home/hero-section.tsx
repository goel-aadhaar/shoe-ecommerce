import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brown-900 py-24 sm:py-32">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #faf6f1 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-copper">
          Established 2024
        </p>
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-cream sm:text-5xl lg:text-6xl">
          Timeless Footwear,
          <br />
          <span className="text-brown-300">Modern Style</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-brown-300">
          Discover our curated collection of premium shoes — where classic
          craftsmanship meets contemporary design.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/collections/all"
            className="rounded-md bg-copper px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition hover:bg-sienna"
          >
            Shop Collection
          </Link>
          <Link
            href="/collections/trending"
            className="rounded-md border border-brown-500 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-brown-200 transition hover:border-cream hover:text-cream"
          >
            Trending Now
          </Link>
        </div>
      </div>
    </section>
  );
}
