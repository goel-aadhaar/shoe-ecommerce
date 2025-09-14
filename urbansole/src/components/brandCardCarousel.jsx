import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronRight, ChevronLeft } from "lucide-react";

import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

export default function BrandCarousel() {
  const brands = [
    {
      name: "Puma",
      link : "#",
      bg: "https://www.superkicks.in/cdn/shop/files/Puma_371fcf9b-63ae-4fb8-816c-6e10c2e863da.jpg?v=1755081312",
      logo: "https://www.superkicks.in/cdn/shop/files/0_1b00f53a-1b00-429c-8f9c-fb8cef60de39.png?v=1747660669",
    },
    {
      name: "Adidas Originals",
      link : "#",
      bg: "https://www.superkicks.in/cdn/shop/files/Adidas_ca63a075-a68e-4167-8f99-08ff5a81d4ae.jpg?v=1755081300",
      logo: "https://www.superkicks.in/cdn/shop/files/2_de6e99f3-bcae-48cf-8316-c9e40948a3ad.png?v=1747660734",
    },
    {
      name: "Nike",
      link : "#",
      bg: "https://www.superkicks.in/cdn/shop/files/Nike_4c272695-6369-4039-92b6-b497425de639.jpg?v=1755081263",
      logo: "https://www.superkicks.in/cdn/shop/files/1_f24f4178-f986-4e8a-bc98-407bc1e94f5c.png?v=1747660497",
    },
    {
      name: "New Balance",
      link : "#",
      bg: "https://www.superkicks.in/cdn/shop/files/NB_c5174975-e857-4ed7-91e1-e10fec8cf7ff.jpg?v=1755081284",
      logo: "https://www.superkicks.in/cdn/shop/files/NB.png?v=1750768116",
    },
    {
      name: "Jordan",
      link: "#",
      bg: "https://www.superkicks.in/cdn/shop/files/Jordan.jpg?v=1755081239",
      logo: "https://www.superkicks.in/cdn/shop/files/jordan_5591727c-ca4b-4b62-a6f7-b076f16378c1.png?v=1750768108",
    },
  ];

  return (
    <div className="relative w-full px-20 pt-20 pb-10 bg-white">
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        spaceBetween={4}
        slidesPerView={4}
        loop={true}
        className="w-full"
        breakpoints={{
          320: { slidesPerView: 1 },   // mobile
          640: { slidesPerView: 2 },   // small tablet
          1000: { slidesPerView: 3 },  // tablet / small desktop
          1280: { slidesPerView: 4 },  // large desktop
        }}
      >
        {brands.map((brand, index) => (
          <SwiperSlide key={index}>
            <a
              href={brand.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative group overflow-hidden rounded-sm"
            >
              {/* Background Image */}
              <img
                src={brand.bg}
                alt={brand.name}
                className="w-full h-[480px] object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>

              {/* Centered Logo */}
              <img
                src={brand.logo}
                alt={`${brand.name} logo`}
                className="absolute inset-0 m-auto h-20 object-contain opacity-90"
              />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom buttons */}
      <CustomChevronBtn/>
    </div>
  );
}


const CustomChevronBtn =  ()=>{
  return (
    <>
      <div className="custom-prev absolute top-1/2 left-5 z-10 -translate-y-1/2
        w-10 h-10 flex items-center justify-center
        bg-black text-white rounded-full cursor-pointer 
        hover:bg-slate-800">
        <ChevronLeft size={20} />
      </div>

      <div className="custom-next absolute top-1/2 right-5 z-10 -translate-y-1/2
        w-10 h-10 flex items-center justify-center
        bg-black text-white rounded-full cursor-pointer 
        hover:bg-slate-800">
        <ChevronRight size={20} />
      </div>
    </>
  );
}
