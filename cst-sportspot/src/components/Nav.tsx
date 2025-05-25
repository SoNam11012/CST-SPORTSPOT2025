'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-[#2c6e49] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-white flex items-center">
            <i className="fas fa-basketball-ball mr-2"></i>
            CST-SportSpot
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/home" className="text-white hover:text-[#ffc971] transition">Home</Link>
            <Link href="/venues" className="text-white hover:text-[#ffc971] transition">Venues</Link>
            <Link href="/bookings" className="text-white hover:text-[#ffc971] transition">My Bookings</Link>
            <Link href="/profile" className="text-white hover:text-[#ffc971] transition">Profile</Link>
            <Link href="/faq" className="text-white hover:text-[#ffc971] transition">FAQ</Link>

            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-white">Welcome {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-[#2c6e49] px-4 py-2 rounded-md hover:bg-[#ffc971] transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2 rounded hover:bg-[#ffc971]/30 transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col justify-center items-center">
              {isMobileMenuOpen ? (
                <>
                  {/* X icon */}
                  <span className="block w-6 h-0.5 bg-white transform rotate-45 translate-y-0.5"></span>
                  <span className="block w-6 h-0.5 bg-white transform -rotate-45"></span>
                </>
              ) : (
                <>
                  {/* Hamburger icon */}
                  <span className="block w-6 h-0.5 bg-white mb-1.5"></span>
                  <span className="block w-6 h-0.5 bg-white mb-1.5"></span>
                  <span className="block w-6 h-0.5 bg-white"></span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            <Link 
              href="/dashboard" 
              className="block text-white hover:text-[#ffc971] transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/venues" 
              className="block text-white hover:text-[#ffc971] transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Venues
            </Link>
            <Link 
              href="/bookings" 
              className="block text-white hover:text-[#ffc971] transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Bookings
            </Link>
            <Link 
              href="/profile" 
              className="block text-white hover:text-[#ffc971] transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <Link 
              href="/faq" 
              className="block text-white hover:text-[#ffc971] transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </Link>

            {user && (
              <div className="pt-4 border-t border-gray-700">
                <p className="text-white mb-2">Welcome {user.name}</p>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-white text-[#2c6e49] px-4 py-2 rounded-md hover:bg-[#ffc971] transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
