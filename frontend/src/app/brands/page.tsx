import Link from 'next/link';
import { BRANDS } from '@/constants';

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-center font-serif text-4xl font-bold text-brown-900">
        Our Brands
      </h1>
      <p className="mt-4 text-center text-brown-500">
        Explore our curated selection of premium footwear brands.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {BRANDS.map((brand) => (
          <Link
            key={brand}
            href={`/collections/brand?brand=${encodeURIComponent(brand)}`}
            className="group flex flex-col items-center justify-center rounded-lg border-2 border-brown-200 bg-white p-8 transition-all hover:border-copper hover:shadow-lg"
          >
            <h2 className="font-serif text-2xl font-bold text-brown-700 group-hover:text-copper transition-colors">
              {brand}
            </h2>
            <span className="mt-3 text-xs font-medium uppercase tracking-wider text-copper opacity-0 transition-opacity group-hover:opacity-100">
              View Collection &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
