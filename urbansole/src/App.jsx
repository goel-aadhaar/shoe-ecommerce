import React, { useState, useEffect } from 'react'; // Make sure to import useEffect
import { AuthProvider } from './components/context/AuthProvider';


import Navbar from './components/Navbar';
import ImageSlider from './components/ImageSlider';
import LoginModal from './components/LoginModal';
import Footer from './components/footer';
import ShoeList from './components/shoe_list';
import BrandCarousel from './components/brandCardCarousel';
import ShoeDetail from './components/shoeDetail';
import shoesData from './data/shoes.json';
import FilterBar from './components/filter';
import TrendingSection from './components/trending-section/trending';
import Home from './components/home-page/home-page';
import BrandFullPage from './components/brandPage/BrandFullPage';

import ProfilePage from './components/userProfilePage/profile';

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShoe, setSelectedShoe] = useState(null);


    useEffect(() => {
        const handlePopState = () => {
            // If the URL has no #shoe, it means we went back to the main page
            if (!window.location.hash.startsWith('#shoe')) {
                setSelectedShoe(null);
            }
        };

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
        <AuthProvider>
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
                    {/* <ProfilePage/> */}
                    <ImageSlider />

                    <LoginModal isOpen={isModalOpen} onClose={toggleModal} />
                    <BrandCarousel />
                    <Home onShoeClick={handleShoeClick} />
                </>
            )}
            
            <Footer />
        </AuthProvider>
    );
}

export default App;