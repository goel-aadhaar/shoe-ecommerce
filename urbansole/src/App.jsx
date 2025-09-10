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
  const [showProfilePage, setShowProfilePage] = useState(false);

  const navigate = useNavigate();

  // ✅ Only run once on initial page load
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'https://api-shoe-ecommerce.onrender.com/api/v1/users/profile',
          { withCredentials: true }
        );

        if (res.data?.user) {
          setIsLoggedIn(true);
          setMessage('You are currently logged in.');
        } else {
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
  }, []); // ✅ Empty dependency array

  // ✅ Handle modal toggle / profile navigation
  const toggleModal = () => {
    if (!isLoggedIn) {
      setIsModalOpen(!isModalOpen);
    } else {
      setShowProfilePage(!showProfilePage);
      if (!showProfilePage) navigate('/profile');
    }
  };

  if (loading) {
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
