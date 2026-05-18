'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Star } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/pagination';

const TESTIMONIALS = [
  {
    name: 'Rahul Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'Absolutely love the quality! The leather feels premium and the fit is perfect. Best shoe purchase I have made online.',
    product: 'Puma Palermo Club',
  },
  {
    name: 'Priya Patel',
    location: 'Bangalore',
    rating: 5,
    text: 'Urban Sole has the best curation of brands. Fast delivery and the packaging was beautiful. Will definitely shop again!',
    product: 'New Balance 9060',
  },
  {
    name: 'Arjun Mehta',
    location: 'Delhi',
    rating: 4,
    text: 'Great selection of sneakers. The recommendation engine helped me find the perfect pair that matches my style.',
    product: 'Nike Air Max',
  },
  {
    name: 'Sneha Reddy',
    location: 'Hyderabad',
    rating: 5,
    text: 'The checkout process was smooth and I received my order in just 3 days. The shoes look even better in person!',
    product: 'Adidas Ultraboost',
  },
  {
    name: 'Vikram Singh',
    location: 'Pune',
    rating: 5,
    text: 'I have been buying from Urban Sole for months now. Consistent quality and great customer support. Highly recommended!',
    product: 'Jordan Retro 4',
  },
];

export function Testimonials() {
  return (
    <section className="scroll-reveal bg-bone section-padding">
      <div className="container-inner">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/15 pb-7">
          <div>
            <p className="section-tag text-ink/60">What People Say</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,7vw,6rem)] leading-[0.85] text-ink">
              On The Record
            </h2>
          </div>
          <p className="hidden font-mono text-xs uppercase tracking-[0.2em] text-ink/40 sm:block">
            {TESTIMONIALS.length} Verified Buyers
          </p>
        </div>

        <div className="mt-10">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{
              clickable: true,
              bulletClass: 'testimonial-bullet',
              bulletActiveClass: 'testimonial-bullet-active',
            }}
            spaceBetween={0}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            loop
            className="pb-16"
          >
            {TESTIMONIALS.map((t, idx) => (
              <SwiperSlide key={idx} className="!h-auto">
                <div className="flex h-full flex-col border border-ink/15 bg-paper p-8 transition-colors hover:border-ink sm:-ml-px">
                  <div className="flex items-start justify-between">
                    <span className="font-serif text-7xl leading-[0.6] text-cobalt">
                      &ldquo;
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < t.rating
                              ? 'fill-ink text-ink'
                              : 'text-ink/15'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="mt-4 flex-1 font-sans text-base leading-relaxed text-ink/75">
                    {t.text}
                  </p>

                  <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-cobalt">
                    {t.product}
                  </p>

                  <div className="mt-5 flex items-center gap-4 border-t border-ink/15 pt-5">
                    <span className="flex h-11 w-11 items-center justify-center bg-ink font-mono text-xs font-bold text-bone">
                      {t.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                    <div>
                      <p className="font-serif text-lg uppercase leading-none text-ink">
                        {t.name}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
                        {t.location}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
