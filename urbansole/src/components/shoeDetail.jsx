
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './context/AuthContext'; 
import { Link } from 'react-router';


import { Shoe_Card } from './shoe_card';
import shoeData from '../data/shoes.json';
import {useParams} from 'react-router';
import Navbar from './Navbar';
import Footer from './footer';
// import {chevron-left} from 'lucid-react';

// const parsePrice = (priceStr) => {
//     if (typeof priceStr !== 'string') return 0;
//     return Number(priceStr.replace(/[^0-9.-]+/g, ""));
// };

const ShoeDetail = ({onBack, onRelatedShoeClick }) => {
    const [selectedSize, setSelectedSize] = useState('');
    // const { token } = useContext(AuthContext);
    let token = true

    const parcal = useParams();
    let shoeArray = shoeData.filter(obj => obj.id == parcal.id)
    const shoe = shoeArray[0]
    const images = Object.keys(shoe)
        .filter(key => key.startsWith('imgSrc') && shoe[key])
        .map(key => shoe[key]);

    //  Find related shoes from the SAME BRAND 
    const relatedShoes = shoeData
        .filter(s =>
            // 1. Match the brand (making it case-insensitive for accuracy)
            s.brand.toLowerCase() === shoe.brand.toLowerCase() &&
            // 2. Exclude the exact same shoe you're currently viewing
            (s.name !== shoe.name || s.color !== shoe.color)
        )
        .slice(0, 4);

    

     const handleAddToCart = async () => {
        if (!token) {
            alert('Please log in to add items to your cart.');
            return;
        }
        if (!selectedSize) {
            alert('Please select a size.');
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
            };

            const body = {
                productId: parcal.id,
                selectedSize,
                quantity: 1,
            };

            await axios.post('/api/cart', body, config);
            alert('Item added to cart!');
            // You might want to update a global cart state or context here
        } catch (err) {
            console.error(err.response.data);
            alert('Error adding item to cart.');
        }
    };

    return (
        <>
        <Navbar/>
        <div className="bg-white text-black min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Link
                    key = {parcal.id}
                    to = {'/'}
                >
                <button
                    onClick={onBack}
                    className="bg-gray-100 text-gray-800 font-semibold py-2 px-4 mt-10 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center mb-8 shadow-sm border border-gray-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className=" h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to All Shoes
                </button>
                </Link>
                
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-2 gap-4">
                            {images.map((img, index) => (
                                <div key={index} className="bg-gray-100 border rounded-sm flex items-center justify-center">
                                    <img src={img} alt={`${shoe.name} view ${index + 1}`} className="object-contain w-full h-full rounded-sm" />
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
                                    {['7', '8', '9', '10', '11'].map(size => (
                                        <button
                                            key={size}
                                            // Add an onClick handler to update the selected size state
                                            onClick={() => setSelectedSize(size)}
                                            className={`border rounded py-3 text-center transition-colors duration-200 ${
                                                // Check if the current size in the loop matches the selectedSize state
                                                size === selectedSize
                                                    ? 'bg-black text-white border-black' // Classes for the selected state
                                                    : 'border-gray-300 hover:border-black' // Original classes for unselected state
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}

                                    <button className="border border-gray-200 bg-gray-50 rounded py-3 text-center text-gray-400 cursor-not-allowed" disabled>12</button>
                                </div>
                            </div>
                            <div className="mt-8 grid grid-cols-1 gap-4">
                                <button 
                                    onClick={handleAddToCart}
                                    className="bg-black text-white font-bold py-4 rounded hover:bg-gray-800 transition-colors duration-300">
                                            ADD TO CART
                                    </button>
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
        <Footer/>
        </>
    );
};

export default ShoeDetail;