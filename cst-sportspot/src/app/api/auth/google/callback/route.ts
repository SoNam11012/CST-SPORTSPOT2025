import { NextResponse } from 'next/server';
// Temporarily removed google-auth-library dependency for successful deployment
// import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Profile from '@/models/Profile';

// Temporary placeholder - will be properly implemented later
// const client = new OAuth2Client(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   'http://localhost:3000/api/auth/google/callback'
// );

export async function GET(request: Request) {
  // Temporary implementation for deployment
  const url = new URL(request.url);
  const redirectUrl = new URL('/login', url.origin);
  redirectUrl.searchParams.set('message', 'Google authentication is currently being set up. Please use email/password login.');
  return NextResponse.redirect(redirectUrl.toString());
}
