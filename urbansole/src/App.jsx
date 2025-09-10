import React, { useState, useEffect } from 'react';
import { AuthProvider } from './components/context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/Navbar';
import ImageSlider from './components/ImageSlider';
import LoginModal from './components/LoginModal';
import Footer from './components/footer';
import BrandCarousel from './components/brandCardCarousel';
import Home from './components/home-page/home-page';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
//   const [showProfilePage, setShowProfilePage] = useState(false);
    const [profileIconClicked, setProfileIconClicked] = useState(false);

  const navigate = useNavigate();

 
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'https://api-shoe-ecommerce.onrender.com/api/v1/users/profile',
          { withCredentials: true }
        );
        console.log("Full Response:", res);
        console.log("Profile:", res.data.data);

        if (res.status == 200 ) {
          console.log('User is logged in');
          setIsLoggedIn(true);
          setMessage('You are currently logged in.');
        } else {
            console.log('User not logged in or session expired....');
          setIsLoggedIn(false);
          setMessage('You are not logged in.');
        }
      } catch (error) {
        console.log('User not logged in or session expired');
        setIsLoggedIn(false);
        setMessage('You are not logged in.');
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, [profileIconClicked]); 


  const toggleModal = () => {
    setProfileIconClicked(!profileIconClicked);
    console.log(isLoggedIn + "  printingggggggg....");
    
    if (!isLoggedIn) {
      setIsModalOpen(!isModalOpen);
    } else {
      navigate('/profile');
    }
  };

  if (loading) {
    // will replace it with shimmer UI
    return <div>Loading...</div>; // optional loading state
  }

  return (
    <AuthProvider>
      <Navbar onProfileClick={toggleModal} />
      <>
        <ImageSlider />
        <LoginModal isOpen={isModalOpen} onClose={toggleModal} />
        <BrandCarousel />
        <Home />
      </>
      <Footer />
    </AuthProvider>
  );
}

export default App;
