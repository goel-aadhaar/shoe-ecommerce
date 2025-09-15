import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Use react-router-dom
import { Heart, Search, Menu, UserRoundIcon, ShoppingCart } from 'lucide-react';

const Navbar = ({ onProfileClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = [
    { navName: "New Arrival", to: '/collections/new-arrival' },
    { navName: "Shoes", to: '/collections/shoe' },
    { navName: "Clogs", to: '/collections/clogs' },
    { navName: "Brands", to: '/brandsLogo' },
    { navName: "Home", to: '/' }
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-30 bg-black bg-opacity-80 mb-10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white focus:outline-none" aria-label="Toggle mobile menu">
          <Menu />
        </button>
        <h1 className="text-2xl font-black uppercase tracking-wider"><Link to={"/"}>URBANSOLE</Link></h1>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold uppercase">
          {navLinks.map(link => <Link key={link.navName} to={link.to} className="hover:text-gray-300 transition-colors">{link.navName}</Link>)}
          <a href="#" className="text-red-500 hover:text-red-400 transition-colors">Sale</a>
        </nav>
        <div className="flex items-center space-x-5">
          <button className="hover:text-gray-300 transition-colors" aria-label="Search"><Search /></button>
          <button
            onClick={onProfileClick}
            className="hover:text-gray-300 transition-colors"
            aria-label="Profile"
          >
            <UserRoundIcon />
          </button>
          <button className="hover:text-gray-300 transition-colors" aria-label="Shopping Cart"><Heart /></button>
          <button className="hover:text-gray-300 transition-colors" aria-label="Shopping Cart"><ShoppingCart /></button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black bg-opacity-90">
          <nav className="flex flex-col items-center space-y-6 py-8 text-lg font-semibold uppercase">
            {navLinks.map(link => (
              <Link
                key={link.navName}
                to={link.to}
                className="hover:text-gray-300 transition-colors"
              >
                {link.navName}
              </Link>
            ))}
            <a href="#" className="text-red-500 hover:text-red-400 transition-colors">Sale</a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;