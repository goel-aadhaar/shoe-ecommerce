import React from "react";

const AdCard2 = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-5 px-4 sm:px-10 lg:px-24 bg-white text-black">
      
      {/* LEFT PART>>>> */}
      <div>
        <img
          src="https://www.superkicks.in/cdn/shop/files/IMG_4192.jpg?v=1753430478&width=2000"
          alt="Collab Room"
          className="w-full h-auto"
        />
      </div>

      
        {/* RIGHT PART>>>>>>> */}
      <div className="border border-slate-300 grid grid-cols-3">
        {/* Row 1 */}
        <div className="flex items-center justify-center">
          <img
            src="https://www.superkicks.in/cdn/shop/files/Adidas_57d5602a-2686-4892-aaba-a1489455d32d.jpg?v=1750840064"
            alt="Puma"
            className="w-full h-auto object-cover"
          />
        </div>
        <TextBox
          title='Nike'
          content="The legacy of Nike in running style silhouettes is unmatched with tried and tested performance and iconic design."
        />

        <div className="flex items-center justify-center">
          <img
            src="https://www.superkicks.in/cdn/shop/files/Nike_ca3789db-7902-4275-90d2-32ade114edef.jpg?v=1750840091"
            alt="ASAP Rocky"
            className="w-full h-auto object-cover m-0 p-0"
          />
        </div>

       <TextBox
          title="ASICS"
          content = "Adizero EVO SL is already making waves with runners and non runners alike, powered by the world Lightstrike pro foam."
        />


        
         <div className="flex items-center justify-center">
          <img
            src="https://www.superkicks.in/cdn/shop/files/Asics_1.jpg?v=1750844289"
            alt="Avavav"
            className="w-full h-auto object-cover"
          />
        </div>
        <TextBox
          title="Adidas"
          content = "A sound body & mind begins with sound movement, dive into early retrofuturistic aesthetics and the crowd favourite Gel Tech."
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
export default AdCard2;
