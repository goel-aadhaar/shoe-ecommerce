'use client';

import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-black text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            URBANSOLE
          </h1>
          <p className="text-xl mb-8">
            Premium Footwear Collection
          </p>
          <button className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
            Shop Now
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Premium Shoe {item}</h3>
                  <p className="text-gray-600 mb-2">Description of shoe {item}</p>
                  <p className="text-2xl font-bold">₹{9999 + item * 1000}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Shoes', 'Crocs', 'New Arrival', 'Sale'].map((category) => (
              <div key={category} className="text-center p-6 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
