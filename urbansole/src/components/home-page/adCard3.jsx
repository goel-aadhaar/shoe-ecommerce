import React from "react";

const AdCard3 = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-5 px-4 sm:px-10 lg:px-20 bg-white text-black py-5">
      
        {/* Left PART>>>>>>> */}
        <div className="border border-slate-300 grid grid-cols-3">
            
            <div className="flex items-center justify-center">
            <img
                src="https://www.superkicks.in/cdn/shop/files/6_e4355b3b-cd51-4ae5-b790-934cfa75a71f.jpg?v=1733751675&width=533"
                alt="Puma"
                className="w-full h-auto object-cover"
            />
            </div>
            <TextBox
                title = 'T-shirts'
                content = "T shirts that dry quickly ‘cause it's drizzling one minute and flooding the next."
            />

            <div className="flex items-center justify-center">
            <img
                src="https://www.superkicks.in/cdn/shop/files/Shorts.jpg?v=1750840568"
                alt="ASAP Rocky"
                className="w-full h-auto object-cover m-0 p-0"
            />
            </div>

        
            <TextBox
                title = 'Slides'
                content = 'Slides for the inevitable potholes.'
            />


        
         <div className="flex items-center justify-center">
          <img
            src="https://www.superkicks.in/cdn/shop/files/T-shirt.jpg?v=1750840574"
            alt="Avavav"
            className="w-full h-auto object-cover"
          />
        </div>
        <TextBox
                title = 'Shorts'
                content = 'Shorts for comfortable outings and unexpected showers.'
            />

      </div>

      {/* RIght Part>> */}
      <div>
        <img
          src="https://www.superkicks.in/cdn/shop/files/IMG_4196.jpg?v=1753430049&width=2000"
          alt="Collab Room"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};

function TextBox({title, content}) {
  return (
    <div className="flex flex-col justify-center p-4 text-center">
      <h1 className="text-sm font-bold">{title}</h1>
      <p className="text-sm mt-2">{content}</p>
    </div>
  );
}

export default AdCard3;
