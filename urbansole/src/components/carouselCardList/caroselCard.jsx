import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Shoe_Card } from "../shoe_card";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {Link} from "react-router";

import data from "../../data/shoes.json"
import "swiper/css";
import "swiper/css/navigation";

export default function CardCarousel({onShoeClick, shoes = data}) {
  console.log("inside caroselCard   ", typeof onShoeClick);
  console.log("with data : ", shoes );
  
  // console.log(onShoeClick);

    return (
      <div className="relative w-full px-20 pt-10 pb-10 bg-white">
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".custom-next-card",
            prevEl: ".custom-prev-card",
          }}
          spaceBetween={20}
          slidesPerView={4}
          loop={true}
          className="w-full"
          breakpoints={{
            320: { slidesPerView: 1 },   // mobile
            640: { slidesPerView: 2 },   // small tablet
            980: { slidesPerView: 3 },  // tablet / small desktop
            1280: { slidesPerView: 4 },  // large desktop
          }}
        >
          {shoes.map((shoe, index) => (
            <SwiperSlide key={index}>
                <Link  key={shoe._id} 
                        to = {'/shoe/' + shoe._id}
                >
                  <Shoe_Card 
                      shoes = {shoe} 
                      onClick={() => onShoeClick(shoe)}
                  />
                </Link>
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
      <div className="custom-prev-card absolute top-1/2 left-5 z-10 -translate-y-1/2
        w-10 h-10 flex items-center justify-center
        bg-black text-white rounded-full cursor-pointer 
        hover:bg-slate-800">
        <ChevronLeft size={20} />
      </div>

      <div className="custom-next-card absolute top-1/2 right-5 z-10 -translate-y-1/2
        w-10 h-10 flex items-center justify-center
        bg-black text-white rounded-full cursor-pointer 
        hover:bg-slate-800">
        <ChevronRight size={20} />
      </div>
    </>
  );
}
