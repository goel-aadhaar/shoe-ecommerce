import React, { useState, useEffect } from "react";
import axios from "axios";
import CardCarousel from "../carouselCardList/caroselCard";
import ShimmerShoeCard from "../Shimmer_UIs/shoe_card_shimmer";
import { Key } from "lucide-react";


const NewArrivalSection = () => {

  const [active, setActive] = useState("shoes");
  const [data, setShoes] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchShoes = async () => {
    console.log("Fetching shoes data...");
    
    try {
      const response = await axios.get("https://api-shoe-ecommerce.onrender.com/api/v1/products");
      console.log("Fetched shoes data:", response);
      console.log("Fetched shoes data:", response.data);
      
      setShoes(response?.data?.data);
    } catch (error) {
      console.error("Error fetching shoes data:", error);
    }finally{
      setLoading(false)
    }
  };
  
  useEffect(() => {
    fetchShoes();
  }, []);

  console.log('before loading...');
  
  const arr = [0,0,0,0]
  if (loading || data.length < 4) {
    console.log('loading....');
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

  console.log("All shoes data:", data);
  const newArrivalData = data.filter(product =>
    product.attributes.includes("newArrival")
  );

  console.log(
    "Filtered shoes data for category newArrival :", newArrivalData
  );
  
  const filteredData  = newArrivalData.filter((item) => item.category.name === active);
  
  console.log("Filtered shoes data after category filter:", filteredData);


  return (
    <div className="bg-white text-black">

      <h1 className="text-center font-bold text-3xl mb-5 pt-10 mr-10 pr-10">NEW ARRIVAL</h1>

      <div className="flex items-center justify-between">
        <div></div>
        <TypeTab active={active} setActive={setActive} />
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


function TypeTab({ active, setActive }) {
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
          onClick={() => setActive("clogs")}
          className={`${active === "clogs" ? "text-black" : "text-gray-500"}`}
        >
          CLOGS
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

export default NewArrivalSection;