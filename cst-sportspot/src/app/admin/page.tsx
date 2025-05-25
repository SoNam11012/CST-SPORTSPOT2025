'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaCalendarAlt, FaChartBar, FaBuilding, FaCog } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Booking {
  id: string | number;
  user: string;
  venue: string;
  date: string;
  status: string;
  createdAt?: string;
}

interface ApiBooking {
  id: string;
  user: { name: string; id: string; email: string; username: string };
  venue: { name: string; id: string; type: string };
  date: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBookings: 0,
    totalVenues: 0,
    pendingRequests: 0
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        console.log('No user detected, redirecting to login');
        router.replace('/login');
      } else if (!isAdmin) {
        // Logged in but not admin, redirect to home
        console.log('User is not admin, redirecting to home');
        router.replace('/home');
      } else {
        console.log('Admin user authenticated successfully');
      }
    }
  }, [loading, user, isAdmin, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Fetch stats from the stats API
        const statsResponse = await fetch('/api/admin/stats', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });
        
        // Fetch recent bookings
        const bookingsResponse = await fetch('/api/admin/bookings/recent', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });
        
        // Process stats data
        let statsData = {
          totalUsers: 0,
          activeBookings: 0,
          totalVenues: 0,
          pendingRequests: 0
        };
        
        if (statsResponse.ok) {
          try {
            const data = await statsResponse.json();
            console.log('Stats data received:', data);
            statsData = {
              totalUsers: data.totalUsers || 0,
              activeBookings: data.activeBookings || 0,
              totalVenues: data.totalVenues || 0,
              pendingRequests: data.pendingRequests || 0
            };
          } catch (e) {
            console.error('Error parsing stats data:', e);
          }
        } else {
          console.error('Stats API error:', statsResponse.status);
        }
        
        // Always update stats even if there was an error
        setStats(statsData);
        
        // Process recent bookings
        let bookingsData: Booking[] = [];
        
        if (bookingsResponse.ok) {
          try {
            const bookings = await bookingsResponse.json();
            console.log('Recent bookings received:', bookings.length);
            
            // Format recent bookings data
            if (Array.isArray(bookings)) {
              bookingsData = bookings.slice(0, 5).map((booking: ApiBooking) => {
                // Make sure we handle both object and string user/venue data
                const userName = typeof booking.user === 'object' ? booking.user.name : booking.user;
                const venueName = typeof booking.venue === 'object' ? booking.venue.name : booking.venue;
                
                return {
                  id: booking.id,
                  user: userName || 'Unknown User',
                  venue: venueName || 'Unknown Venue',
                  date: booking.date || 'No date',
                  status: booking.status || 'Pending',
                  createdAt: booking.createdAt
                };
              });
            }
          } catch (e) {
            console.error('Error parsing bookings data:', e);
          }
        } else {
          console.error('Bookings API error:', bookingsResponse.status);
        }
        
        // Always update bookings even if there was an error
        setRecentBookings(bookingsData);
        
        // Only set error if both API calls failed
        if (!statsResponse.ok && !bookingsResponse.ok) {
          setError('Failed to load dashboard data. Please try again later.');
        } else {
          setError('');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        
        // Use empty data as fallback
        setStats({
          totalUsers: 0,
          activeBookings: 0,
          totalVenues: 0,
          pendingRequests: 0
        });
        
        setRecentBookings([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-[#2c6e49] text-white shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center h-14 px-2">
            {/* Logo and Brand */}
            <div className="flex items-center min-w-[120px]">
              <img src="/logo.png" alt="CST SportSpot Logo" className="h-7 w-7" />
              <h1 className="text-xs font-bold whitespace-nowrap ml-1.5 tracking-tight">CST SportSpot Admin</h1>
            </div>
            
            {/* Main Navigation - All in one line */}
            <div className="flex items-center justify-center flex-1">
              <Link 
                href="/admin" 
                className={`px-3 py-1 mx-1 text-sm font-medium transition-colors rounded flex items-center ${activeTab === 'dashboard' ? 'bg-white text-[#2c6e49]' : 'text-white hover:bg-[#1b4332]'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <FaChartBar className="mr-1" size={14} />
                Dashboard
              </Link>
              <Link 
                href="/admin/venues" 
                className={`px-3 py-1 mx-1 text-sm font-medium transition-colors rounded flex items-center ${activeTab === 'venues' ? 'bg-white text-[#2c6e49]' : 'text-white hover:bg-[#1b4332]'}`}
                onClick={() => setActiveTab('venues')}
              >
                <FaBuilding className="mr-1" size={14} />
                Venues
              </Link>
              <Link 
                href="/admin/users" 
                className={`px-3 py-1 mx-1 text-sm font-medium transition-colors rounded flex items-center ${activeTab === 'users' ? 'bg-white text-[#2c6e49]' : 'text-white hover:bg-[#1b4332]'}`}
                onClick={() => setActiveTab('users')}
              >
                <FaUsers className="mr-1" size={14} />
                Users
              </Link>
              <Link 
                href="/admin/bookings" 
                className={`px-3 py-1 mx-1 text-sm font-medium transition-colors rounded flex items-center ${activeTab === 'bookings' ? 'bg-white text-[#2c6e49]' : 'text-white hover:bg-[#1b4332]'}`}
                onClick={() => setActiveTab('bookings')}
              >
                <FaCalendarAlt className="mr-1" size={14} />
                Bookings
              </Link>
            </div>
            
            {/* User Info and Logout */}
            <div className="flex items-center">
              <div className="hidden md:flex items-center bg-[#1b4332] px-2 py-1 rounded mr-2">
                <span className="text-xs font-medium whitespace-nowrap">Welcome, Admin User</span>
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
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium text-xs"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FaUsers className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Total Users</h2>
                <p className="text-2xl font-semibold">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Active Bookings</h2>
                <p className="text-2xl font-semibold">{stats.activeBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaBuilding className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Total Venues</h2>
                <p className="text-2xl font-semibold">{stats.totalVenues}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <FaChartBar className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Pending Requests</h2>
                <p className="text-2xl font-semibold">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.user}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.venue}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${booking.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                        <button className="text-red-600 hover:text-red-900">Cancel</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/venues" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow hover:bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Manage Venues</h3>
            <p className="text-gray-600">Create, edit and configure sports venues</p>
          </Link>
          <Link href="/admin/users" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow hover:bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
            <p className="text-gray-600">View and manage user accounts</p>
          </Link>
          <Link href="/admin/bookings" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow hover:bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Manage Bookings</h3>
            <p className="text-gray-600">View and manage all venue bookings</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
