'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  FaHome, 
  FaUsers, 
  FaCalendarAlt, 
  FaBuilding, 
  FaChartBar, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const AdminNavbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <FaChartBar className="mr-2" /> },
    { path: '/admin/users', label: 'Users', icon: <FaUsers className="mr-2" /> },
    { path: '/admin/bookings', label: 'Bookings', icon: <FaCalendarAlt className="mr-2" /> },
    { path: '/admin/venues', label: 'Venues', icon: <FaBuilding className="mr-2" /> },
  ];

  // Check if a nav item is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden md:flex fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 py-3'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo and brand */}
          <Link href="/admin" className="flex items-center">
            <span className="text-[#2c6e49] font-bold text-xl">SportSpot</span>
            <span className="ml-2 text-gray-600 font-medium">Admin</span>
          </Link>

          {/* Navigation links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                  isActive(item.path)
                    ? 'bg-[#2c6e49] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* User profile and logout */}
          <div className="flex items-center">
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.email || ''}</p>
            </div>
            <button 
              onClick={logout}
              className="flex items-center px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 py-3'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo and brand */}
          <Link href="/admin" className="flex items-center">
            <span className="text-[#2c6e49] font-bold text-xl">SportSpot</span>
            <span className="ml-2 text-gray-600 font-medium">Admin</span>
          </Link>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="bg-white border-t border-gray-200 py-2 px-4 shadow-lg">
            <div className="space-y-1 py-2">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`block px-4 py-3 rounded-md flex items-center transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#2c6e49] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-200 my-2 pt-2">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                </div>
                <button 
                  onClick={logout}
                  className="w-full flex items-center px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from being hidden under the navbar */}
      <div className={`${isScrolled ? 'h-16' : 'h-20'} md:block`}></div>
    </>
  );
};

export default AdminNavbar;
