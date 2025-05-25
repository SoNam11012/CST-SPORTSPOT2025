'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBasketballBall, FaSearch, FaUser, FaCalendar, FaSignInAlt } from 'react-icons/fa';

const Navbar = ({ current }) => {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Venues', href: '/venues' },
    { name: 'Bookings', href: '/bookings' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'FAQ', href: '/faq' }
  ];

  return (
    <header className="bg-[#2c6e49] text-white shadow sticky-top">
      <div className="container">
        <nav className="navbar navbar-expand-lg py-2">
          <Link className="navbar-brand fw-bold d-flex align-items-center" href="/">
            <FaBasketballBall className="me-2" /> CST-SportSpot
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
              {navLinks.map(link => (
                <li key={link.href} className="nav-item">
                  <Link
                    className={`nav-link ${pathname === link.href ? 'active text-[#ffc971]' : 'text-white hover:text-[#ffc971]'}`}
                    href={link.href}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li className="nav-item d-flex align-items-center mx-2">
                <form className="d-flex search-form">
                  <input
                    className="form-control search-input"
                    type="search"
                    placeholder="Search venues..."
                    aria-label="Search"
                  />
                  <button className="search-button" type="button">
                    <FaSearch />
                  </button>
                </form>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FaUser className="me-1" />
                  <span>Account</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" href="/profile">
                      <FaUser className="me-2" /> Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/bookings">
                      <FaCalendar className="me-2" /> My Bookings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item text-danger" href="/logout">
                      <FaSignInAlt className="me-2" /> Logout
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar; 