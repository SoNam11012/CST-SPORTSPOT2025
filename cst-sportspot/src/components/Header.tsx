'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaBasketballBall, FaSearch } from 'react-icons/fa';

export default function Header() {
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching:', search);
  };

  return (
    <nav className="bg-[#2c6e49] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center text-white text-2xl font-bold">
          <FaBasketballBall className="mr-2 text-3xl" /> CST-SportSpot
        </Link>

        <div className="hidden md:flex space-x-6 text-white font-medium">
          <Link href="/" className="hover:text-[#ffc971]">Home</Link>
          <Link href="/venues" className="hover:text-[#ffc971]">Venues</Link>
          <Link href="/how" className="hover:text-[#ffc971]">How It Works</Link>
          <Link href="/#contact" className="hover:text-[#ffc971]">Contact</Link>
          <Link href="/faq" className="hover:text-[#ffc971]">FAQ</Link>
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex items-center border rounded overflow-hidden">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="px-3 py-1 text-sm text-black focus:outline-none"
          />
          <button type="submit" className="bg-white text-[#2c6e49] px-3 py-1">
            <FaSearch />
          </button>
        </form>
      </div>
    </nav>
  );
}