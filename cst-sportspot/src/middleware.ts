import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // Check if the pathname starts with /admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value || '';
    
    // If no token exists, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify the token
      // Using a consistent secret since .env might not be available
      const secret = new TextEncoder().encode('cst_sportspot_secret_key_for_jwt_verification');
      const { payload } = await jwtVerify(token, secret);
      
      // Check if user has admin role
      if (payload.role !== 'admin') {
        // Redirect non-admin users to home page
        return NextResponse.redirect(new URL('/home', request.url));
      }
      
      // Allow admin users to access admin routes
      return NextResponse.next();
    } catch (error) {
      // If token verification fails, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Continue for non-admin routes
  return NextResponse.next();
}

// Configure the middleware to run only on admin routes
export const config = {
  matcher: '/admin/:path*',
};
