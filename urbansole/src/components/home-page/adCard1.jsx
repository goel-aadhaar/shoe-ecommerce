import React from "react";

const AdCard = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-5 px-4 sm:px-10 lg:px-20 bg-white text-black py-7">
      
      {/* LEFT PART>>>> */}
      <div>
        <img
          src="https://www.superkicks.in/cdn/shop/files/collab-room-desktop_ff0214b9-1e33-489a-96aa-23566e7b2b16.gif?v=1750772114"
          alt="Collab Room"
          className="w-full h-auto"
        />
      </div>

      
        {/* RIGHT PART>>>>>>> */}
      <div className="border border-slate-300 grid grid-cols-3">
        {/* Row 1 */}
        <div className="flex items-center justify-center">
          <img
            src="https://www.superkicks.in/cdn/shop/files/Puma.jpg?v=1750840897"
            alt="Puma"
            className="w-full h-auto object-cover"
          />
        </div>
        <TextBox/>

        <div className="flex items-center justify-center">
          <img
            src="https://www.superkicks.in/cdn/shop/files/Asap.jpg?v=1750840907"
            alt="ASAP Rocky"
            className="w-full h-auto object-cover m-0 p-0"
          />
        </div>

       
        <TextBox/>


        
         <div className="flex items-center justify-center">
          <img
            src="https://www.superkicks.in/cdn/shop/files/avavav.jpg?v=1750840902"
            alt="Avavav"
            className="w-full h-auto object-cover"
          />
        </div>
        <TextBox/>
      </div>
    </div>
  );
};

function TextBox() {
  return (
    <div className="flex flex-col justify-center p-4 text-center">
      <h1 className="text-sm font-bold">PUMA X A$AP Rocky</h1>
      <p className="text-sm mt-2">A$AP Rocky is back again with progressive graphics and utilitarian streetwear in his capsule drop with PUMA.</p>
    </div>
  );
}

export default AdCard;
