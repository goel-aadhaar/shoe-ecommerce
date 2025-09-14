import React, { useState, useEffect } from 'react';
import { AuthProvider } from './components/context/AuthProvider';
import { useNavigate, Outlet } from 'react-router-dom'; // Import Outlet
import axios from 'axios';

import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import Footer from './components/footer';
import ShimmerHome from './components/Shimmer_UIs/home_shimmer'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
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

        if (res.status == 200) {
          setIsLoggedIn(true);
          setMessage('You are currently logged in.');
        } else {
          setIsLoggedIn(false);
          setMessage('You are not logged in.');
        }
      } catch (error) {
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
    if (!isLoggedIn) {
      setIsModalOpen(!isModalOpen);
    } else {
      navigate('/profile');
    }
  };

  if (loading) {
    return (
      <ShimmerHome />
    );
  }

  return (
    <AuthProvider>
      <Navbar onProfileClick={toggleModal} />
      <LoginModal isOpen={isModalOpen} onClose={toggleModal} />
      {/* The Outlet component will render the content of the child routes */}
      <Outlet />
      <Footer />
    </AuthProvider>
  );
}

export default App;