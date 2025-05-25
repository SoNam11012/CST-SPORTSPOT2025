'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Booking {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  venue: {
    id: string;
    name: string;
    type: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  createdAt: string;
}

export default function AdminBookings() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.replace('/login');
      } else if (!isAdmin) {
        // Logged in but not admin, redirect to home
        router.replace('/home');
      }
    }
  }, [loading, user, isAdmin, router]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        console.log('Fetching bookings with token:', token ? 'Token exists' : 'No token');
        
        const response = await fetch('/api/admin/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API error response:', errorData);
          throw new Error(errorData.error || `Failed to fetch bookings: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Bookings data received:', data.length ? `${data.length} bookings` : 'No bookings');
        
        if (Array.isArray(data)) {
          // Process bookings data to ensure it matches our interface
          const processedBookings = data.map((booking: any) => {
            // Handle user data
            const user = booking.user || {};
            const userData = {
              id: typeof user === 'object' ? user.id || '' : '',
              name: typeof user === 'object' ? user.name || 'Unknown User' : user || 'Unknown User',
              email: typeof user === 'object' ? user.email || '' : ''
            };
            
            // Handle venue data
            const venue = booking.venue || {};
            const venueData = {
              id: typeof venue === 'object' ? venue.id || '' : '',
              name: typeof venue === 'object' ? venue.name || 'Unknown Venue' : venue || 'Unknown Venue',
              type: typeof venue === 'object' ? venue.type || '' : ''
            };
            
            return {
              id: booking.id || '',
              user: userData,
              venue: venueData,
              date: booking.date || 'No date',
              startTime: booking.startTime || '00:00',
              endTime: booking.endTime || '00:00',
              status: booking.status || 'Pending',
              createdAt: booking.createdAt || ''
            };
          });
          
          setBookings(processedBookings);
        } else {
          console.error('Unexpected data format:', data);
          setError('Received invalid data format from server');
          setBookings([]);
        }
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Failed to load bookings');
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && isAdmin) {
      fetchBookings();
    }
  }, [user, isAdmin]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log(`Updating booking ${bookingId} to status: ${newStatus}`);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`/api/admin/bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Status update API error:', errorData);
        throw new Error(errorData.error || `Failed to update booking status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Status update result:', result);
      
      // Update booking in state
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus as any } : booking
      ));
      
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      setError(err.message || 'Failed to update booking status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      console.log(`Deleting booking with ID: ${bookingId}`);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`/api/admin/bookings?id=${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete API error:', errorData);
        throw new Error(errorData.error || `Failed to delete booking: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Delete result:', result);
      
      // Remove booking from state
      setBookings(bookings.filter(booking => booking.id !== bookingId));
      
    } catch (err: any) {
      console.error('Error deleting booking:', err);
      setError(err.message || 'Failed to delete booking');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter bookings based on selected status
  const filteredBookings = selectedStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status.toLowerCase() === selectedStatus.toLowerCase());

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-[#2c6e49] text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="CST SportSpot Logo" className="h-10 w-10" />
              <h1 className="text-2xl font-bold">CST SportSpot Admin</h1>
              <nav className="hidden md:flex ml-8 space-x-6">
                <Link href="/admin" className="hover:text-gray-200 font-medium">Dashboard</Link>
                <Link href="/admin/venues" className="hover:text-gray-200 font-medium">Venues</Link>
                <Link href="/admin/users" className="hover:text-gray-200 font-medium">Users</Link>
                <Link href="/admin/bookings" className="hover:text-gray-200 font-medium">Bookings</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center">
                <span className="mr-2">Welcome, {user?.name || 'Admin'}</span>
              </div>
              <button 
                onClick={() => {
                  // Clear auth tokens
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  sessionStorage.removeItem('token');
                  sessionStorage.removeItem('user');
                  // Clear the cookie
                  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                  // Redirect to login
                  router.push('/login');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Booking Management</h2>
          <div className="flex space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No bookings found. {selectedStatus !== 'all' && 'Try changing the filter.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
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
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                        <div className="text-sm text-gray-500">{booking.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.venue.name}</div>
                        <div className="text-sm text-gray-500">{booking.venue.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {booking.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'Approved')}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'Rejected')}
                              className="text-red-600 hover:text-red-900 mr-3"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {booking.status === 'Approved' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'Cancelled')}
                            className="text-yellow-600 hover:text-yellow-900 mr-3"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
