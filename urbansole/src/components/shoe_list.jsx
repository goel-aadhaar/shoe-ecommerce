import React from 'react';
import { Shoe_Card } from "./shoe_card";

// 1. Removed the direct import of `shoes.json`.
// 2. The component now accepts `shoes` and `onShoeClick` as props.
function ShoeList({ shoes, onShoeClick }) {
  return (
    <>
      <div className="w-full mx-auto px-20 py-12 bg-white">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-5 gap-y-7">
          {/* Map over the 'shoes' prop and pass the click handler to each card */}
          {shoes.map((shoe, index) => (
            <Shoe_Card
              key={index}
              {...shoe}
              // When a card is clicked, it calls the handler with its shoe data
              onClick={() => onShoeClick(shoe)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default ShoeList;