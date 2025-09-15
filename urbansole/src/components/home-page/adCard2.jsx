import React from "react";

const AdCard2 = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-5 px-4 sm:px-10 lg:px-24 bg-white text-black">
      
      {/* LEFT PART>>>> */}
      <div>
        <img
          src="https://www.superkicks.in/cdn/shop/files/Beyond-Basics-Desk_1.gif?v=1756813270"
          alt="Collab Room"
          className="w-full h-auto"
        />
      </div>

      
        {/* RIGHT PART>>>>>>> */}
      <div className="border border-slate-300 grid grid-cols-3">
        {/* Row 1 */}
        <div className="flex items-center justify-center">
          <img
            src="https://www.superkicks.in/cdn/shop/files/3-june_b5d996fb-58d5-40f9-9469-5809743fbf3d.jpg?v=1756813726"
            alt="Puma"
            className="w-full h-auto object-cover"
          />
        </div>
        <TextBox
          title='Nike'
          content="The legacy of Nike in running style  nd tested performance and iconic design."
        />

        <div className="flex items-center justify-center">
          <img
            src="https://www.superkicks.in/cdn/shop/files/11-aug_1_a7883b13-08ad-4d60-96b6-9b08ffb9be43.png?v=1756813510"
            alt="ASAP Rocky"
            className="w-full h-auto object-cover m-0 p-0"
          />
        </div>

       <TextBox
          title="ASICS"
          content = "Adizero EVO SL is already makingwered by the world Lightstrike pro foam."
        />


        
         <div className="flex items-center justify-center">
          <img
            src="https://www.superkicks.in/cdn/shop/files/7_3e7197d3-8cd7-4642-8801-33167a0644f3.jpg?v=1756814202"
            alt="Avavav"
            className="w-full h-auto object-cover"
          />
        </div>
        <TextBox
          title="Adidas"
          content = "A sound body & mind begins with sound movement, dive into early avourite Gel Tech."
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
