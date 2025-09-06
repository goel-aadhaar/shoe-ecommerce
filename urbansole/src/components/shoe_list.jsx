
import React from 'react'
import { Shoe_Card } from "./shoe_card";
import { Link } from 'react-router';


function ShoeList({ shoes, onShoeClick }){
    return(
      <>
        <div className="w-full mx-auto px-20 py-12 bg-white">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-5 gap-y-7">
                {shoes.map((shoe, index) => (
                  <Link
                    key={index}
                    to = {'/shoe' + shoe.id}
                  >
                    <Shoe_Card   
                      {...shoe}
                      onClick={() => onShoeClick(shoe)}
                    />
                  </Link>
                ))}
            </div>
        </div>
      </>

    );
}
  



export default ShoeList;