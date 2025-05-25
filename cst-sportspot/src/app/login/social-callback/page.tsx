'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SocialCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userJson = searchParams.get('user');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        
        // Store token and user data
        login(user, token, true);
        
        // Set token in cookie for middleware access
        document.cookie = `token=${token}; path=/; max-age=${60*60*24*7}`; // 7 days
        
        // Redirect based on user role
        if (user.role === 'admin') {
          // Force a hard navigation to ensure context is refreshed
          window.location.href = '/admin';
        } else {
          router.replace('/home');
        }
      } catch (error) {
        console.error('Error processing social login callback:', error);
        router.replace('/login?error=Authentication failed');
      }
    } else {
      router.replace('/login?error=Authentication failed');
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Login</h1>
        <p className="text-gray-600 mb-4">Please wait while we complete your login...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c6e49]"></div>
        </div>
      </div>
    </div>
  );
}
