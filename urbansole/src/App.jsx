import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ImageSlider from './components/ImageSlider';
import LoginModal from './components/LoginModal';

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        // The main container div
        <div>
            <Navbar onProfileClick={toggleModal} />
            <ImageSlider />
            <LoginModal isOpen={isModalOpen} onClose={toggleModal} />
        </div>
    );
}

export default App;