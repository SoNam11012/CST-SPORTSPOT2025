'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [sport, setSport] = useState('');
  const [type, setType] = useState('');
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sample venue data
  const venueData = [
  {
    id: 1,
    name: "CST Basketball Court",
    location: "CST Campus, Renchending",
    type: "Indoor",
    sport: "Basketball",
    image: "https://github.com/SoNam11012/CST-SportSpot/blob/main/bbcourt.jpg?raw=true"
  },
  {
    id: 2,
    name: "Football Ground",
    location: "CST Campus, Central Field",
    type: "Outdoor",
    sport: "Football",
    image: "https://github.com/SoNam11012/CST-SportSpot/blob/main/fbcourt.jpg?raw=true"
  },
        {
        id: 3,
        name: "Volleyball Court A and B",
        location: "CST Campus, Below football ground",
        type: "Outdoor",
        sport: "Volleyball",
        image: "https://github.com/SoNam11012/CST-SportSpot/blob/main/vbcourt.jpg?raw=true"
      },
      {
        id: 4,
        name: "Table Tennis Room",
        location: "CST Campus, Indoor Basketball court",
        type: "Indoor",
        sport: "Table Tennis",
        image: "https://github.com/SoNam11012/CST-SportSpot/blob/main/ttcourt.jpg?raw=true"
    }
  ];

  const testimonials = [
    {
      name: 'Chimi Gyeltshen',
      sport: 'Football Enthusiast',
      quote: 'SportSpot made it so easy to find and book a football field for our weekend match. Highly recommended!',
      img: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/cg.jpg?raw=true'
    },
    {
      name: 'Karma Wangchuk Titung',
      sport: 'Table Tennis Player',
      quote: 'I love how quickly I can book a TT court. The process is seamless and the venues are top-notch.',
      img: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/kwt.jpg?raw=true'
    },
    {
      name: 'Sherab Dorji',
      sport: 'Volleyball Player',
      quote: 'This service exceeded my expectations!, efficient and truly outstanding. Highly recommend!',
      img: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/sd.jpg?raw=true'
    },
    {
      name: 'Jigme Tsherab Damchoe',
      sport: 'Basketball Enthusiast',
      quote: 'The variety of venues available on CST-SportSpot is impressive. It\'s my go-to platform for booking basketball courts.',
      img: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/jtd.jpg?raw=true'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <main className="min-h-screen bg-[#f6fff8]">
      {/* Navigation */}
      <nav className="bg-[#2c6e49] shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-white text-xl font-bold gap-2">
              <img src="/logo.png" alt="CST-SportSpot Logo" className="h-10 w-10 mr-2 inline" />
              CST-SportSpot
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/" className="text-white hover:text-[#ffc971] text-base font-medium transition">Home</Link>
              <Link href="/login" className="text-white hover:text-[#ffc971] text-base font-medium transition">Venues</Link>
              <Link href="/how" className="text-white hover:text-[#ffc971] text-base font-medium transition">How It Works</Link>
              <a href="#contact" className="text-white hover:text-[#ffc971] text-base font-medium transition">Contact</a>
              <Link href="/faq" className="text-white hover:text-[#ffc971] text-base font-medium transition">FAQ</Link>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-white">Welcome, {user.name}</span>
                  <button
                    onClick={logout}
                    className="bg-white text-[#2c6e49] px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#ffc971] hover:text-[#2c6e49] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <button className="bg-white text-[#2c6e49] px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#ffc971] hover:text-[#2c6e49] transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="bg-[#ffc971] text-[#2c6e49] px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#ffb84d] transition-colors">
                      Sign Up
                    </button>
                  </Link>
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
          
          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-3 pb-4">
              <Link
                href="/"
                className="block text-white hover:text-[#ffc971] text-base font-medium transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/login"
                className="block text-white hover:text-[#ffc971] text-base font-medium transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Venues
              </Link>
              <Link
                href="/how"
                className="block text-white hover:text-[#ffc971] text-base font-medium transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <a
                href="#contact"
                className="block text-white hover:text-[#ffc971] text-base font-medium transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
              <Link
                href="/faq"
                className="block text-white hover:text-[#ffc971] text-base font-medium transition py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              
              {user ? (
                <div className="pt-3 border-t border-[#ffc971]/30 mt-3">
                  <p className="text-white mb-2 text-sm">Welcome, {user.name}</p>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-white text-[#2c6e49] px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#ffc971] hover:text-[#2c6e49] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-[#ffc971]/30 mt-3 flex flex-col space-y-2">
                  <Link href="/login">
                    <button 
                      className="w-full bg-white text-[#2c6e49] px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#ffc971] hover:text-[#2c6e49] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </button>
                  </Link>
                  <Link href="/register">
                    <button 
                      className="w-full bg-[#ffc971] text-[#2c6e49] px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#ffb84d] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-white"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://media.istockphoto.com/id/1158115722/photo/sports-and-games-background.jpg?s=612x612&w=0&k=20&c=_PATQSfC8CLfAkas54iCHRftdAP0Jjyp6NUVNCtkFb0=')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Book Sports Venues With Ease</h1>
          <p className="text-xl mb-8">Find and book the perfect indoor or outdoor sports venue for your next game or event.</p>
          <div className="space-x-4">
            <Link href="/login">
              <button className="bg-[#ffc971] text-[#1b4332] px-6 py-3 rounded-md hover:bg-[#ffb84d] transition-colors">
                Find Venues
              </button>
            </Link>
            <Link href="/login">
              <button className="border-2 border-white text-white px-6 py-3 rounded-md hover:bg-white hover:text-[#1b4332] transition-colors">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="search-section" className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow-lg -mt-20 relative z-10">
            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <select 
                className="form-select p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c6e49] focus:border-[#2c6e49]"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
              >
            <option value="">Select Sport</option>
            <option value="Football">Football</option>
            <option value="Basketball">Basketball</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Table Tennis">Table Tennis</option>
            <option value="Badminton">Badminton</option>
          </select>

              <select 
                className="form-select p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c6e49] focus:border-[#2c6e49]"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
            <option value="">Indoor/Outdoor</option>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>

              <input 
                type="date" 
                className="form-input p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c6e49] focus:border-[#2c6e49]"
              />

              <input 
                type="time" 
                className="form-input p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c6e49] focus:border-[#2c6e49]"
              />

              <button 
                type="submit"
                className="bg-[#2c6e49] text-white p-2 rounded-md hover:bg-[#1b4332] transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/login');
                }}
              >
                Check Availability
              </button>
        </form>

            {/* Sport Tags */}
            <div className="mt-6">
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { name: 'Football', icon: 'futbol' },
                  { name: 'Basketball', icon: 'basketball-ball' },
                  { name: 'Volleyball', icon: 'volleyball-ball' },
                  { name: 'Table Tennis', icon: 'table-tennis' },
                  { name: 'Badminton', icon: 'shuttlecock' }
                ].map((sportItem) => (
                  <button
                    key={sportItem.name}
                    onClick={() => setSport(sportItem.name)}
                    className={`flex items-center px-4 py-2 rounded-full ${
                      sport === sportItem.name 
                        ? 'bg-[#2c6e49] text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <i className={`fas fa-${sportItem.icon} mr-2`}></i>
                    {sportItem.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Book Now Button */}
            <div className="text-center mt-6">
              <Link href="/login">
                <button className="bg-[#ffc971] text-[#1b4332] px-6 py-3 rounded-md hover:bg-[#ffb84d] transition-colors">
                  Book Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Venue Cards Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venueData.map((venue) => (
              <div key={venue.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img 
                    src={venue.image} 
                    alt={venue.name}
                    className="w-full h-48 object-cover"
                  />
                  <span className="absolute top-4 right-4 bg-[#ffc971] text-[#1b4332] px-3 py-1 rounded-full text-sm font-semibold">
                    {venue.type}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{venue.name}</h3>
                  <p className="text-gray-600 mb-2">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    {venue.location}
                  </p>
                  <p className="text-gray-600 mb-4">
                    <i className="fas fa-running mr-2"></i>
                    {venue.sport}
                  </p>
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => router.push('/login')}
                      className="text-[#2c6e49] border border-[#2c6e49] px-4 py-2 rounded hover:bg-[#2c6e49] hover:text-white transition-colors"
                    >
                      View Details
                    </button>
                    <Link href="/login">
                      <button className="bg-[#ffc971] text-[#1b4332] px-4 py-2 rounded hover:bg-[#ffb84d] transition-colors">
                        Book Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </section>

      {/* Peak Hours Guide */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#1b4332] mb-8">Peak Hours Guide</h2>
    <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#fef9e7] to-[#fcf3cf] p-8 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
              <h4 className="text-xl font-semibold text-[#f39c12] mb-2">🌅 Morning</h4>
              <p className="text-[#1b4332]">6AM - 9AM<br />Most Refreshing</p>
      </div>
            <div className="bg-gradient-to-br from-[#ebf5fb] to-[#d6eaf8] p-8 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow">
              <h4 className="text-xl font-semibold text-[#3498db] mb-2">🌇 Evening</h4>
              <p className="text-[#1b4332]">4:15PM - 11PM<br />Most Popular</p>
      </div>
    </div>
  </div>
</section>

{/* Why Us Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#1b4332] mb-8">Why Use This Platform?</h2>
    <div className="grid md:grid-cols-2 gap-6">
      {[
        { icon: '🚀', title: 'Fast & Easy', desc: 'No paperwork, just a few clicks to book.' },
        { icon: '📅', title: 'Real-Time Updates', desc: 'Avoid conflicts with a live booking system.' },
        { icon: '🏀', title: 'Multiple Sports Facilities', desc: 'From basketball courts to football fields, find the right venue for your game.' },
        { icon: '💰', title: 'Completely Free', desc: 'No booking fees—just book and play!' }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 border-transparent hover:border-[#dfa55d]"
              >
                <div className="text-2xl mr-4">{benefit.icon}</div>
            <div>
                  <h3 className="text-xl font-semibold text-[#1b4332]">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* Partners Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#1b4332] mb-8">Trusted By</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[
        { src: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/bb.jpg?raw=true', alt: 'CST Basketball', name: 'CST Basketball' },
        { src: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/fb.jpg?raw=true', alt: 'CST Kangtsey', name: 'CST Kangtsey' },
        { src: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/vb.jpg?raw=true', alt: 'CST Volleyball', name: 'CST Volleyball' },
              { src: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/cst.jpg?raw=true', alt: 'College of Science and Technology', name: 'College of Science and Technology' }
            ].map((partner, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all">
                <div className="h-[100px] flex items-center justify-center mb-4">
                  <img 
                    src={partner.src} 
                    alt={partner.alt}
                    className="max-h-[70px] w-auto object-contain filter grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all"
                  />
                </div>
                <p className="text-center text-[#1b4332]">{partner.name}</p>
        </div>
      ))}
    </div>
  </div>
</section>

{/* Testimonials Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#1b4332] mb-8">What Our Users Say</h2>
          <div className="relative max-w-4xl mx-auto">
            <div className="testimonial-container">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`testimonial-card ${index === activeTestimonial ? 'active' : ''}`}
                >
                  <img 
                    src={testimonial.img} 
                    alt={testimonial.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h4 className="font-bold text-lg text-center text-[#1b4332]">{testimonial.name}</h4>
                  <p className="text-sm text-center text-gray-600 italic">{testimonial.sport}</p>
                  <p className="mt-4 text-center text-gray-700">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
            <div className="testimonial-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

{/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#2c6e49] to-[#4c956c] text-white">
        <div className="container mx-auto px-4 text-center">
    <h2 className="text-3xl font-bold mb-4">Ready to Book Your Next Game?</h2>
          <p className="mb-8">Join thousands of sports enthusiasts and book your perfect venue today.</p>
          <Link href="/login">
            <button className="bg-white text-[#2c6e49] px-8 py-3 rounded-md hover:bg-[#ffc971] transition-colors font-semibold">
              Get Started
            </button>
    </Link>
  </div>
</section>

{/* Footer */}
      <footer id="contact" className="bg-[#1b4332] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
    <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <i className="fas fa-basketball-ball mr-2"></i>
                SportSpot
              </h3>
              <p className="mb-6">
                SportSpot is your one-stop solution for booking sports venues. We connect you with the best indoor and outdoor venues for all your sports needs.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: 'facebook-f', href: '#' },
                  { icon: 'twitter', href: '#' },
                  { icon: 'instagram', href: '#' },
                  { icon: 'linkedin-in', href: '#' }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ffc971] hover:text-[#1b4332] transition-colors"
                  >
                    <i className={`fab fa-${social.icon}`}></i>
          </a>
        ))}
      </div>
    </div>

    <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'Venues', href: '/venues' },
                  { name: 'How It Works', href: '/how-it-works' },
                  { name: 'Contact', href: '/contact' },
                  { name: 'FAQ', href: '/faq' }
                ].map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-[#ffc971] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
      </ul>
    </div>

    <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <div className="space-y-4">
                <p className="flex items-center">
                  <i className="fas fa-map-marker-alt w-6"></i>
                  CST, Renchending, Phuentsholing
                </p>
                <p className="flex items-center">
                  <i className="fas fa-phone w-6"></i>
                  +97577123456
                </p>
                <p className="flex items-center">
                  <i className="fas fa-envelope w-6"></i>
                  info@cstsportspot.com
                </p>
              </div>
    </div>

    <div>
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <p className="mb-4">Subscribe to our newsletter for updates</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="flex-1 p-2 rounded-l bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ffc971]"
                />
                <button className="bg-[#ffc971] text-[#1b4332] px-4 py-2 rounded-r hover:bg-[#ffb84d] transition-colors">
                  Subscribe
                </button>
      </div>
    </div>
  </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-300">
    &copy; {new Date().getFullYear()} CST-SportSpot. All rights reserved.
          </div>
  </div>
</footer>
    </main>
  );
}
