'use client';

import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/how.css'; // Move the CSS from <style> to this file
import { FaBasketballBall, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface Venue {
  name: string;
  sport: string;
  location: string;
}

const venues: Venue[] = [
  { name: "CST Indoor Basketball Court", sport: "basketball", location: "CST Campus" },
  { name: "City Football Stadium", sport: "football", location: "Downtown" },
  { name: "Tennis Center", sport: "tennis", location: "Sports Complex" },
  { name: "Swimming Pool Olympic", sport: "swimming", location: "Aquatic Center" },
  { name: "Badminton Courts", sport: "badminton", location: "Indoor Arena" },
  { name: "Cricket Ground", sport: "cricket", location: "Eastern Park" },
  { name: "Volleyball Courts", sport: "volleyball", location: "Beach Area" },
  { name: "Table Tennis Hall", sport: "table tennis", location: "Sports Complex" }
];

const HowItWorks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Venue[]>([]);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part: string, i: number) =>
      part.toLowerCase() === query.toLowerCase() ? <span key={i} className="highlight">{part}</span> : part
    );
  };

  const handleSearch = () => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return;
    const results = venues.filter(v =>
      v.name.toLowerCase().includes(query) ||
      v.sport.toLowerCase().includes(query) ||
      v.location.toLowerCase().includes(query)
    );
    setSearchResults(results);
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg shadow sticky-top">
        <div className="container">
          <div className="d-flex align-items-center">
            <Link href="/" className="back-button me-3">
              <FaArrowLeft /> Back
            </Link>
            <a className="navbar-brand fw-bold text-white" href="/">
              <FaBasketballBall className="me-2" /> CST-SportSpot
            </a>
          </div>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="/venue">Venues</a></li>
              <li className="nav-item"><a className="nav-link active" href="/how">How It Works</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
              <li className="nav-item"><a className="nav-link" href="/questions">FAQ</a></li>
              <li className="nav-item d-flex align-items-center">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search venues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button className="btn btn-outline-light" type="button" onClick={handleSearch}>Search</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <section className="py-5">
        <div className="container">
          <h1 className="text-center mb-5">How It Works</h1>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="bg-white p-4 text-center shadow rounded step-card">
                <div className="fs-1">🔍</div>
                <h2 className="h4 my-3">Search Venues</h2>
                <p>Use our search filters to find the perfect sports venue by location, sport type, and availability.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-white p-4 text-center shadow rounded step-card">
                <div className="fs-1">📅</div>
                <h2 className="h4 my-3">Select Date & Time</h2>
                <p>Choose your preferred date and time slot. Our real-time availability ensures no double bookings.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-white p-4 text-center shadow rounded step-card">
                <div className="fs-1">✅</div>
                <h2 className="h4 my-3">Confirm Booking</h2>
                <p>Provide your details and confirm your booking instantly. No paperwork, no hassle!</p>
              </div>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4">
              <h4>Search Results:</h4>
              {searchResults.map((venue, index) => (
                <div key={index} className="border p-2 mb-2 rounded">
                  <strong>{highlightMatch(venue.name, searchTerm)}</strong><br />
                  <small>
                    {highlightMatch(venue.sport, searchTerm)} | {highlightMatch(venue.location, searchTerm)}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="footer py-5 text-white" id="contact">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <h2 className="h3 mb-3"><FaBasketballBall className="me-2" /> SportSpot</h2>
              <p>SportSpot is your one-stop solution for booking sports venues. We connect you with the best indoor and outdoor venues for all your sports needs.</p>
              <div className="d-flex mt-3">
                <a href="#" className="social-link"><FaFacebookF /></a>
                <a href="#" className="social-link"><FaTwitter /></a>
                <a href="#" className="social-link"><FaInstagram /></a>
                <a href="#" className="social-link"><FaLinkedinIn /></a>
              </div>
            </div>

            <div className="col-md-6 col-lg-2">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li><a href="/">Home</a></li>
                <li><a href="/venue">Venues</a></li>
                <li><a href="/how">How It Works</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="/questions">FAQ</a></li>
              </ul>
            </div>

            <div className="col-md-6 col-lg-3">
              <h3 className="footer-title">Contact Us</h3>
              <div className="footer-contact">
                <div className="d-flex mb-3">
                  <FaMapMarkerAlt className="me-3 mt-1" /><p>CST, Renchending, Phuentsholing</p>
                </div>
                <div className="d-flex mb-3">
                  <FaPhoneAlt className="me-3 mt-1" /><p>+975 17123456</p>
                </div>
                <div className="d-flex mb-3">
                  <FaEnvelope className="me-3 mt-1" /><p>info@cstsportspot.bt</p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <h3 className="footer-title">Subscribe</h3>
              <p className="mb-3">Stay updated with the latest news and offers.</p>
              <form className="newsletter-form" onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for subscribing!");
              }}>
                <div className="input-group mb-3">
                  <input type="email" className="form-control" placeholder="Your Email" required />
                  <button className="btn btn-accent" type="submit">Subscribe</button>
                </div>
              </form>
            </div>
          </div>

          <div className="row mt-5">
            <div className="col-12">
              <hr className="opacity-25" />
              <div className="d-md-flex justify-content-between align-items-center py-3">
                <p className="mb-md-0">© 2025 CST-SportSpot. All rights reserved.</p>
                <div>
                  <a href="#" className="text-white me-3">Privacy Policy</a>
                  <a href="#" className="text-white me-3">Terms of Service</a>
                  <a href="#" className="text-white">FAQ</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;
