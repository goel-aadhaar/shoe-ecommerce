import React from 'react'
import shoes from "../data/shoes.json";


import { Shoe_Card } from "./shoe_card";
 

function ShoeList() {
    
  return (
    <>
      <div className="w-full mx-auto px-20 py-12 mt-10 bg-white">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-5 gap-y-7">
            {shoes.map((shoe, index) => (
              <Shoe_Card key={index} {...shoe} />
            ))}
          </div>
      </div>

    </>
  );
}

export default ShoeList;