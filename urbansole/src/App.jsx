import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ImageSlider from './components/ImageSlider';
import LoginModal from './components/LoginModal';
import Footer from './components/footer';
import ShoeList from './components/shoe_list';
import BrandCarousel from './components/brandCardCarousel';

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        // The main container div
        <>
            <div>
                <Navbar onProfileClick={toggleModal} />
                <ImageSlider />
                <LoginModal isOpen={isModalOpen} onClose={toggleModal} />
            </div>
            <BrandCarousel/>
            <ShoeList/>
            <Footer/>
        </>
    );
}

export default App;