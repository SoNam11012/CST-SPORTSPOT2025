'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupAdmin() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const createAdminUser = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Admin user details
      const adminUser = {
        name: 'Admin User',
        email: 'admin@cstsportspot.com',
        username: 'admin',
        password: 'admin123', // Default password
        role: 'admin',
        studentNumber: 'ADMIN' + Date.now() // Generate a unique student number
      };
      
      // Call the register API to create the admin user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: adminUser.name,
          username: adminUser.username,
          email: adminUser.email,
          password: adminUser.password,
          role: adminUser.role,
          studentNumber: adminUser.studentNumber
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin user');
      }
      
      setResult({
        message: 'Admin user created successfully',
        email: adminUser.email,
        username: adminUser.username,
        password: adminUser.password
      });
      
    } catch (err: any) {
      console.error('Error creating admin user:', err);
      setError(err.message || 'Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Setup Admin User</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {result ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
              {result.message}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded">
              <h3 className="font-semibold mb-2">Admin Credentials:</h3>
              <p><span className="font-medium">Email:</span> {result.email}</p>
              <p><span className="font-medium">Username:</span> {result.username}</p>
              <p><span className="font-medium">Password:</span> {result.password}</p>
              <p className="text-sm mt-2 text-red-600">Please save these credentials and change the password after first login!</p>
            </div>
            
            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-[#2c6e49] text-white rounded hover:bg-[#1b4332]"
              >
                Go to Login
              </button>
              <button
                onClick={() => window.location.href = '/admin'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Admin
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              This will create an admin user with the following credentials:
            </p>
            
            <div className="bg-gray-50 border border-gray-200 p-4 rounded">
              <p><span className="font-medium">Email:</span> admin@cstsportspot.com</p>
              <p><span className="font-medium">Username:</span> admin</p>
              <p><span className="font-medium">Password:</span> admin123</p>
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={createAdminUser}
                disabled={loading}
                className={`px-4 py-2 bg-[#2c6e49] text-white rounded hover:bg-[#1b4332] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating...' : 'Create Admin User'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
