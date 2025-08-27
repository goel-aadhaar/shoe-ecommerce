import React from 'react';
import { Shoe_Card } from './shoe_card';

const parsePrice = (priceStr) => {
    if (typeof priceStr !== 'string') return 0;
    return Number(priceStr.replace(/[^0-9.-]+/g, ""));
};

const ShoeDetail = ({ shoe, allShoes, onBack, onRelatedShoeClick }) => {
    const images = Object.keys(shoe)
        .filter(key => key.startsWith('imgSrc') && shoe[key])
        .map(key => shoe[key]);

    // ** NEW LOGIC: Find related shoes from the SAME BRAND **
    const relatedShoes = allShoes
        .filter(s =>
            // 1. Match the brand (making it case-insensitive for accuracy)
            s.brand.toLowerCase() === shoe.brand.toLowerCase() &&
            // 2. Exclude the exact same shoe you're currently viewing
            (s.name !== shoe.name || s.color !== shoe.color)
        )
        .slice(0, 4); // Show the first 4 matches

    return (
        <div className="bg-white text-black min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={onBack}
                    className="bg-gray-100 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center mb-8 shadow-sm border border-gray-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to All Shoes
                </button>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-2 gap-4">
                            {images.map((img, index) => (
                                <div key={index} className="bg-gray-100 border rounded-lg flex items-center justify-center">
                                    <img src={img} alt={`${shoe.name} view ${index + 1}`} className="object-contain w-full h-full rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <div className="sticky top-24">
                            <h2 className="text-xl font-bold uppercase text-gray-500">{shoe.brand}</h2>
                            <h1 className="text-3xl font-extrabold mt-2 text-gray-900">{shoe.name}</h1>
                            <p className="text-gray-600 mt-1">{shoe.color}</p>
                            <p className="text-3xl font-bold mt-6 text-gray-900">{shoe.price}</p>
                            <div className="mt-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-md font-semibold text-gray-800">Select Size (UK)</h3>
                                    <a href="#" className="text-sm text-indigo-600 hover:underline font-medium">Size Chart</a>
                                </div>
                                <div className="grid grid-cols-4 gap-2 mt-4">
                                    {['6', '7', '8', '9', '10', '11', '12'].map(size => (
                                        <button key={size} className="border border-gray-300 rounded py-3 text-center hover:border-black transition-colors duration-200">
                                            {size}
                                        </button>
                                    ))}
                                    <button className="border border-gray-200 bg-gray-50 rounded py-3 text-center text-gray-400 cursor-not-allowed" disabled>13</button>
                                </div>
                            </div>
                            <div className="mt-8 grid grid-cols-1 gap-4">
                                <button className="bg-black text-white font-bold py-4 rounded hover:bg-gray-800 transition-colors duration-300">ADD TO CART</button>
                            </div>
                        </div>
                    </div>
                </div>
                {relatedShoes.length > 0 && (
                    <div className="mt-24">
                        <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900">YOU MAY ALSO LIKE</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {relatedShoes.map((relatedShoe, index) => (
                                <Shoe_Card 
                                    key={`${relatedShoe.name}-${index}`} 
                                    {...relatedShoe}
                                    onClick={() => onRelatedShoeClick(relatedShoe)} 
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShoeDetail;