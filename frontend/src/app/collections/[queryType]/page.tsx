'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { productService } from '@/services/product.service';
import { ProductGrid } from '@/components/features/products/product-grid';
import { ProductFilters } from '@/components/features/products/product-filters';
import { ProductCardSkeleton } from '@/components/common/skeleton';
import type { Product, PaginationMeta } from '@/types';

const TITLES: Record<string, string> = {
  all: 'All Collections',
  men: "Men's Collection",
  women: "Women's Collection",
  shoes: 'Shoes',
  clogs: 'Clogs',
  trending: 'Trending',
  newArrival: 'New Arrivals',
  bestSeller: 'Best Sellers',
  onSale: 'On Sale',
  brand: 'Brand',
};

export default function CollectionsPage() {
  const { queryType } = useParams<{ queryType: string }>();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get('page') ?? '1');
  const brand = searchParams.get('brand') ?? '';
  const gender = searchParams.get('gender') ?? '';

  useEffect(() => {
    setLoading(true);
    let req: Promise<{ data: Product[] | { items: Product[]; pagination: PaginationMeta } }>;

    if (brand) {
      req = productService.getByBrand(brand, 50);
    } else if (gender) {
      req = productService.getByGender(gender, 50);
    } else if (queryType === 'all') {
      req = productService.getAll(page, 12);
    } else if (queryType === 'men') {
      req = productService.getByGender('Male', 50);
    } else if (queryType === 'women') {
      req = productService.getByGender('Female', 50);
    } else if (queryType === 'shoes' || queryType === 'clogs') {
      req = productService.getByCategory(queryType, 50);
    } else if (queryType === 'brand') {
      const b = searchParams.get('brand') ?? 'Nike';
      req = productService.getByBrand(b, 50);
    } else {
      // attribute-based: trending, newArrival, bestSeller, onSale
      req = productService.getByAttribute(queryType, 50);
    }

    req
      .then((res) => {
        if (Array.isArray(res.data)) {
          setProducts(res.data);
          setPagination(null);
        } else {
          setProducts(res.data.items);
          setPagination(res.data.pagination);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [queryType, page, brand, gender, searchParams]);

  const title =
    brand
      ? brand
      : gender
        ? `${gender === 'Male' ? "Men's" : "Women's"} Collection`
        : TITLES[queryType] ?? 'Collection';

  return (
    <div className="container-inner py-8 lg:py-12">
      <h1 className="font-serif text-3xl font-bold text-brown-900">{title}</h1>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <ProductFilters />
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <ProductGrid products={products} />
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <a
                        key={p}
                        href={`?page=${p}${brand ? `&brand=${brand}` : ''}${gender ? `&gender=${gender}` : ''}`}
                        className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                          p === pagination.page
                            ? 'bg-brown-800 text-cream'
                            : 'border border-brown-200 text-brown-700 hover:bg-brown-50'
                        }`}
                      >
                        {p}
                      </a>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
