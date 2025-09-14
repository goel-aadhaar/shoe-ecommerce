import React, { useState, useEffect, useCallback } from 'react';

const slidesData = [
    { image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=2787&auto=format&fit=crop", title: "AIR JORDAN 1", linkText: "Shop Now" },
    { image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=2787&auto=format&fit=crop", title: "AIR JORDAN 1", linkText: "Shop Now" },
    { image: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?q=80&w=2940&auto=format&fit=crop", title: "YEEZY BOOST", linkText: "Explore" },
    // { image: "https://images.unsplash.com/photo-1612181341173-16ea1571431b?q=80&w=2803&auto=format&fit=crop", title: "NIKE BLAZER", linkText: "Discover" },
    { image: "https://www.superkicks.in/cdn/shop/files/DESKTOP_4.png?v=1754650556", title: "", linkText: "" },
    { image: "https://www.superkicks.in/cdn/shop/files/PUMA-SPEEDCAT-BALLET-DESK-3.png?v=1756202343", title: "", linkText: "" },
    { image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg", title: "Nike", linkText: "Shop Here" }
];

const ImageSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => (prev === slidesData.length - 1 ? 0 : prev + 1));
    }, []);

    const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? slidesData.length - 1 : prev - 1));
    const goToSlide = (index) => setCurrentSlide(index);

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 5000);
        return () => clearInterval(slideInterval);
    }, [nextSlide]);

    return (
        <main className="relative mt-12 h-[100vh] overflow-hidden">
            <div className="relative w-full h-full">
                {slidesData.map((slide, index) => (
                    <div key={index} className="absolute w-full h-full transition-opacity duration-700 ease-in-out" style={{ opacity: index === currentSlide ? 1 : 0 }}>
                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover object-center" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/1920x1080/000000/FFFFFF?text=${slide.title.replace(/\s/g, '+')}`; }}/>
                        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                        <div className="absolute bottom-8 right-8 sm:bottom-16 sm:right-16 text-right">
                            <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-white leading-tight">{slide.title}</h2>
                            <a href="#" className="inline-block mt-4 text-lg md:text-xl font-bold text-white uppercase tracking-widest border-b-2 border-white hover:border-gray-300 hover:text-gray-300 transition-all">{slide.linkText}</a>
                        </div>
                    </div>
                ))}
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-row items-center z-20">
                <button onClick={prevSlide} className="p-2 text-white hover:text-gray-400 transition-colors" aria-label="Previous slide"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
                <div className="flex flex-row space-x-2 mx-4">
                    {slidesData.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className={`w-2 h-2 rounded-full border-2 border-white transition-colors ${index === currentSlide ? 'bg-white' : ''}`} aria-label={`Go to slide ${index + 1}`}></button>)}
                </div>
                <button 
                    onClick={nextSlide} 
                    className="p-2 text-white hover:text-gray-400 transition-colors" 
                    aria-label="Next slide"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>
        </main>
    );
};

export default ImageSlider;