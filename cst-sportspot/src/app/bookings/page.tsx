'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FaArrowLeft } from 'react-icons/fa';
import '@/styles/profile.css'; // Reusing the back button styles from profile page

interface Booking {
  _id: string;
  venueName?: string;
  venueId?: string | any;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface FormattedBooking {
  id: string;
  venue: string;
  date: string;
  time: string;
  sport: string;
  status: string;
}

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [bookings, setBookings] = useState<FormattedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Force refresh when the component mounts
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const fetchBookings = useCallback(async () => {
    // Create a variable to store the timeout ID
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      setLoading(true);
      setError('');
      
      // Get user email from auth context
      if (!user?.email) {
        console.log('No user email available, cannot fetch bookings');
        setError('You must be logged in to view bookings');
        setLoading(false);
        return;
      }
      
      // Check if network is available
      if (!navigator.onLine) {
        console.log('Network is offline');
        setError('You appear to be offline. Please check your internet connection.');
        setLoading(false);
        return;
      }
      
      console.log('Network is online, proceeding with fetch');
      
      console.log('Fetching bookings for user:', user.email);
      
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      console.log(`Fetching from: /api/bookings?userId=${encodeURIComponent(user.email)}&t=${timestamp}`);
      
      // Create a controller for the fetch request
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const fetchResponse = await fetch(`/api/bookings?userId=${encodeURIComponent(user.email)}&t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Accept': 'application/json',
          'Pragma': 'no-cache'
        },
        // Use our controller's signal
        signal: controller.signal
      });
      
      // Handle non-OK responses
      if (!fetchResponse.ok) {
        let errorData;
        try {
          const errorText = await fetchResponse.text();
          console.log(`Error response text (${fetchResponse.status}):`, errorText.substring(0, 200));
          
          try {
            errorData = JSON.parse(errorText);
            console.log('Parsed error data:', errorData);
          } catch (parseError) {
            console.error('Failed to parse error response as JSON:', parseError);
            // If JSON parsing fails, use the raw text
            throw new Error(`Server error: ${fetchResponse.status} - ${errorText.substring(0, 100)}`);
          }
        } catch (textError) {
          console.error('Error reading response:', textError);
          throw new Error(`Server error: ${fetchResponse.status}`);
        }
        
        // Provide more specific error messages based on status code
        if (fetchResponse.status === 404) {
          throw new Error('The bookings API endpoint was not found. Please contact support.');
        } else if (fetchResponse.status === 401) {
          throw new Error('You are not authorized to view these bookings. Please log in again.');
        } else if (fetchResponse.status === 500) {
          throw new Error('Server error: The database might be unavailable. Please try again later.');
        } else {
          throw new Error(errorData?.error || `Server error: ${fetchResponse.status}`);
        }
      }
      
      // Parse the JSON response with error handling
      let fetchData;
      try {
        fetchData = await fetchResponse.json();
        console.log('API response:', fetchData);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Invalid response from server. Please try again.');
      }

      // Check if bookings property exists in the response
      const bookingsArray = fetchData?.bookings || [];
      console.log('Bookings array:', bookingsArray);
      
      if (bookingsArray.length === 0) {
        console.log('No bookings found for user');
      }
      
      // Transform the data to match our UI format
      const formattedBookings = bookingsArray.map((booking: Booking) => {
        console.log('Processing booking:', booking);
        
        // Determine venue name using multiple fallbacks
        let venueName = 'Sports Venue';
        if (booking.venueName && typeof booking.venueName === 'string') {
          venueName = booking.venueName;
        } else if (booking.venueId) {
          // Map venue IDs to actual venue names
          const venueMap: Record<string, string> = {
            'basketball': 'Basketball Court',
            'volleyball': 'Volleyball Court',
            'badminton': 'Badminton Court',
            'football': 'Football Field',
            'tennis': 'Tennis Court',
            'swimming': 'Swimming Pool',
            'gym': 'Gymnasium',
            'table-tennis': 'Table Tennis Room',
            'default-venue': 'Sports Facility'
          };
          
          const venueIdStr = typeof booking.venueId === 'string' ? booking.venueId : String(booking.venueId);
          // Check if the venueId exists in our map
          if (Object.prototype.hasOwnProperty.call(venueMap, venueIdStr)) {
            venueName = venueMap[venueIdStr];
          }
        }
        
        // Format the date properly
        let formattedDate = 'Unknown Date';
        try {
          if (booking.date) {
            formattedDate = new Date(booking.date).toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Error formatting date:', e);
        }
        
        return {
          id: booking._id,
          venue: venueName,
          date: formattedDate,
          time: booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : 'Unknown Time',
          sport: venueName, // Use the same venue name for sport since each venue represents a sport
          status: booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Unknown'
        };
      });

      setBookings(formattedBookings);
      setError('');
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setBookings([]);
      
      // Provide more specific error messages based on error type
      if (err.name === 'AbortError') {
        setError('Request timed out. The server took too long to respond. Please try again.');
      } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.message.includes('JSON')) {
        setError('Error processing data from server. Please try refreshing the page.');
      } else {
        setError(err.message || 'Failed to load bookings. Please try again later.');
      }
    } finally {
      setLoading(false);
      // Clear the timeout to prevent memory leaks
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      console.log('Fetching bookings (refresh key:', refreshKey, ')');
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user, refreshKey, fetchBookings]);

  useEffect(() => {
    // Increment the refresh key to trigger a data refresh
    setRefreshKey(prev => prev + 1);
    
    // Also set up an interval to periodically refresh the data
    const refreshInterval = setInterval(() => {
      if (user && navigator.onLine) {
        console.log('Auto-refreshing bookings data');
        fetchBookings().catch(err => {
          console.error('Auto-refresh error:', err);
          // Don't update state here to avoid UI disruption during auto-refresh
        });
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [fetchBookings]); // Added fetchBookings to dependency array

  const handleCancelBooking = useCallback(async (bookingId: string) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Cancelling booking with ID:', bookingId);
      const deleteResponse = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      if (!deleteResponse.ok) {
        let errorData;
        try {
          errorData = await deleteResponse.json();
        } catch (jsonError) {
          console.error('JSON parsing error in delete response:', jsonError);
          throw new Error(`Failed to cancel booking: Server returned ${deleteResponse.status}`);
        }
        throw new Error(errorData?.error || 'Failed to cancel booking');
      }

      console.log('Booking cancelled successfully');
      
      // Show success message
      alert('Booking cancelled successfully');
      
      // Simply call fetchBookings to refresh the list
      // This reuses our existing function instead of duplicating code
      await fetchBookings();
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      setError(err.message || 'Failed to cancel booking');
      alert('Error: ' + (err.message || 'Failed to cancel booking'));
    } finally {
      setLoading(false);
    }
  }, [fetchBookings]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="back-button"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-[#2c6e49] text-white rounded hover:bg-[#1b4332] transition flex items-center"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Bookings'}
          </button>
        </div>

        <h1 className="text-3xl font-bold text-black mb-8">My Bookings</h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2c6e49]"></div>
            <p className="ml-4 text-lg text-gray-600">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            <p className="font-medium">Error: {error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 text-sm text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : bookings.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 font-semibold bg-gray-100 text-black">
              <div>Venue</div>
              <div>Sport</div>
              <div>Date</div>
              <div>Time</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            
            {bookings.map((booking) => (
              <div key={booking.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border-b border-gray-200 items-center text-black">
                <div>{booking.venue}</div>
                <div>{booking.sport}</div>
                <div>{booking.date}</div>
                <div>{booking.time}</div>
                <div>
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                    {booking.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => router.push(`/bookings/${booking.id}`)}
                    className="text-[#2c6e49] border border-[#2c6e49] px-3 py-1 rounded hover:bg-[#2c6e49] hover:text-white transition text-sm"
                  >
                    Details
                  </button>
                  <button 
                    onClick={() => handleCancelBooking(booking.id)}
                    className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">You don't have any bookings yet</p>
            <button
              onClick={() => router.push('/venues')}
              className="bg-[#2c6e49] text-white px-6 py-2 rounded-md hover:bg-[#1b4332] transition"
            >
              Browse Venues
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 