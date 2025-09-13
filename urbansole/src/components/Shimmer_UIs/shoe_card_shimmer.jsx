import React from 'react';

const ShimmerShoeCard = () => {
    return (
        <div className="max-w-[300px]  overflow-hidden shadow-md transition border border-slate-200 animate-pulse">
            <div className="aspect-square w-full bg-gray-200"></div>

            <div className="p-2 pb-0">
                <div className="flex justify-between items-center text-gray-600">
                    <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                </div>

                <div className="h-4 w-3/4 bg-gray-200 rounded mt-2"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded mt-2"></div>
                
                <div className="h-4 w-1/4 bg-gray-200 rounded mt-3 mb-2"></div>
            </div>
        </div>
    );
};

export default ShimmerShoeCard;