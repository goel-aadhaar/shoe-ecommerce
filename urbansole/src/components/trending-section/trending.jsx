import React, { useState, useEffect } from "react";
import CardCarousel from "../carouselCardList/caroselCard";
import axios from 'axios'
import ShimmerShoeCard from "../Shimmer_UIs/shoe_card_shimmer";

const TrendingSection = () => {
  const [active, setActive] = useState("Male"); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true)

  console.log("Trending carousel called.... ");

  
  const fetchShoes = async () => {  
    try {
      const response = 
        await axios.get("https://api-shoe-ecommerce.onrender.com/api/v1/products/filter/attribute",{
          params: {attribute: "trending", limit: 14}
        });
        setData(response?.data?.data);
    } catch (error) {
      console.error("Error fetching shoes data in trending section:", error);
    }finally{
      setLoading(false)
    }
  };
  
  useEffect(() => {
    fetchShoes();
  }, []);
  const arr = [0,0,0,0];
  
  if (loading || data.length < 4) {
    return(
      <>
          <div className="w-full mx-auto px-24 py-12 bg-white">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-5 gap-y-7">
                  {arr.map((index) => (
                    <div Key={index}>     
                      <ShimmerShoeCard/>
                    </div>
                  ))}
              </div>
          </div>
      </>
    );
  }


  const filteredData  = data.filter((item) => item?.for === active);
  console.log("Filtered data in trending section : " ,filteredData.length);
  
  return (
    <div className="bg-white text-black py-10">
      <h1 className="text-center font-bold text-3xl mb-5 mr-10 pr-10">TRENDING</h1>
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

      <CardCarousel
        shoes={filteredData}
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
          onClick={() => setActive("Male")}
          className={`${active === "Male" ? "text-black" : "text-gray-500"}`}
        >
          MEN
        </button>
        <button
          onClick={() => setActive("Female")}
          className={`${active === "Female" ? "text-black" : "text-gray-500"}`}
        >
          WOMEN
        </button>
      </div>

      {/* Underline */}
      <div className="flex mt-2 w-40">
        <div
          className={`h-1 w-1/2 transition-all duration-500 ${
            active === "Male" ? "bg-red-600" : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`h-1 w-1/2 transition-all duration-500 ${
            active === "Female" ? "bg-red-600" : "bg-gray-300"
          }`}
        ></div>
      </div>
    </div>
  );
}

export default TrendingSection;