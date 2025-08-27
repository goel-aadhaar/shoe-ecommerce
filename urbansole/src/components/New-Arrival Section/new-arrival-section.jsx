import React, { useState } from "react";

import CardCarousel from "../carouselCardList/caroselCard";

const NewArrivalSection = () => {

  console.log("NewArrival.jsx called");
  
  return (
    <div className="bg-white text-black">
      {/* Heading */}
      <h1 className="text-center font-bold text-3xl mb-5 pt-10 mr-10 pr-10">NEW ARRIVAL</h1>

      {/* Tabs + View All */}
      <div className="flex items-center justify-between">
        <div></div>
        <TypeTab />
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


function TypeTab() {
  const [active, setActive] = useState("shoes");

  return (
    <div className="flex flex-col items-center">
      {/* Tabs */}
      <div className="flex space-x-10 text-2xl font-bold">
        <button
          onClick={() => setActive("shoes")}
          className={`${active === "shoes" ? "text-black" : "text-gray-500"}`}
        >
          SHOES
        </button>
        <button
          onClick={() => setActive("crocs")}
          className={`${active === "crocs" ? "text-black" : "text-gray-500"}`}
        >
          CROCS
        </button>
      </div>

      {/* Underline */}
      <div className="flex mt-2 w-40">
        <div
          className={`h-1 w-1/2 transition-all duration-500 ${
            active === "shoes" ? "bg-red-600" : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`h-1 w-1/2 transition-all duration-500 ${
            active === "crocs" ? "bg-red-600" : "bg-gray-300"
          }`}
        ></div>
      </div>
    </div>
  );
}

export default NewArrivalSection