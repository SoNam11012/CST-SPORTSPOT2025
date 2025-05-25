import { NextResponse } from 'next/server';

// Simple placeholder for Google authentication callback
export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = new URL('/login', url.origin);
  redirectUrl.searchParams.set('message', 'Google authentication is currently being set up. Please use email/password login.');
  return NextResponse.redirect(redirectUrl.toString());
}
