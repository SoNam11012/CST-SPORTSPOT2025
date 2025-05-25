'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

// This is a client component wrapper for the AuthProvider
// We need this because we can't use 'use client' in layout.tsx when it exports metadata
export default function AuthProviderWrapper({ children }: { children: ReactNode }) {
  // Dynamically import Bootstrap JS on client side
  if (typeof window !== "undefined") {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }
  
  return <AuthProvider>{children}</AuthProvider>;
}
