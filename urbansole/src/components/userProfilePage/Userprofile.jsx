import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, ShoppingBag, Heart, Headphones, LogOut, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';

// A more attractive, reusable section component with a subtle theme
const Section = ({ title, icon, children, sectionName, openSection, toggleSection }) => (
  <div className="bg-white p-6 my-4 rounded-3xl shadow-lg border border-gray-100 transition-transform duration-300 transform hover:scale-[1.01]">
    <div
      className="flex justify-between items-center cursor-pointer"
      onClick={() => toggleSection(sectionName)}
    >
      <div className="flex items-center space-x-4">
        {icon}
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      {openSection === sectionName ? <ChevronUp className='text-gray-600' size={24} /> : <ChevronDown className='text-gray-600' size={24} />}
    </div>
    <div
      className={`mt-4 transition-all duration-500 ease-in-out overflow-hidden text-gray-700 ${
        openSection === sectionName ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="pt-4 border-t border-gray-200 mt-4">
        {children}
      </div>
    </div>
  </div>
);

const ProfilePage = () => {
  const [openSection, setOpenSection] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // This function fetches the user's profile data from the backend
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('https://api-shoe-ecommerce.onrender.com/api/v1/users/profile', {
          withCredentials: true 
        });
        
        if (response?.status === 200 && response?.data?.data?.user) {
          setProfile(response.data.data.user);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
    setIsAdmin(profile?.role === 'admin')
  }, [navigate, profile]);

  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };
  
  
  const handleLogout = async () => {
    try {
      await axios.post('https://api-shoe-ecommerce.onrender.com/api/v1/auth/logout', {}, {
        withCredentials: true 
      });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 font-sans flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-10 p-6 font-sans flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto">
        {/* Profile Card Section */}
        <div className="bg-white p-8 my-4 rounded-3xl shadow-xl flex flex-col items-center border border-gray-100">
          <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-gray-200 shadow-md">

            <img 
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Hi {profile?.fullName || 'User'},</h1>
          <div className="space-y-2 text-gray-600 text-center">
            <p className="flex items-center justify-center space-x-2">
              <Mail className='text-gray-500' size={18} />
              <span>{profile?.email}</span>
            </p>
            {profile.phone && (
              <p className="flex items-center justify-center space-x-2">
                <Phone className='text-gray-500' size={18} />
                <span>{profile?.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Accordion Sections */}
        <Section title="My Orders" icon={<ShoppingBag className='text-gray-600' size={24} />} sectionName="orders" openSection={openSection} toggleSection={toggleSection}>
          <p className="text-gray-500 text-sm">You haven't placed any orders yet. Start shopping now!</p>
        </Section>

        <Section title="Wishlist" icon={<Heart className='text-gray-600' size={24} />} sectionName="wishlist" openSection={openSection} toggleSection={toggleSection}>
          <p className="text-gray-500 text-sm">No items in your wishlist. Add your favorite products to keep track of them.</p>
        </Section>

        <Section title="Help and Support" icon={<Headphones className='text-gray-600' size={24} />} sectionName="help" openSection={openSection} toggleSection={toggleSection}>
          <p className="text-gray-500 text-sm">
            For any queries or assistance, please contact our support team. We're here to help!
          </p>
        </Section>

        {isAdmin && (
          <Link
            key ={'admin_panel'}
            to = {'/admin'}
          >
            <button
              className="w-full bg-blue-600 text-white py-4 rounded-full font-bold text-lg mt-8 flex items-center justify-center space-x-2 shadow-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-[1.01]">
              <Shield size={20} className="text-white" />
              <span>Admin Control Panel</span>
            </button>
          </Link>
        )}

        {/* Logout Button */}
        <button 
          onClick={handleLogout} 
          className="w-full bg-red-600 text-white py-4 rounded-full font-bold text-lg mt-8 flex items-center justify-center space-x-2 shadow-lg hover:bg-red-700 transition-colors duration-300 transform hover:scale-[1.01]">
          <LogOut size={20} className="text-white" />
          <span>Log out</span>
        </button>
        
      </div>
    </div>
  );
};

export default ProfilePage;