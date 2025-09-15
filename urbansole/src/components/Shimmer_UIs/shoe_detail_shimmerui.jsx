import React from 'react';

export default function ShimmerShoeDetail() {
  return (
    <>
      {/* Custom styles for the shimmer effect */}
      <style>{`
        .shimmer-bg {
            background: #f0f0f0;
            background-image: linear-gradient(to right, #f0f0f0 0%, #e0e0e0 20%, #f0f0f0 40%, #f0f0f0 100%);
            background-size: 1000px 100%;
            animation: shimmer 1.5s infinite linear;
        }

        @keyframes shimmer {
            0% {
                background-position: -1000px 0;
            }
            100% {
                background-position: 1000px 0;
            }
        }
      `}</style>

      <body className="bg-gray-100">

        {/* Header Section */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-black rounded-full"></div>
              <span className="text-2xl font-bold text-black">URBANSOLE</span>
            </div>
            <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
              <a href="#" className="hover:text-black transition-colors duration-200">NEW ARRIVAL</a>
              <a href="#" className="hover:text-black transition-colors duration-200">SHOES</a>
              <a href="#" className="hover:text-black transition-colors duration-200">CROCKS</a>
              <a href="#" className="hover:text-black transition-colors duration-200">BRANDS</a>
              <a href="#" className="hover:text-black transition-colors duration-200">HOME</a>
              <a href="#" className="hover:text-black transition-colors duration-200 font-semibold text-red-500">SALE</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="text-gray-600 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button className="text-gray-600 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0-12a2 2 0 110 4 2 2 0 010-4zm-14 12a2 2 0 110 4 2 2 0 010-4z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Section - Shimmering placeholders */}
                <div className="space-y-4">
                    <div className="w-full h-96 rounded-2xl shimmer-bg"></div>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="w-full h-24 rounded-lg shimmer-bg"></div>
                        <div className="w-full h-24 rounded-lg shimmer-bg"></div>
                        <div className="w-full h-24 rounded-lg shimmer-bg"></div>
                        <div className="w-full h-24 rounded-lg shimmer-bg"></div>
                    </div>
                </div>

                {/* Product Details Section - Shimmering placeholders */}
                <div className="space-y-6">
                    <div className="w-1/4 h-6 rounded-md shimmer-bg"></div> {/* Brand */}
                    <div className="w-2/3 h-10 rounded-md shimmer-bg"></div> {/* Product Name */}
                    <div className="w-full h-4 rounded-md shimmer-bg"></div> {/* Color Description */}
                    <div className="w-1/4 h-8 rounded-md shimmer-bg"></div> {/* Price */}

                    <div className="space-y-2">
                        <div className="w-1/3 h-6 rounded-md shimmer-bg"></div> {/* "Select Size" text */}
                        <div className="flex space-x-2">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="w-12 h-12 rounded-lg shimmer-bg"></div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full h-12 rounded-full shimmer-bg"></div> {/* Add to Cart button */}

                    <div className="w-full h-10 rounded-lg shimmer-bg"></div> {/* Shipping Info */}
                    <div className="w-2/3 h-8 rounded-md shimmer-bg"></div> {/* Another section */}
                </div>
            </div>
        </main>
      </body>
    </>
  );
}
