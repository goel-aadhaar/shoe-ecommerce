'use client';

import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-black rounded-full"></div>
              <span className="text-2xl font-bold text-black">URBANSOLE</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
              <a href="/" className="hover:text-black transition-colors">HOME</a>
              <a href="/collections" className="hover:text-black transition-colors">SHOES</a>
              <a href="/brands" className="hover:text-black transition-colors">BRANDS</a>
              <a href="/admin" className="hover:text-black transition-colors">ADMIN</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="w-full bg-black text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">
            © 2024 URBANSOLE. All rights reserved.
          </p>
          <p className="text-xs mt-2">
            Powered by MARMETO
          </p>
        </div>
      </footer>
    </div>
  );
}
