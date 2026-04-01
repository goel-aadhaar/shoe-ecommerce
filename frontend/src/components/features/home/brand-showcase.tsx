import Link from 'next/link';
import { BRANDS } from '@/constants';

export function BrandShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-center font-serif text-3xl font-bold text-brown-900">
        Our Brands
      </h2>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {BRANDS.map((brand) => (
          <Link
            key={brand}
            href={`/collections/brand?brand=${encodeURIComponent(brand)}`}
            className="flex items-center justify-center rounded-lg border border-brown-200 bg-white p-4 text-center font-serif text-sm font-semibold text-brown-700 transition-all hover:border-copper hover:text-copper hover:shadow-sm"
          >
            {brand}
          </Link>
        ))}
      </div>
    </section>
  );
}
