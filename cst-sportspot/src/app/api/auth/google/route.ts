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

// Temporary implementation for deployment
export async function GET() {
  // For now, redirect to login page with a message
  return NextResponse.json({
    message: "Google authentication is currently being set up. Please use email/password login."
  });
}

// Temporary implementation for deployment
export async function POST(request: Request) {
  return NextResponse.json({ 
    error: 'Google authentication is currently being set up. Please use email/password login.' 
  }, { status: 503 });
}
