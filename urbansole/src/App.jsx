import React, { useState, useEffect } from 'react'; // Make sure to import useEffect
import { AuthProvider } from './components/context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/Navbar';
import ImageSlider from './components/ImageSlider';
import LoginModal from './components/LoginModal';
import Footer from './components/footer';
import ShoeList from './components/shoe_list';
import BrandCarousel from './components/brandCardCarousel';
import ShoeDetail from './components/shoeDetail';
// import shoesData from './data/shoes.json';
import FilterBar from './components/filter';
import TrendingSection from './components/trending-section/trending';
import Home from './components/home-page/home-page';
// import BrandFullPage from './components/brandPage/BrandFullPage';
import ProfilePage from './components/userProfilePage/Userprofile';
// import ProfilePage from './components/userProfilePage/profile';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showProfilePage, setShowProfilePage] = useState(false);


    const navigate = useNavigate();
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                setLoading(true);
                await axios.get('https://api-shoe-ecommerce.onrender.com/api/v1/users/profile', {
                    withCredentials: true
                });
               console.log("Setting cokkkiesssss");
               
                setIsLoggedIn(true);
                setMessage('You are currently logged in.');
                
            } catch (error) {
                // A 401 or 403 error means the user is not authenticated
                console.log('not settttttt');
                
                setIsLoggedIn(false);
                setMessage('You are not logged in.');
            } finally {
                setLoading(false);
            }
        };
        checkLoginStatus();
    }); 

    const toggleModal = () => {
        if(!isLoggedIn){
            setIsModalOpen(!isModalOpen);
        }else{
            setShowProfilePage(!showProfilePage);
            if(showProfilePage) navigate('/profile')
        }
    };




    return (
        <AuthProvider>
            <Navbar onProfileClick={toggleModal} />
            <>
                <ImageSlider />
                <LoginModal isOpen={isModalOpen} onClose={toggleModal} />
                <BrandCarousel />
                <Home/>
            </>    
            <Footer />
        </AuthProvider>
    );
}

export default App;