import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, ShoppingBag, Heart, Headphones, LogOut, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is where you would fetch data from your MERN backend API.
    // Replace '/api/user' with your actual endpoint.
    // You would typically include an auth token in the headers for authentication.
    const fetchUserData = async () => {
      try {
        // Mock API call
        const response = await new Promise(resolve =>
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({
                name: 'Aditya',
                email: 'mr.adityag123@gmail.com',
                phone: '+919151681050',
              }),
            });
          }, 1000)
        );

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  if (loading) {
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
          <h1 className="text-xl font-bold mb-4 text-black">Hi {user.name},</h1>
          <div className="space-y-2 text-gray-700">
            <p className="flex items-center space-x-2">
              <Mail className='text-black' size={16} />
              <span>{user.email}</span>
            </p>
            <p className="flex items-center space-x-2">
              <Phone className='text-black' size={16} />
              <span>{user.phone}</span>
            </p>
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

        <button className="w-full bg-black text-white py-3 rounded-full font-semibold mt-6 flex items-center justify-center space-x-2 shadow-lg hover:bg-gray-800 transition-colors">
          <LogOut size={20} className="text-white" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
