import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-white pt-5" id="contact">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-6 col-lg-4">
            <h3 className="footer-logo mb-3">
              <i className="fas fa-basketball-ball me-2"></i> SportSpot
            </h3>
            <p className="footer-about">
              SportSpot is your one-stop solution for booking sports venues. We connect you with the best indoor and outdoor venues for all your sports needs.
            </p>
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

          <div className="col-md-6 col-lg-2">
            <h3 className="footer-title">Sports</h3>
            <ul className="footer-links">
              <li><a href="#">Football</a></li>
              <li><a href="#">Basketball</a></li>
              <li><a href="#">Volleyball</a></li>
              <li><a href="#">Tennis</a></li>
              <li><a href="#">Badminton</a></li>
              <li><a href="#">Table Tennis</a></li>
            </ul>
          </div>

          <div className="col-md-6 col-lg-4">
            <h3 className="footer-title">Contact Us</h3>
            <div className="footer-contact mb-3">
              <p><FaMapMarkerAlt className="me-2" /> 123 Campus Drive, University Area</p>
              <p><FaPhone className="me-2" /> (123) 456-7890</p>
              <p><FaEnvelope className="me-2" /> info@cstsportspot.com</p>
            </div>
            <div className="mt-3">
              <h5 className="mb-2">Subscribe to our newsletter</h5>
              <div className="input-group">
                <input type="email" className="form-control" placeholder="Your email" />
                <button className="btn btn-accent" type="button">Subscribe</button>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-12">
            <div className="border-top pt-4">
              <p className="text-center text-muted mb-0">&copy; 2025 CST-SportSpot. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;