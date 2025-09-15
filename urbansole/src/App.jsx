import React, { useState, useEffect } from 'react';
import { AuthProvider } from './components/context/AuthProvider';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import Footer from './components/footer';
import ShimmerHome from './components/Shimmer_UIs/home_shimmer';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'https://api-shoe-ecommerce.onrender.com/api/v1/auth/check',
          { withCredentials: true }
        );
        if (res.data.data.isLoggedIn) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []); 

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      setIsModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsModalOpen(false); // Close the modal
    navigate('/profile'); // Navigate to the profile page
  };

  if (loading) {
    return <ShimmerHome />;
  }

  return (
    <AuthProvider>
      <Navbar onProfileClick={handleProfileClick} />
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <Outlet />
      <Footer />
    </AuthProvider>
  );
}

export default App;