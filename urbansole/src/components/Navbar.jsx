import React, { useState } from 'react';
import { Link } from 'react-router';

// Icon components
const SearchIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const ProfileIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
const CartIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>;

const Navbar = ({ onProfileClick }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navLinks = [
        {navName :"New Arrival", to : '/newArrival'}, {navName: "Footwear", to :'/footwear'}, {navName: "Crocks", to : '/crocks'}, {navName:"Brands",to : '/brandsLogo'}, {navName : "Blogs", to : '/blogs'}
    ];

    return (
        <header className="fixed top-0 left-0 w-full z-30 bg-black bg-opacity-80 mb-10">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white focus:outline-none" aria-label="Toggle mobile menu">
                    <MenuIcon />
                </button>
                <h1 className="text-2xl font-black uppercase tracking-wider"><Link to={"/"}>URBANSOLE</Link></h1>
                <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold uppercase">
                    {navLinks.map(link => <Link key={link.navName} to={link.to} className="hover:text-gray-300 transition-colors">{link.navName}</Link>)}
                    <a href="#" className="text-red-500 hover:text-red-400 transition-colors">Sale</a>
                </nav>
                <div className="flex items-center space-x-5">
                    <button className="hover:text-gray-300 transition-colors" aria-label="Search"><SearchIcon /></button>
                    <button onClick={onProfileClick} className="hover:text-gray-300 transition-colors" aria-label="Profile"><ProfileIcon /></button>
                    <button className="hover:text-gray-300 transition-colors" aria-label="Shopping Cart"><CartIcon /></button>
                </div>
            </div>
            {isMobileMenuOpen && (
                 <div className="md:hidden bg-black bg-opacity-90">
                    <nav className="flex flex-col items-center space-y-6 py-8 text-lg font-semibold uppercase">
                         {navLinks.map(link => <a key={link} href="#" className="hover:text-gray-300 transition-colors">{link}</a>)}
                        <a href="#" className="text-red-500 hover:text-red-400 transition-colors">Sale</a>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;