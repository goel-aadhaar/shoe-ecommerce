import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import Footer from '../footer';


const Registration = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setMessage('');

    if(formData.password != formData.confirmPassword){
      setMessage("Password do not match");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post('https://api-shoe-ecommerce.onrender.com/api/v1/auth/register', formData);
      setMessage('Registration successful!');
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-white overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 bg-[url('https://www.superkicks.in/cdn/shop/articles/Banner_Image_520x500_520x500_5afd8714-82f1-4287-a3a5-1a1bbbfdc48e.jpg?v=1736864107')] bg-cover bg-center opacity-40 z-0"></div>

        {/* Form Content Layer */}  
        <div className="relative z-10 w-full max-w-md bg-white bg-opacity-80 p-6 shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-black">📝 User Registration</h2>
        {message && (
        <div className="mb-4 text-center text-sm text-red-500">{message}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <input
            type="text"
            name="fullName"
            placeholder="👤 Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full  px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
            type="email"
            name="email"
            placeholder="📧 Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
            type="password"
            name="password"
            placeholder="🔒 Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
            type="password"
            name="confirmPassword"
            placeholder="🔒re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
       
        <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
        >
            {loading ? 'Registering...' : 'Register'}
        </button>
        </form>
        </div>
    </div>


    <Footer/>
    </>
  );
};

export default Registration;
