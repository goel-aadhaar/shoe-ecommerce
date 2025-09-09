import React, { useState } from 'react';
import { Link } from 'react-router';
import axios from 'axios';

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);

const LoginModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

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
    setLoading(true);

    try {
      const response = await axios.post('https://api-shoe-ecommerce.onrender.com/api/v1/auth/login', formData);

      setMessage('Login successful!');
      // You might want to store the token here, e.g., localStorage.setItem('token', response.data.token);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 mt-2" onClick={onClose}>
      <div className="relative bg-black text-white rounded-lg w-full max-w-4xl flex flex-col md:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10" aria-label="Close login modal">
          <CloseIcon />
        </button>
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center text-center">
          <h2 className="text-3xl font-bold uppercase tracking-wider">
            URBANSOLE <span className="text-xs font-light align-top">Powered by Kwik Pass</span>
          </h2>
          <p className="mt-4 text-lg text-gray-300">Welcome! Register to avail the best deals!</p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">✨</span>
              <span className="font-semibold">Fast Shipping</span>
            </div>
            <div className="border border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">🌟</span>
              <span className="font-semibold">Exclusive Drops</span>
            </div>
            <div className="border border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">💫</span>
              <span className="font-semibold">Global Curation</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 bg-white text-black p-8 sm:p-12 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-center">
            Grab! <br /> Welcome Discount
          </h3>
          {message && <div className="mt-4 text-center text-red-500 text-sm">{message}</div>}
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-600">Email Id</div>
              <input
                type="email"
                name="email"
                placeholder="Enter your registered email id"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-24 pr-3 py-3 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black outline-none"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-600">Password</div>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-24 pr-5 py-3 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black outline-none"
              />
            </div>
            <div className="flex items-center">
              <input id="notify" type="checkbox" className="h-4 w-4 text-black border-gray-400 rounded focus:ring-black" />
              <label htmlFor="notify" className="ml-2 block text-sm text-gray-700">
                Notify me for any updates & offers
              </label>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-bold py-3 px-4 mb-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                {loading ? 'Logging In...' : 'Submit'}
              </button>
              <Link
                key = {'register'}
                to = {'/register'}
              >
                <button
                    type="button"
                    className="w-full bg-black text-white font-bold py-3 px-4 rounded-md hover:bg-gray-800 transition-colors"
                >
                    New User? Register Here
                </button>
              </Link>
            </div>
          </form>
          <div className="text-center mt-4 text-xs text-gray-500">
            <p>
              I accept that I have read & understood Gokwik's <a href="#" className="underline">Privacy Policy</a> and{' '}
              <a href="#" className="underline">T&Cs</a>.
            </p>
            <a href="#" className="mt-2 inline-block underline">
              Trouble logging in?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
