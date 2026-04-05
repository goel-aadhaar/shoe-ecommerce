'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { productService } from '@/services/product.service';
import { ProductCard } from '@/components/features/products/product-card';
import type { Product } from '@/types';

import 'swiper/css';

interface FeaturedProductsProps {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  fetchType: 'all' | 'brand' | 'gender' | 'category';
  fetchKey?: string;
  limit?: number;
  page?: number;
}

export function FeaturedProducts({
  title,
  subtitle,
  viewAllHref,
  fetchType,
  fetchKey,
  limit = 10,
  page = 1,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    let fetcher;
    switch (fetchType) {
      case 'brand':
        fetcher = productService.getByBrand(fetchKey!, limit);
        break;
      case 'gender':
        fetcher = productService.getByGender(fetchKey!, limit);
        break;
      case 'category':
        fetcher = productService.getByCategory(fetchKey!, limit);
        break;
      default:
        fetcher = productService.getAll(page, limit);
        break;
    }

    fetcher
      .then((res) => {
        const data = res.data;
        setProducts(Array.isArray(data) ? data : (data as { items: Product[] }).items ?? []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [fetchType, fetchKey, limit, page]);

  function updateNav() {
    if (!swiperRef.current) return;
    setCanPrev(!swiperRef.current.isBeginning);
    setCanNext(!swiperRef.current.isEnd);
  }

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container-inner">
          <div className="h-8 w-48 animate-pulse rounded bg-brown-100" />
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square animate-pulse rounded-xl bg-brown-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-brown-100" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-brown-100" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-inner">
        {/* Section header */}
        <div className="flex items-end justify-between">
          <div>
            {subtitle && (
              <p className="text-sm font-bold uppercase tracking-widest text-copper">
                {subtitle}
              </p>
            )}
            <h2 className="mt-2 font-serif text-3xl font-bold text-brown-900">
              {title}
            </h2>
            <div className="mt-3 h-0.5 w-12 rounded-full bg-copper" />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                disabled={!canPrev}
                className="product-slider-btn"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                disabled={!canNext}
                className="product-slider-btn"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <Link
              href={viewAllHref}
              className="text-sm font-bold text-copper transition-colors hover:text-sienna"
            >
              View All &rarr;
            </Link>
          </div>
        </div>

        {/* Product slider */}
        <div className="mt-10">
          <Swiper
            modules={[Navigation]}
            onSwiper={(s) => { swiperRef.current = s; updateNav(); }}
            onSlideChange={updateNav}
            spaceBetween={20}
            slidesPerView={1.4}
            breakpoints={{
              480: { slidesPerView: 2.2, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 24 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
          >
            {products.map((p) => (
              <SwiperSlide key={p._id}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
