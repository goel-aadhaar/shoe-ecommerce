'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
        setProducts(
          Array.isArray(data)
            ? data
            : (data as { items: Product[] }).items ?? []
        );
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
          <div className="h-10 w-64 animate-pulse bg-bone-deep" />
          <div className="mt-12 grid grid-cols-2 gap-px bg-ink/10 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-paper p-4">
                <div className="aspect-square animate-pulse bg-bone-deep" />
                <div className="mt-4 h-3 w-1/2 animate-pulse bg-bone-deep" />
                <div className="mt-3 h-5 w-2/3 animate-pulse bg-bone-deep" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="scroll-reveal section-padding">
      <div className="container-inner">
        {/* Section header */}
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/15 pb-7">
          <div>
            {subtitle && (
              <p className="section-tag text-ink/60">{subtitle}</p>
            )}
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,7vw,6rem)] leading-[0.85] text-ink">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                disabled={!canPrev}
                className="product-slider-btn"
                aria-label="Previous"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                disabled={!canNext}
                className="product-slider-btn"
                aria-label="Next"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            <Link
              href={viewAllHref}
              className="group flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:text-cobalt"
            >
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Product slider */}
        <div className="mt-10">
          <Swiper
            modules={[Navigation]}
            onSwiper={(s) => {
              swiperRef.current = s;
              updateNav();
            }}
            onSlideChange={updateNav}
            spaceBetween={16}
            slidesPerView={1.3}
            breakpoints={{
              480: { slidesPerView: 2.1, spaceBetween: 16 },
              768: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 4, spaceBetween: 16 },
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
