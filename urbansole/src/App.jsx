import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ImageSlider from './components/ImageSlider';
import LoginModal from './components/LoginModal';
import Footer from './components/footer';
import ShoeList from './components/shoe_list';
import BrandCarousel from './components/brandCardCarousel';
// import shoes from "./data/shoes.json"
// import Brand from "./components/brandPage/brand"
import FilterBar from './components/filter';
// import CardCarousel from './components/carouselCardList/caroselCard';
import TrendingSection from './components/trending-section/trending';
import Home from './components/home-page/home-page';

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <>
            <div className='bg-white'>
                <Navbar onProfileClick={toggleModal} />
                <ImageSlider />
                <LoginModal isOpen={isModalOpen} onClose={toggleModal} />
            </div>
            
            <Home/>
            <Footer/>
        </>
    );
}

export default App;