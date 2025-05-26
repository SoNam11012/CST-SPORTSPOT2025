'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingAnimation from '@/components/LoadingAnimation';
import Dashboard3DCalendar from '@/components/Dashboard3DCalendar';
import Dashboard3DStats from '@/components/Dashboard3DStats';
import PageTransition from '@/components/PageTransition';

interface Booking {
  id: string;
  venue: {
    name: string;
    id: string;
    type: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/my-bookings');
    }
  }, [user, authLoading, router]);

  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch('/api/bookings/my-bookings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        setBookings(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching your bookings');
      } finally {
        setLoading(false);
        // Hide loading animation after data is loaded
        setTimeout(() => setShowAnimation(false), 1500);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  // Cancel booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Update booking status in the UI
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'Cancelled' } 
            : booking
        )
      );
    } catch (err: any) {
      setError(err.message || 'An error occurred while cancelling your booking');
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings by selected date
  const filteredBookings = selectedDate 
    ? bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate.toDateString() === selectedDate.toDateString();
      })
    : bookings;

  // Prepare stats data for 3D chart
  const venueStats = bookings.reduce((acc: {[key: string]: number}, booking) => {
    const venueName = typeof booking.venue === 'object' ? booking.venue.name : booking.venue;
    acc[venueName] = (acc[venueName] || 0) + 1;
    return acc;
  }, {});

  const statsData = Object.entries(venueStats).map(([label, value], index) => ({
    label,
    value,
    color: [
      '#2c6e49', // Green
      '#ffc971', // Yellow
      '#4c956c', // Light green
      '#d68c45', // Orange
      '#2a9d8f', // Teal
    ][index % 5]
  }));

  // Status stats
  const statusStats = bookings.reduce((acc: {[key: string]: number}, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusStats).map(([label, value], index) => ({
    label,
    value,
    color: {
      'Approved': '#22c55e',
      'Pending': '#eab308',
      'Cancelled': '#ef4444',
      'Rejected': '#9f1239'
    }[label] || '#94a3b8'
  }));

  if (authLoading || (loading && showAnimation)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingAnimation size="250px" text="Loading your bookings..." />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#2c6e49]">My Bookings</h1>
            <Link href="/venues">
              <button className="bg-[#2c6e49] text-white px-4 py-2 rounded-md hover:bg-[#1b4332] transition-colors">
                Book New Venue
              </button>
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}

          {/* 3D Calendar Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#2c6e49] mb-4">Booking Calendar</h2>
            <Dashboard3DCalendar 
              bookings={bookings} 
              onSelectDate={setSelectedDate} 
            />
          </div>

          {/* 3D Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#2c6e49] mb-4">Bookings by Venue</h2>
              <Dashboard3DStats 
                title="Venue Bookings" 
                stats={statsData} 
              />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#2c6e49] mb-4">Bookings by Status</h2>
              <Dashboard3DStats 
                title="Status Distribution" 
                stats={statusData} 
              />
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#2c6e49] mb-4">
                {selectedDate 
                  ? `Bookings for ${selectedDate.toLocaleDateString()}` 
                  : 'All Bookings'}
              </h2>
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="text-[#2c6e49] underline mb-4"
                >
                  Show all bookings
                </button>
              )}
              {filteredBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {selectedDate 
                    ? 'No bookings for the selected date.'
                    : 'You have no bookings yet.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Venue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.map((booking) => {
                        const venueName = typeof booking.venue === 'object' ? booking.venue.name : booking.venue;
                        const venueId = typeof booking.venue === 'object' ? booking.venue.id : '';
                        
                        return (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                <Link href={`/venues/${venueId}`} className="text-[#2c6e49] hover:underline">
                                  {venueName}
                                </Link>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(booking.date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {booking.startTime} - {booking.endTime}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${booking.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                  booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {booking.status !== 'Cancelled' && (
                                <button 
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}