import React from 'react';

const ShimmerShoeCard = () => {
    return (
        <>
            <style>
                {`
                @keyframes radial-shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
                .shimmer-bg {
                    background-color: #f6f7f8;
                    background-image: radial-gradient(
                        circle at center, 
                        rgba(255, 255, 255, 0.6) 0%, 
                        rgba(224, 224, 224, 0.6) 50%, 
                        rgba(246, 247, 248, 0.6) 100%
                    );
                    background-repeat: no-repeat;
                    background-size: 200% 100%;
                    animation: radial-shimmer 2s ease-in-out infinite;
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