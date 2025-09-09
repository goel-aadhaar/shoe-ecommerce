import React, { useState } from "react";
import CardCarousel from "../carouselCardList/caroselCard";
import data from "../../data/shoes.json";

const TrendingSection = ({ onShoeClick }) => {
  const [active, setActive] = useState("male"); 
  console.log("Trending carousel called.... ");
  
  
  const filteredData = data.filter((item) => item.for === active);
  console.log(filteredData);
  

  return (
    <div className="bg-white text-black py-10">
      {/* Heading */}
      <h1 className="text-center font-bold text-3xl mb-5 mr-10 pr-10">TRENDING</h1>

      {/* Tabs + View All */}
      <div className="flex items-center justify-between">
        <div></div>
        <GenderTabs active={active} setActive={setActive} />
        <a
          href="#"
          className="text-sm mr-10 font-semibold underline underline-offset-4"
        >
          VIEW ALL
        </a>
      </div>

      {/* Carousel */}
      <CardCarousel
        shoes={filteredData}
        onShoeClick={onShoeClick}
      />
    </div>
  );
};

function GenderTabs({ active, setActive }) {
  return (
    <div className="flex flex-col items-center">
      {/* Tabs */}
      <div className="flex space-x-10 text-2xl font-bold">
        <button
          onClick={() => setActive("male")}
          className={`${active === "male" ? "text-black" : "text-gray-500"}`}
        >
          MEN
        </button>
        <button
          onClick={() => setActive("female")}
          className={`${active === "female" ? "text-black" : "text-gray-500"}`}
        >
          WOMEN
        </button>
      </div>

      {/* Underline */}
      <div className="flex mt-2 w-40">
        <div
          className={`h-1 w-1/2 transition-all duration-500 ${
            active === "male" ? "bg-red-600" : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`h-1 w-1/2 transition-all duration-500 ${
            active === "female" ? "bg-red-600" : "bg-gray-300"
          }`}
        ></div>
      </div>
    </div>
  );
}

export default TrendingSection;