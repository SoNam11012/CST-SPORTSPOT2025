'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { name: 'Home', href: '/home' },
    { name: 'Venues', href: '/venues' },
    { name: 'My Bookings', href: '/bookings' },
    { name: 'Profile', href: '/profile' },
    { name: 'FAQ', href: '/faq' },
  ];

  return (
    <nav className="bg-[#2c6e49] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/home" className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
          <img src="/logo.png" alt="CST-SportSpot Logo" className="h-10 w-10 mr-2 inline" />
          CST-SportSpot
        </Link>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-5">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition font-medium px-2 py-1 rounded text-base ${pathname === link.href ? 'text-[#ffc971]' : 'text-white hover:text-[#ffc971]'}`}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center space-x-3 ml-3">
              <span className="text-white text-sm">Welcome {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-[#2c6e49] px-3 py-1 rounded hover:bg-[#ffc971] hover:text-[#2c6e49] transition font-medium text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-white text-[#2c6e49] px-3 py-1 rounded hover:bg-[#ffc971] hover:text-[#2c6e49] transition font-medium text-sm"
            >
              Login
            </Link>
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
        <div className="md:hidden px-6 pb-4 pt-2 space-y-2 bg-[#2c6e49]">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`block transition font-medium px-2 py-2 rounded text-base ${pathname === link.href ? 'text-[#ffc971]' : 'text-white hover:text-[#ffc971]'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <div className="pt-2 border-t border-[#ffc971]/30">
              <p className="text-white mb-2 text-sm">Welcome {user.name}</p>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-white text-[#2c6e49] px-3 py-1 rounded hover:bg-[#ffc971] hover:text-[#2c6e49] transition font-medium text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="block w-full text-center bg-white text-[#2c6e49] px-3 py-1 rounded hover:bg-[#ffc971] hover:text-[#2c6e49] transition font-medium text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
} 