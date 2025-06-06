'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BookingForm from '@/components/BookingForm';
import Navbar from '@/components/Navbar';
import VenueAvailabilityChecker from '@/components/VenueAvailabilityChecker';
import { useAuth } from '@/hooks/useAuth';
import { FaArrowLeft } from 'react-icons/fa';

interface Venue {
  _id: string;
  name: string;
  type: string;
  capacity: number;
  image: string;
  status: string;
  description: string;
  equipment?: string[];
}

export default function VenuePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await fetch(`/api/venues/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch venue');
        }
        const data = await response.json();
        setVenue(data.venue);
      } catch (err: any) {
        setError(err.message || 'Failed to load venue');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVenue();
    }
  }, [params.id]);

  const handleBookNow = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/venues/${params.id}`));
      return;
    }

    setIsCheckingAvailability(true);
    try {
      const response = await fetch(`/api/venues/${params.id}/availability`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check availability');
      }

      if (!data.isAvailable) {
        setError('This venue is currently not available for booking');
        return;
      }

      setShowBookingForm(true);
    } catch (err: any) {
      setError(err.message || 'Failed to check venue availability');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6fff8]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-[#f6fff8]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error || 'Venue not found'}</span>
            <div className="mt-4">
              <Link 
                href="/venues"
                className="text-red-700 underline hover:text-red-800"
              >
                Return to Venues
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6fff8]">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-[#2c6e49] transition-colors mb-4"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Venues</span>
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="relative h-96">
            <img
              src={venue.image}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-[#ffc971] text-black px-3 py-1 rounded-full text-sm font-semibold">
              {venue.type}
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{venue.name}</h1>
            
            {/* Enhanced Description Section */}
            <div className="bg-[#f0f9f1] p-4 rounded-lg border border-[#d8f3dc] mb-6">
              <h2 className="text-xl font-semibold text-[#2c6e49] mb-3">About This Venue</h2>
              <p className="text-gray-700 leading-relaxed">{venue.description || 'This is a premium sports venue available for booking. Check availability and book your slot today!'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Venue Details</h2>
                <div className="space-y-3">
                  <p className="flex items-center text-gray-700">
                    <i className="fas fa-users mr-3 text-[#2c6e49] w-5 text-center"></i>
                    <span className="font-medium mr-2">Capacity:</span> {venue.capacity} people
                  </p>
                  <p className="flex items-center text-gray-700">
                    <i className="fas fa-running mr-3 text-[#2c6e49] w-5 text-center"></i>
                    <span className="font-medium mr-2">Type:</span> {venue.type}
                  </p>
                  <p className="flex items-center text-gray-700">
                    <i className="fas fa-info-circle mr-3 text-[#2c6e49] w-5 text-center"></i>
                    <span className="font-medium mr-2">Status:</span> 
                    <span className={`px-2 py-1 rounded text-sm ${venue.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {venue.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Facilities & Equipment</h2>
                <div className="space-y-2">
                  {venue.equipment && venue.equipment.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {venue.equipment.map((item: string, index: number) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 italic">Standard equipment is provided with this venue.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Venue Availability Calendar */}
            {venue.status === 'Available' && (
              <div id="availability" className="mt-6 mb-8">
                <VenueAvailabilityChecker 
                  venueId={venue._id} 
                  onTimeSlotSelect={(date, startTime, endTime, isAvailable) => {
                    if (isAvailable && user) {
                      setShowBookingForm(true);
                    } else if (!user) {
                      router.push('/login?redirect=' + encodeURIComponent(`/venues/${params.id}`));
                    }
                  }}
                  onBookNow={handleBookNow}
                />
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleBookNow}
                disabled={isCheckingAvailability || venue.status !== 'Available'}
                className={`px-8 py-3 rounded-md transition font-semibold ${
                  venue.status === 'Available'
                    ? 'bg-[#2c6e49] text-white hover:bg-[#1b4332]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isCheckingAvailability ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking Availability...
                  </span>
                ) : venue.status === 'Available' ? (
                  'Book Now'
                ) : (
                  'Not Available'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBookingForm && (
        <BookingForm
          venueId={venue._id}
          venueName={venue.name}
          onClose={() => setShowBookingForm(false)}
        />
      )}
    </div>
  );
} 