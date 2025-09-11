import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, ShoppingBag, Heart, Headphones, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Section = ({ title, icon, children, sectionName, openSection, toggleSection }) => (
  <div className="bg-white p-4 my-4 rounded-xl shadow-md">
    <div
      className="flex justify-between items-center cursor-pointer"
      onClick={() => toggleSection(sectionName)}
    >
      <div className="flex items-center space-x-4">
        {icon}
        <h2 className="text-lg font-semibold text-black">{title}</h2>
      </div>
      {openSection === sectionName ? <ChevronUp className='text-black' /> : <ChevronDown className='text-black'/>}
    </div>
    <div
      className={`mt-4 transition-all duration-300 ease-in-out overflow-hidden text-black ${
        openSection === sectionName ? 'max-h-96' : 'max-h-0'
      }`}
    >
      {children}
    </div>
  </div>
);

const ProfilePage = () => {
  const [openSection, setOpenSection] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // This function fetches the user's profile data from the backend
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('https://api-shoe-ecommerce.onrender.com/api/v1/users/profile', {
          withCredentials: true // Crucial to send the cookies
        });
        console.log("printingggggggg... " , response);
        
        console.log("Response status: ", response?.status);
        // console.log("Response data: ", response?.user);
        
        if (response?.status === 200 && response?.data?.data?.user) {
          setProfile(response.data.data.user);
        } else {
          console.log("cookies not saved.....");
          
          // If the backend doesn't return profile data, it means the user is not authenticated
          navigate('/login');
        }
      } catch (error) {
        // A 401 or 403 error means the user is not authenticated
        console.error('Failed to fetch profile data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [navigate]);

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
      <div className="min-h-screen bg-gray-100 p-4 font-sans flex items-center justify-center">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto">
        <div className="bg-white p-6 my-4 rounded-xl shadow-md">
          <h1 className="text-xl font-bold mb-4 text-black">Hi {profile?.fullName || 'User'},</h1>
          <div className="space-y-2 text-gray-700">
            <p className="flex items-center space-x-2">
              <Mail className='text-black' size={16} />
              <span>{profile?.email}</span>
            </p>
            {profile.phone && (
              <p className="flex items-center space-x-2">
                <Phone className='text-black' size={16} />
                <span>{profile?.phone}</span>
              </p>
            )}
          </div>
        </div>

        <Section title="My Orders" icon={<ShoppingBag className='text-black' />} sectionName="orders" openSection={openSection} toggleSection={toggleSection}>
          <p className="text-gray-500">No Orders</p>
        </Section>

        <Section title="Wishlist" icon={<Heart className='text-black' />} sectionName="wishlist" openSection={openSection} toggleSection={toggleSection}>
          <p className="text-gray-500">No items in your wishlist.</p>
        </Section>

        <Section title="Help and Support" icon={<Headphones className='text-black' />} sectionName="help" openSection={openSection} toggleSection={toggleSection}>
          <p className="text-gray-500">
            For any queries or assistance, please contact our support team.
          </p>
        </Section>

        <button 
          onClick={handleLogout} 
          className="w-full bg-black text-white py-3 rounded-full font-semibold mt-6 flex items-center justify-center space-x-2 shadow-lg hover:bg-gray-800 transition-colors">
          <LogOut size={20} className="text-white" />
          <span>Log out</span>
        </button>
        
      </div>
    </div>
  );
};

export default ProfilePage;
