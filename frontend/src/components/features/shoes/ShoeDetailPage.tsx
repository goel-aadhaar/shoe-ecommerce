'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shoe_Card } from './shoe_card';
import ShimmerShoeDetail from './Shimmer_UIs/shoeDetailShimmer';

const CollapsibleItem = ({ title, isOpen, onClick, children, titleClassName }: {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
  titleClassName?: string;
}) => {
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
    { question: "How do I track my order?", answer: "You can track your order by visiting our website and clicking on the 'Track Order' link." },
    { question: "What is the return policy?", answer: "We offer a 30-day return policy for all unused items in their original packaging." },
];

export default function ShoeDetail() {
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeSection, setActiveSection] = useState('about');
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const pathParts = pathname.split('/');
        const productId = pathParts[pathParts.length - 1];
        
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/v1/products/${productId}`);
                setProduct(response.data.data);
                setError(null);
            } catch (err: any) {
                console.error("Error fetching product:", err);
                setError("Failed to fetch product details. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [pathname]);

    const handleAddToCart = async () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }

        try {
            const response = await axios.post(
                '/api/v1/cart',
                {
                    productId: product._id,
                    quantity,
                    size: selectedSize
                },
                { withCredentials: true }
            );
            
            alert('Product added to cart successfully!');
            router.push('/cart');
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            if (error.response?.status === 401) {
                alert('Please login to add items to cart');
                router.push('/login');
            } else {
                alert('Failed to add product to cart');
            }
        }
    };

    if (loading) {
        return <ShimmerShoeDetail />;
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-red-500 mb-4">Error</h2>
                    <p className="text-gray-600">{error || 'Product not found'}</p>
                    <Link href="/" className="mt-4 inline-block text-blue-500 hover:underline">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const sizes = ['6', '7', '8', '9', '10', '11'];
    const relatedProducts: any[] = []; // You can fetch related products based on category or brand

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white rounded-lg overflow-hidden">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {[product.image].map((img, index) => (
                                <div key={index} className="aspect-square bg-white rounded-lg overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-black">
                                    <img
                                        src={img}
                                        alt={`${product.name} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                            <p className="text-lg text-gray-600 mt-2">{product.brand}</p>
                            <div className="mt-4">
                                <span className="text-3xl font-bold text-black">₹{product.price}</span>
                                <span className="text-lg text-gray-500 line-through ml-2">₹{product.price * 1.5}</span>
                                <span className="text-lg text-green-600 ml-2">50% OFF</span>
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Select Size</h3>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 py-2 border rounded-md transition-colors ${
                                            selectedSize === size
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-300 hover:border-black'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                                >
                                    -
                                </button>
                                <span className="px-4 py-1 border border-gray-300 rounded-md">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors"
                        >
                            Add to Cart
                        </button>

                        {/* Product Details */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Product Details</h3>
                                <p className="text-gray-600">{product.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold">Brand:</span> {product.brand}
                                </div>
                                <div>
                                    <span className="font-semibold">Category:</span> {product.category}
                                </div>
                                <div>
                                    <span className="font-semibold">Gender:</span> {product.for}
                                </div>
                                <div>
                                    <span className="font-semibold">Color:</span> {product.color}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Information Tabs */}
                <div className="mt-12">
                    <div className="flex border-b border-gray-200">
                        {productInfoSections.map(section => (
                            <button
                                key={section.key}
                                onClick={() => setActiveSection(section.key)}
                                className={`px-6 py-3 text-sm font-medium transition-colors ${
                                    activeSection === section.key
                                        ? 'border-b-2 border-black text-black'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {section.title}
                            </button>
                        ))}
                    </div>
                    <div className="py-6">
                        {productInfoSections.map(section => (
                            activeSection === section.key && (
                                <div key={section.key} className="text-gray-600 leading-relaxed">
                                    {section.content}
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-2">
                        {faqs.map((faq, index) => (
                            <CollapsibleItem
                                key={index}
                                title={faq.question}
                                isOpen={openFAQ === index}
                                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                                titleClassName="font-medium text-gray-900"
                            >
                                {faq.answer}
                            </CollapsibleItem>
                        ))}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct: any) => (
                                <Link key={relatedProduct._id} href={`/shoe/${relatedProduct._id}`}>
                                    <Shoe_Card shoes={relatedProduct} />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
