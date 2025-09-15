


const BrandsLogoPage = () => {
  const brands = [
    { name: 'adidas originals', logoUrl: 'https://www.superkicks.in/cdn/shop/files/adidas-2.jpg?v=1676975827' },
    { name: 'Jordan', logoUrl: 'https://www.superkicks.in/cdn/shop/files/5_20_41979b03-73cb-4e80-b37e-8ae116cf1daf.jpg?v=1682078538' },
    { name: 'New Balance', logoUrl: 'https://www.superkicks.in/cdn/shop/files/2_1494e5ed-1065-4e73-a1b3-8e45f5e65850.jpg?v=1676981850' },
    { name: 'Puma', logoUrl: 'https://www.superkicks.in/cdn/shop/files/2_0275c63f-7773-4b62-a70c-8c612106e9b4.jpg?v=1676982082' },
    { name: 'Nike', logoUrl: 'https://www.superkicks.in/cdn/shop/files/1_b6e8d3cf-15cf-4c8f-84c6-d989f1545c47.jpg?v=1676981991' },
    { name: 'Reebok', logoUrl: 'https://www.superkicks.in/cdn/shop/files/2_c3093f46-220a-4417-80e3-fa7be338a6d4.jpg?v=1676982116' },
    { name: 'Asics', logoUrl: 'https://www.superkicks.in/cdn/shop/files/BRAND-LOGO_36fc406d-4434-4e09-875b-8e791f867918.jpg?v=1748336264' },
    { name: 'Aries', logoUrl: 'https://www.superkicks.in/cdn/shop/files/aries.jpg?v=1755503911' },
    { name: 'Almost Gods', logoUrl: 'https://www.superkicks.in/cdn/shop/files/ALMOST-GODS.jpg?v=1735801735' },
    { name: 'Billionaire Boys Club', logoUrl: 'https://www.superkicks.in/cdn/shop/files/BBC_BRAND_LOGO_b22883f2-f440-4f2d-bac8-3e764a7b73ba.png?v=1703662131' },
    { name: 'Birkenstock', logoUrl: 'https://www.superkicks.in/cdn/shop/files/LOGOS_FOR_WEBSITE.png?v=1694416326' },
    { name: 'Carhartt', logoUrl: 'https://www.superkicks.in/cdn/shop/files/carharrt.jpg?v=1751969937' },
    { name: 'Clarks Originals', logoUrl: 'https://www.superkicks.in/cdn/shop/files/3_45.jpg?v=1677058613' },
    { name: 'Converse', logoUrl: 'https://www.superkicks.in/cdn/shop/files/1_73.jpg?v=1677058615' },
    { name: 'Crocs', logoUrl: 'https://www.superkicks.in/cdn/shop/files/1_6e576934-ed27-4b5c-8c71-466453763f24.jpg?v=1676902896' },
  ];

  return (
    <>

    <div className="flex flex-col items-center justify-center min-h-screen text-gray-100 bg-white p-8 my-10">
      {/* <h2 className="text-4xl font-extrabold text-center mb-8 tracking-wide text-transparent text-white">Brands</h2> */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-6xl mx-auto my-2">
        {brands.map((brand, index) => (
          <div key={index} className="rounded-xl p-8 flex flex-col items-center justify-center text-center transition-transform transform hover:scale-105">
            <div className="cursor-pointer w-30 h-30 mb-1 overflow-hidden flex items-center justify-center">
              <img src={brand.logoUrl} alt={`${brand.name} logo`} className="w-full h-full object-contain" />
            </div>
            <p className="text-lg font-semibold text-black">{brand.name}</p>
          </div>
        ))}
      </div>
    </div>

    </>
  );
};
export default BrandsLogoPage;