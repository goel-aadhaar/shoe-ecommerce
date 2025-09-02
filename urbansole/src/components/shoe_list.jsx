import React from 'react'

import { Shoe_Card } from "./shoe_card";
 

function ShoeList({props}) {
  // console.log(props);
  
  // console.log(Array.isArray(props));

  return (
    <>
      <div className="w-full px-20 py-12 mb-10 bg-white">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-5 gap-y-7">
            {props.map((shoe, index) => (
              <Shoe_Card key={index} {...shoe} />
            ))}
          </div>
      </div>

    </>
  );
}

export default ShoeList;