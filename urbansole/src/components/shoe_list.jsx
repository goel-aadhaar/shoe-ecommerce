<<<<<<< HEAD
import React from 'react';
=======
import React from 'react'


>>>>>>> 20ba58c3cdaeb8c2ab195545e8bb20937cd557e3
import { Shoe_Card } from "./shoe_card";

<<<<<<< HEAD
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
=======
function ShoeList({props}) {
  console.log(Array.isArray(props));

  return (
    <>
      <div className="w-full px-20 py-12 mb-10 bg-white">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-5 gap-y-7">
            {props.map((shoe, index) => (
              <Shoe_Card key={index} {...shoe} />
            ))}
          </div>
>>>>>>> 20ba58c3cdaeb8c2ab195545e8bb20937cd557e3
      </div>
    </>
  );
}

export default ShoeList;