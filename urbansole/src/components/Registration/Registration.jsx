import React, { useState } from "react";
import axios from "axios";

import Navbar from "../Navbar";
import Footer from "../footer";

const Registration = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "https://api-shoe-ecommerce.onrender.com/api/v1/auth/register",
        formData
      );
      setMessage("🎉 Registration successful!");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
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
              Sign Up
            </h2>
            <p className="text-center text-gray-500 mb-6">
              To avail exclusive offers!
            </p>

            {message && (
              <div className="mb-4 text-center text-sm font-medium text-red-500">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
              />
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
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg font-bold text-lg hover:bg-gray-800 transition-all"
              >
                {loading ? "Registering..." : "SIGN UP NOW"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Registration;
