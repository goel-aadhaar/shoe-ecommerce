'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { BRANDS } from '@/constants';

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentBrand = searchParams.get('brand') ?? '';
  const currentGender = searchParams.get('gender') ?? '';

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <aside className="w-full space-y-6 rounded-lg border border-brown-200 bg-white p-5 lg:w-64 lg:shrink-0">
      <h3 className="font-serif text-lg font-bold text-brown-800">Filters</h3>

      {/* Gender */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-brown-500">
          Gender
        </h4>
        <div className="mt-2 flex flex-col gap-1.5">
          {['', 'Male', 'Female'].map((g) => (
            <button
              key={g}
              onClick={() => updateFilter('gender', g)}
              className={`rounded px-3 py-1.5 text-left text-sm transition-colors ${
                currentGender === g
                  ? 'bg-brown-800 text-cream'
                  : 'text-brown-700 hover:bg-brown-50'
              }`}
            >
              {g || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-brown-500">
          Brand
        </h4>
        <div className="mt-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          <button
            onClick={() => updateFilter('brand', '')}
            className={`rounded px-3 py-1.5 text-left text-sm transition-colors ${
              !currentBrand
                ? 'bg-brown-800 text-cream'
                : 'text-brown-700 hover:bg-brown-50'
            }`}
          >
            All Brands
          </button>
          {BRANDS.map((b) => (
            <button
              key={b}
              onClick={() => updateFilter('brand', b)}
              className={`rounded px-3 py-1.5 text-left text-sm transition-colors ${
                currentBrand === b
                  ? 'bg-brown-800 text-cream'
                  : 'text-brown-700 hover:bg-brown-50'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
