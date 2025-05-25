'use client';

import { signIn } from 'next-auth/react';

export default function SocialLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-6">Sign in with</h2>
        <div className="space-y-4">
          <button
            onClick={() => signIn('google')}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Continue with Google
          </button>
          <button
            onClick={() => signIn('facebook')}
            className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-900"
          >
            Continue with Facebook
          </button>
        </div>
      </div>
    </main>
  );
}
