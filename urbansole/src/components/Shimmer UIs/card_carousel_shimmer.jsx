import React from 'react';

const ShimmerShoeCard = () => {
    console.log("call coming here in ");
    
    return (
        <div className="overflow-hidden shadow-md transition border border-slate-200 animate-shimmer">
            <style>
                {`
                @keyframes shimmer {
                    0% {
                        background-position: -200px 0;
                    }
                    100% {
                        background-position: 200px 0;
                    }
                }
                .animate-shimmer {
                    background: #f0f0f0;
                    background: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%);
                    background-size: 400px 100%;
                    animation: shimmer 1.2s infinite linear;
                }
                .bg-gray-200-custom {
                    background-color: #e5e7eb;
                }
                .rounded-custom {
                    border-radius: 0.25rem;
                }
                .w-full {
                    width: 100%;
                }
                .h-4 {
                    height: 1rem;
                }
                .h-3 {
                    height: 0.75rem;
                }
                .h-5 {
                    height: 1.25rem;
                }
                .w-1-4 {
                    width: 25%;
                }
                .w-3-4 {
                    width: 75%;
                }
                .w-1-2 {
                    width: 50%;
                }
                .aspect-square {
                    aspect-ratio: 1 / 1;
                }
                .mt-2 {
                    margin-top: 0.5rem;
                }
                .mt-3 {
                    margin-top: 0.75rem;
                }
                .mb-2 {
                    margin-bottom: 0.5rem;
                }
                .p-2 {
                    padding: 0.5rem;
                }
                .pb-0 {
                    padding-bottom: 0;
                }
                .shadow-md {
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                }
                .border {
                    border-width: 1px;
                }
                .border-slate-200 {
                    border-color: #e2e8f0;
                }
                `}
            </style>
            
            <div className="aspect-square w-full bg-gray-200-custom"></div>

            <div className="p-2 pb-0">
                <div className="flex justify-between items-center text-gray-600">
                    <div className="h-4 w-1-4 bg-gray-200-custom rounded-custom"></div>
                    <div className="h-5 w-5 bg-gray-200-custom rounded-custom"></div>
                </div>

                <div className="h-4 w-3-4 bg-gray-200-custom rounded-custom mt-2"></div>
                <div className="h-3 w-1-2 bg-gray-200-custom rounded-custom mt-2"></div>
                
                <div className="h-4 w-1-4 bg-gray-200-custom rounded-custom mt-3 mb-2"></div>
            </div>
        </div>
    );
};

export default ShimmerShoeCard;