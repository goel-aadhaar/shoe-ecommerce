import React, { useState } from "react";

import CardCarousel from "../carouselCardList/caroselCard";
const TrendingSection = () => {

  console.log("trending.jsx called");
  
  return (
    <div className="bg-white text-black py-10">
      {/* Heading */}
      <h1 className="text-center font-bold text-3xl mb-5 mr-10 pr-10">TRENDING</h1>

      {/* Tabs + View All */}
      <div className="flex items-center justify-between">
        <div></div>
        <GenderTabs />
        <a
          href="#"
          className="text-sm mr-10 font-semibold underline underline-offset-4"
        >
          VIEW ALL
        </a>
      </div>

      {/* Carousel */}
      <CardCarousel />
    </div>
  );
};


function GenderTabs() {
  const [active, setActive] = useState("men");

  return (
    <div className="flex flex-col items-center">
      {/* Tabs */}
      <div className="flex space-x-10 text-2xl font-bold">
        <button
          onClick={() => setActive("men")}
          className={`${active === "men" ? "text-black" : "text-gray-500"}`}
        >
          MEN
        </button>
        <button
          onClick={() => setActive("women")}
          className={`${active === "women" ? "text-black" : "text-gray-500"}`}
        >
          WOMEN
        </button>
      </div>

      {/* Underline */}
      <div className="flex mt-2 w-40">
        <div
          className={`h-1 w-1/2 transition-all duration-500 ${
            active === "men" ? "bg-red-600" : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`h-1 w-1/2 transition-all duration-500 ${
            active === "women" ? "bg-red-600" : "bg-gray-300"
          }`}
        ></div>
      </div>
    </div>
  );
}

export default TrendingSection