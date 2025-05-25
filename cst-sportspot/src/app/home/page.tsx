'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Booking {
  _id: string;
  venueId: {
    _id: string;
    name: string;
    type: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface Venue {
  _id: string;
  name: string;
  type: string;
  capacity: number;
  image: string;
  status: string;
}

export default function DashboardHome() {
  const { user, logout } = useAuth();
  // Get user ID from the user object
  const userId = user?.id;
  const router = useRouter();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [sport, setSport] = useState('');
  const [venueType, setVenueType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [venueData, setVenueData] = useState<Venue[]>([]);

  const testimonials = [
    {
      id: 1,
      name: "Chimi Gyeltshen",
      role: "Football Enthusiast",
      quote: "SportSpot made it so easy to find and book a football field for our weekend match. Highly recommended!",
      image: "https://github.com/SoNam11012/CST-SportSpot/blob/main/cg.jpg?raw=true"
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
    const fetchData = async () => {
      if (!userId) {
        console.log('No user ID available, user:', user);
        setError('Please log in to view your bookings');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        console.log('Fetching bookings for user ID:', userId);
        // Fetch upcoming bookings
        const bookingsResponse = await fetch(`/api/bookings/get?userId=${userId}`);
        const bookingsData = await bookingsResponse.json();
        
        console.log('Bookings API response:', { status: bookingsResponse.status, data: bookingsData });
        
        if (!bookingsResponse.ok) {
          throw new Error(bookingsData.error || `Failed to fetch bookings (${bookingsResponse.status})`);
        }

        if (bookingsData.bookings) {
          console.log('Setting bookings:', bookingsData.bookings);
          setUpcomingBookings(bookingsData.bookings);
        } else {
          console.log('No bookings found, setting empty array');
          setUpcomingBookings([]);
        }

        // Fetch venues
        const venuesResponse = await fetch('/api/venues');
        if (!venuesResponse.ok) {
          throw new Error('Failed to fetch venues');
        }
        const venuesData = await venuesResponse.json();
        setVenueData(venuesData.venues || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchData();
    }
  }, [user?.email]);

  useEffect(() => {
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/venues?sport=${sport}&type=${venueType}`);
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      setUpcomingBookings(upcomingBookings.filter(booking => booking._id !== bookingId));
    } catch (err: any) {
      console.error('Error canceling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#f6fff8]">
      <Navbar />
      
      {/* Enhanced Welcome Section */}
      <section 
        className="relative py-24 text-white min-h-[400px] md:min-h-[500px]"
        style={{
          backgroundImage: 'url("https://s.alicdn.com/@sc04/kf/H6ba0e23dd12f44f18efbb3d1deccef65B.jpg_720x720q50.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#222' // fallback color
        }}
      >
        {/* Lighter overlay for better image visibility */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-white bg-opacity-90 rounded-xl shadow-lg px-10 py-8 mb-8">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 text-black">Welcome {user?.name}!</h1>
              <p className="text-2xl md:text-3xl opacity-90 text-black">Ready for your next game?</p>
              <Link 
                href="/venues" 
                className="inline-block bg-[#ffc971] text-[#1b4332] px-10 py-4 rounded-md hover:bg-[#ffb84d] transition font-semibold text-xl mt-6"
              >
                Book a Venue Now
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="py-12 bg-[#2c6e49]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Need Help With Your Booking?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white">
            Our support team is available 24/7 to assist you with any questions
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/contact" 
              className="bg-white text-[#2c6e49] px-8 py-3 rounded-md hover:bg-gray-100 transition font-semibold"
            >
              Contact Support
            </Link>
            <Link 
              href="/faq" 
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md hover:bg-white hover:text-[#1b4332] transition font-semibold"
            >
              Visit FAQ
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2c6e49] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center text-white">
                <i className="fas fa-basketball-ball mr-2"></i>
                CST-SportSpot
              </h3>
              <p className="mb-4 text-white">
                Your premier platform for booking sports venues and facilities with ease.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-[#ffc971] transition">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-white hover:text-[#ffc971] transition">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-white hover:text-[#ffc971] transition">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/faq" className="text-white hover:text-[#ffc971] transition">FAQs</Link></li>
                <li><Link href="/contact" className="text-white hover:text-[#ffc971] transition">Contact Us</Link></li>
                <li><Link href="/privacy" className="text-white hover:text-[#ffc971] transition">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Contact Us</h4>
              <address className="not-italic text-white">
                <p className="mb-2 flex items-center">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  CST Campus, Renchending, Phuentsholing
                </p>
                <p className="mb-2 flex items-center">
                  <i className="fas fa-phone mr-2"></i>
                  +975 77 123 456
                </p>
                <p className="flex items-center">
                  <i className="fas fa-envelope mr-2"></i>
                  info@cstsportspot.com
                </p>
              </address>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-white">&copy; {new Date().getFullYear()} CST-SportSpot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}