'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { BRANDS } from '@/constants';
import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    setMobileOpen(false);
  }

  const Row = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-l-2 px-3 py-2 text-left font-mono text-xs uppercase tracking-[0.12em] transition-all ${
        active
          ? 'border-cobalt bg-ink text-bone'
          : 'border-transparent text-ink/60 hover:border-ink/30 hover:text-ink'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 ${active ? 'bg-volt' : 'bg-ink/20'}`}
        aria-hidden
      />
      {children}
    </button>
  );

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-ink/40">
          Gender
        </h4>
        <div className="mt-3 flex flex-col gap-0.5">
          {['', 'Male', 'Female'].map((g) => (
            <Row
              key={g}
              active={currentGender === g}
              onClick={() => updateFilter('gender', g)}
            >
              {g || 'All'}
            </Row>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-ink/40">
          Brand
        </h4>
        <div className="mt-3 flex max-h-60 flex-col gap-0.5 overflow-y-auto">
          <Row
            active={!currentBrand}
            onClick={() => updateFilter('brand', '')}
          >
            All Brands
          </Row>
          {BRANDS.map((b) => (
            <Row
              key={b}
              active={currentBrand === b}
              onClick={() => updateFilter('brand', b)}
            >
              {b}
            </Row>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="mb-2 flex lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex w-full items-center justify-center gap-2 border border-ink/20 px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-bone"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter Products
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative ml-auto h-full w-full max-w-xs overflow-y-auto bg-bone p-6">
            <div className="mb-8 flex items-center justify-between border-b border-ink/15 pb-4">
              <h3 className="font-serif text-3xl uppercase text-ink">
                Filters
              </h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-ink/50 transition-colors hover:text-cobalt"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-full shrink-0 lg:block lg:w-60">
        <div className="sticky top-28 border border-ink/15 bg-paper p-6">
          <h3 className="mb-6 border-b border-ink/15 pb-4 font-serif text-2xl uppercase text-ink">
            Filters
          </h3>
          <FilterContent />
        </div>
      </aside>
    </>
  );
}
