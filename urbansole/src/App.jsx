import React, { useState, useEffect } from 'react'; // Make sure to import useEffect
import Navbar from './components/Navbar';
import ImageSlider from './components/ImageSlider';
import LoginModal from './components/LoginModal';
import Footer from './components/footer';
import ShoeList from './components/shoe_list';
import BrandCarousel from './components/brandCardCarousel';
<<<<<<< HEAD
import ShoeDetail from './components/shoeDetail';
import shoesData from './data/shoes.json';
=======
// import shoes from "./data/shoes.json"
// import Brand from "./components/brandPage/brand"
import FilterBar from './components/filter';
// import CardCarousel from './components/carouselCardList/caroselCard';
import TrendingSection from './components/trending-section/trending';
import Home from './components/home-page/home-page';
>>>>>>> 20ba58c3cdaeb8c2ab195545e8bb20937cd557e3

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShoe, setSelectedShoe] = useState(null);

    // This new code block listens for the browser's back button
    useEffect(() => {
        const handlePopState = () => {
            // If the URL has no #shoe, it means we went back to the main page
            if (!window.location.hash.startsWith('#shoe')) {
                setSelectedShoe(null);
            }
        };
        // Add the event listener
        window.addEventListener('popstate', handlePopState);
        // Cleanup function to remove the listener
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []); // Empty array means this runs only once

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleShoeClick = (shoe) => {
        setSelectedShoe(shoe);
        // This adds an entry to the browser history, enabling the back button
        window.history.pushState({ shoeName: shoe.name }, '', `#shoe/${shoe.name.replace(/\s+/g, '-')}`);
        window.scrollTo(0, 0);
    };

    const handleBackToList = () => {
        // This tells the browser to go back one step in its history
        window.history.back();
    };

    return (
        <>
<<<<<<< HEAD
            <Navbar onProfileClick={toggleModal} />
            {selectedShoe ? (
                <ShoeDetail
                    shoe={selectedShoe}
                    allShoes={shoesData}
                    onBack={handleBackToList}
                    onRelatedShoeClick={handleShoeClick}
                />
            ) : (
                <>
                    <ImageSlider />
                    <LoginModal isOpen={isModalOpen} onClose={toggleModal} />
                    <BrandCarousel />
                    <ShoeList onShoeClick={handleShoeClick} shoes={shoesData} />
                </>
            )}
            <Footer />
=======
            <div className='bg-white'>
                <Navbar onProfileClick={toggleModal} />
                <ImageSlider />
                <LoginModal isOpen={isModalOpen} onClose={toggleModal} />
            </div>
            
            <Home/>
            <Footer/>
>>>>>>> 20ba58c3cdaeb8c2ab195545e8bb20937cd557e3
        </>
    );
}

export default App;