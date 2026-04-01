'use client';

import React from 'react';
import Link from 'next/link';
import { Search, User, ShoppingCart, Heart } from 'lucide-react';

interface NavbarProps {
  onProfileClick: () => void;
}

export default function Navbar({ onProfileClick }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-black rounded-full"></div>
            <span className="text-2xl font-bold text-black">URBANSOLE</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
            <Link href="/collections/new-arrival" className="hover:text-black transition-colors">
              NEW ARRIVAL
            </Link>
            <Link href="/collections/shoes" className="hover:text-black transition-colors">
              SHOES
            </Link>
            <Link href="/collections/crocs" className="hover:text-black transition-colors">
              CROCS
            </Link>
            <Link href="/brands" className="hover:text-black transition-colors">
              BRANDS
            </Link>
            <Link href="/" className="hover:text-black transition-colors">
              HOME
            </Link>
            <Link href="/collections/sale" className="hover:text-red-500 transition-colors font-semibold">
              SALE
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-black transition-colors">
              <Search className="h-6 w-6" />
            </button>
            <button 
              onClick={onProfileClick}
              className="text-gray-600 hover:text-black transition-colors"
            >
              <User className="h-6 w-6" />
            </button>
            <button className="text-gray-600 hover:text-black transition-colors">
              <Heart className="h-6 w-6" />
            </button>
            <button className="text-gray-600 hover:text-black transition-colors">
              <ShoppingCart className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
