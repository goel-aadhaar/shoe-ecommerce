import React from "react";

const ShimmerShoeDetail = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 animate-pulse">
      {/* Left side - product images */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-200 rounded-xl h-72"></div>
        <div className="bg-gray-200 rounded-xl h-72"></div>
        <div className="bg-gray-200 rounded-xl h-72"></div>
        <div className="bg-gray-200 rounded-xl h-72"></div>
      </div>

      {/* Right side - product details */}
      <div className="flex flex-col gap-4">
        {/* Brand & Name */}
        <div className="h-6 bg-gray-200 rounded w-40"></div>
        <div className="h-8 bg-gray-200 rounded w-72"></div>
        <div className="h-4 bg-gray-200 rounded w-52"></div>

        {/* Price */}
        <div className="h-6 bg-gray-200 rounded w-24"></div>

        {/* Sizes */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-10 bg-gray-200 rounded"></div>
          ))}
        </div>

        {/* Add to Cart button */}
        <div className="h-12 bg-gray-300 rounded w-full"></div>

        {/* Delivery Info */}
        <div className="h-4 bg-gray-200 rounded w-48"></div>
        <div className="h-4 bg-gray-200 rounded w-40"></div>

        {/* About Product */}
        <div className="h-5 bg-gray-200 rounded w-32"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

export default ShimmerShoeDetail;
