'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Star, Quote } from 'lucide-react';

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
    <section className="bg-brown-50 section-padding">
      <div className="container-inner">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-copper">
            What People Say
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-brown-900">
            Customer Stories
          </h2>
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
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            loop
            className="pb-14"
          >
            {TESTIMONIALS.map((t, idx) => (
              <SwiperSlide key={idx}>
                <div className="h-full rounded-2xl border border-brown-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                  <Quote className="h-8 w-8 text-brown-200" />

                  {/* Stars */}
                  <div className="mt-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < t.rating
                            ? 'fill-copper text-copper'
                            : 'text-brown-200'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="mt-4 text-base leading-relaxed text-brown-600">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  <span className="mt-4 inline-block rounded-full bg-brown-50 px-3 py-1 text-sm font-medium text-brown-500">
                    {t.product}
                  </span>

                  {/* Author */}
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-copper/10 font-serif text-sm font-bold text-copper">
                      {t.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-base font-bold text-brown-800">
                        {t.name}
                      </p>
                      <p className="text-sm text-brown-400">{t.location}</p>
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
