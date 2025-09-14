import React from 'react';

const ShimmerShoeCard = () => {
    return (
        <>
            <style>
                {`

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
            `}
            </style>
            <div className="max-w-[300px] overflow-hidden shadow-md transition border border-slate-200">
                <div className="aspect-square w-full shimmer-bg"></div>

                <div className="p-2 pb-0">
                    <div className="flex justify-between items-center text-gray-600">
                        <div className="h-4 w-1/4 shimmer-bg rounded"></div>
                        <div className="h-5 w-5 shimmer-bg rounded"></div>
                    </div>

                    <div className="h-4 w-3/4 shimmer-bg rounded mt-2"></div>
                    <div className="h-3 w-1/2 shimmer-bg rounded mt-2"></div>
                    
                    <div className="h-4 w-1/4 shimmer-bg rounded mt-3 mb-2"></div>
                </div>
            </div>
        </>
    );
};

export default ShimmerShoeCard;