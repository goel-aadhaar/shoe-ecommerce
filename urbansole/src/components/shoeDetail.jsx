import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Route } from 'react-router';
import { Link, useParams } from 'react-router-dom';

import { Shoe_Card } from './shoe_card';
import Navbar from './Navbar';
import Footer from './footer';

const CollapsibleItem = ({ title, isOpen, onClick, children, titleClassName }) => {
    return (
        <div className="border-b border-gray-200 last:border-b-0">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-4 focus:outline-none"
            >
                <span className={titleClassName}>{title}</span>
                <svg
                    className={`w-5 h-5 transform transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isOpen && (
                <div className="pb-4 text-gray-600 text-sm leading-relaxed">
                    {children}
                </div>
            )}
        </div>
    );
};


// --- Data for the new sections ---
const productInfoSections = [
    {
        key: 'about',
        title: 'ABOUT PRODUCT',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    },
    {
        key: 'details',
        title: 'PRODUCT DETAILS',
        content: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.'
    },
];

const faqs = [
    { question: "Why UrbanSole?", answer: "UrbanSole is a leading premium lifestyle retailer in India... Our goal is to bring the best of the world to you!" },
    { question: "When will I receive my order?", answer: "In most cases, your order will be delivered to you in 4-5 business days." },
    { question: "Can I return or exchange my order?", answer: "We offer exchanges and returns in cases of size mismatches or errors with your order. Please note, sale items are not eligible for return or exchange." }
];


const ShoeDetail = ({ onBack, onRelatedShoeClick }) => {
    const [selectedSize, setSelectedSize] = useState('');
    const [openSections, setOpenSections] = useState({}); // State for About/Details sections
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [shoe, setShoe] = useState({});
    
    const parcal = useParams();

    const fetchShoes = async () => {
        console.log("Fetching shoes data...");
        
        try {
            const response = await axios.get(`https://api-shoe-ecommerce.onrender.com/api/v1/products/${parcal.id}`);
            console.log("response from Shoe detail: ",response);
            console.log("SD : r.data: ", response?.data);
            setShoe(response?.data);
        } catch (error) {
            console.error("Error fetching shoes data in shoe detail section:", error);
        }
    };


    useEffect(() => {
        fetchShoes();
        window.scrollTo(0, 0);
    }, [parcal.id]); 

    if (!shoe) {
        // Route('/');
        return <div>Shoe not found.</div>;
    }

    // const images = Object.keys(shoe)
    //     .filter(key => key.startsWith('imgSrc') && shoe[key])
    //     .map(key => shoe[key]);

    // const relatedShoes = shoeData.filter(s => s.brand.toLowerCase() === shoe.brand.toLowerCase() && s.name !== shoe.name).slice(0, 4);
    
    // --- Single handler for all collapsible sections ---
    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAddToCart = async () => {
        if (!selectedSize) {
            alert('Please select a size.');
            return;
        }
        alert(`Added ${shoe.name} (Size: ${selectedSize}) to cart!`);
    };

    let images = []

    images.push(shoe?.imageSet?.thumbnail , shoe?.imageSet?.hover)

    shoe?.imageSet?.sides.forEach(img => {
        images.push(img);
    });

    console.log("All images in shoe deatil : ", images);


    if (!shoe) {
        return <div>Shoe not found.</div>;
    }

    // for now putting same data....
    let relatedShoes = [shoe]

    return (
        <>
            <Navbar />
            <div className="bg-white text-black min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 my-16">
                    <Link to={'/'}>
                        <button
                            onClick={onBack}
                            className="bg-gray-100 text-gray-800 font-semibold py-2 px-4 my-6 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center shadow-sm border border-gray-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Back to All Shoes
                        </button>
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                        <div className="lg:col-span-3">
                            <div className="grid grid-cols-2 gap-3">
                                {images.map((img, index) => (
                                    <div key={index} className="bg-gray-100 border rounded-lg flex items-center justify-center overflow-hidden">
                                        <img src={img} alt={`${shoe.name} view ${index + 1}`} className="object-cover w-full h-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="sticky top-24">
                                <h2 className="text-md font-bold uppercase text-gray-500 tracking-wider">{shoe.brand}</h2>
                                <h1 className="text-2xl font-bold mt-1 text-gray-900">{shoe.name}</h1>
                                <p className="text-gray-600 mt-1">{shoe.color}</p>
                                <p className="text-2xl font-semibold mt-4 text-gray-900">{shoe.price}</p>
                                
                                <div className="mt-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-gray-800">Select Size (UK)</h3>
                                        <a href="#" className="text-sm text-indigo-600 hover:underline font-medium">Size Chart</a>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mt-3">
                                        {['7', '8', '9', '10', '11'].map(size => (
                                            <button key={size} onClick={() => setSelectedSize(size)} className={`border rounded-md py-2.5 text-center transition-colors duration-200 ${size === selectedSize ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'}`}>
                                                {size}
                                            </button>
                                        ))}
                                        <button className="border border-gray-200 bg-gray-50 rounded-md py-2.5 text-center text-gray-400 cursor-not-allowed" disabled>12</button>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button onClick={handleAddToCart} className="bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300 w-full">
                                        ADD TO CART
                                    </button>
                                </div>

                                {/* --- Delivery Information Section --- */}
                                <div className="mt-6 space-y-3">
                                     <div className="flex items-center text-sm font-semibold text-gray-800">
                                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M10.681 1.055c.616-1.42 2.92-1.42 3.536 0l1.83 4.215 4.653.676c1.56.227 2.184 2.14.945 3.27l-3.367 3.28.795 4.635c.266 1.554-1.36 2.738-2.793 1.995l-4.16-2.187-4.16 2.187c-1.433.743-3.06-0.44-2.794-1.995l.796-4.635-3.367-3.28c-1.24-1.13-.615-3.043.945-3.27l4.653-.676 1.83-4.215z"/></svg>
                                         <span>Free express delivery</span>
                                     </div>
                                     <div className="border border-gray-200 rounded-lg p-3">
                                        {/* Content of the delivery box as per the image */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4h-8v-4h-4V9Z"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/></svg>
                                                <div className="flex items-center ml-2">
                                                    <span className="font-medium">110095</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 ml-1"><path d="M20 6 9 17l-5-5"/></svg>
                                                </div>
                                            </div>
                                            <button className="font-semibold text-red-500 text-sm hover:underline">CHANGE</button>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-700">Express delivery by <span className="font-semibold text-black">11th Sep</span> to <span className="font-semibold text-black">14th Sep</span></p>
                                    </div>
                                </div>
                                
                                {/* --- Collapsible Product Info Section --- */}
                                <div className="mt-4 border-t border-gray-200">
                                    {productInfoSections.map((section) => (
                                        <CollapsibleItem
                                            key={section.key}
                                            title={section.title}
                                            isOpen={!!openSections[section.key]}
                                            onClick={() => toggleSection(section.key)}
                                            titleClassName="font-bold text-sm tracking-wide text-gray-800"
                                        >
                                            <p>{section.content}</p>
                                            {section.key === 'jordan' && (
                                                <img src="https://i.imgur.com/3nTwesV.png" alt="Jordan Logo" className="w-24 h-auto mt-2" />
                                            )}
                                        </CollapsibleItem>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {relatedShoes.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-xl font-bold text-center mb-8 text-gray-900">YOU MAY ALSO LIKE</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {relatedShoes.map(rshoe =>  
                                    <Link
                                        key={rshoe.id}
                                        to ={'/shoe/' + rshoe.id}
                                    >
                                        <Shoe_Card 
                                            {...rshoe} 
                                            onClick={() => onRelatedShoeClick(rshoe)} 
                                        />

                                    </Link>
                                    )
                                }
                            </div>
                        </div>
                    )}

                    <div className="mt-16 max-w-3xl mx-auto">
                        <h2 className="text-xl font-bold text-center mb-6 text-gray-900">FAQs</h2>
                        <div className="border-t border-gray-200">
                            {faqs.map((faq, index) => (
                                <CollapsibleItem
                                    key={index}
                                    title={faq.question}
                                    isOpen={openFaqIndex === index}
                                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                    titleClassName="font-semibold text-md text-gray-800"
                                >
                                   <p>{faq.answer}</p>
                                </CollapsibleItem>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ShoeDetail;