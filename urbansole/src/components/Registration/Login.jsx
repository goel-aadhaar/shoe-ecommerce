import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Link } from "react-router";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });


  const navigate = useNavigate();
  function onLoginSuccess(){
    navigate('/');
  }

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
      const response = await axios.post(
        'https://api-shoe-ecommerce.onrender.com/api/v1/auth/login',
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        setMessage('Login successful!');
        setTimeout(() => {
          onLoginSuccess(); // Call the prop function on success
        }, 1000); // Wait a second before closing to show the message
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };




  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 to-white px-4 mt-5">
        <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-5xl border border-gray-200">
          {/* Left Section - Offer + Shoes */}
          <div className="flex-1 bg-gray-100 flex flex-col items-center justify-center p-8 relative">
            <h1 className="text-6xl font-extrabold text-gray-900">
              40% OFF
            </h1>
            <p className="mt-2 text-lg text-gray-600 font-medium">
              On Your First Purchase
            </p>
            <img
              src="https://www.pngall.com/wp-content/uploads/18/Nike-Cow-Shoes-Striking-Footwear-Concept-PNG.png"
              alt="Sneakers"
              className="mt-6 w-73 transform hover:scale-105 transition duration-300"
            />
          </div>

          {/* Right Section - Registration Form */}
          <div className="flex-1 p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              Log In
            </h2>
            <p className="text-center text-gray-500 mb-6">
              To avail exclusive offers!
            </p>

            {message && (
              <div className="mb-4 text-center text-sm font-medium text-red-500">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-black">

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg font-bold text-md hover:bg-gray-800 transition-all"
              >
                {loading ? "Log in...." : "Login Now"}
              </button>
                <Link 
                    key='login'
                    to={'/register'}
                >
                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black mt-2 text-white py-3 rounded-md font-bold text-md hover:bg-gray-800 transition-all"
                    >
                        New User ? Sign Up here
                    </button>
                </Link>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
