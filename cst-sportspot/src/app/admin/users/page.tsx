'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  username?: string;
  createdAt?: string;
}

export default function AdminUsers() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form state for new user
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'student'
  });

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/home');
    }
  }, [loading, isAdmin, router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
          }
        });
        
        // If API is not implemented yet, use mock data
        if (!response.ok) {
          setUsers([
            { id: '1', name: 'Sonam Dorji', email: 'sonam@example.com', role: 'student', username: 'sonam123', createdAt: '2024-01-15' },
            { id: '2', name: 'Karma Tshering', email: 'karma@example.com', role: 'teacher', username: 'karma456', createdAt: '2024-01-20' },
            { id: '3', name: 'Tashi Wangmo', email: 'tashi@example.com', role: 'student', username: 'tashi789', createdAt: '2024-02-05' },
            { id: '4', name: 'Admin User', email: 'admin@cst.edu.bt', role: 'admin', username: 'admin', createdAt: '2024-01-01' },
          ]);
        } else {
          const data = await response.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        
        // Use mock data as fallback
        setUsers([
          { id: '1', name: 'Sonam Dorji', email: 'sonam@example.com', role: 'student', username: 'sonam123', createdAt: '2024-01-15' },
          { id: '2', name: 'Karma Tshering', email: 'karma@example.com', role: 'teacher', username: 'karma456', createdAt: '2024-01-20' },
          { id: '3', name: 'Tashi Wangmo', email: 'tashi@example.com', role: 'student', username: 'tashi789', createdAt: '2024-02-05' },
          { id: '4', name: 'Admin User', email: 'admin@cst.edu.bt', role: 'admin', username: 'admin', createdAt: '2024-01-01' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error('Failed to add user');
      }

      // Reset form and close modal
      setNewUser({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'student'
      });
      setShowAddModal(false);
      
      // Refresh users list
      const updatedUsers = [...users, {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        username: newUser.username,
        createdAt: new Date().toISOString().split('T')[0]
      }];
      setUsers(updatedUsers);
      
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setIsLoading(true);
      
      // In a real implementation, we would call the API
      // const response = await fetch(`/api/admin/users?id=${id}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
      //   }
      // });
      
      // For now, just update the UI
      setUsers(users.filter(user => user.id !== id));
      
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      
      // In a real implementation, we would call the API
      // const response = await fetch(`/api/admin/users?id=${selectedUser.id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(selectedUser),
      // });
      
      // For now, just update the UI
      setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
      setSelectedUser(null);
      
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

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
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()}
            className="mr-4 text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Go back"
            title="Go back to previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-2xl font-semibold">User Management</h2>
          <div className="flex-grow"></div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#2c6e49] text-white rounded hover:bg-[#1b4332]"
          >
            Add New User
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">Loading users...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2c6e49] text-white rounded hover:bg-[#1b4332]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2c6e49] text-white rounded hover:bg-[#1b4332]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
