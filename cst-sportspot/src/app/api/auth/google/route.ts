import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Profile from '@/models/Profile';

// Google OAuth client setup
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google/callback' // Adjust based on your deployment URL
);

// Redirect to Google login page
export async function GET() {
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent'
  });
  
  return NextResponse.redirect(authUrl);
}

// Handle Google login callback
export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token');
    }
    
    const { email, name, picture, sub } = payload;
    
    // Connect to database
    await dbConnect();
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if not exists
      user = await User.create({
        email,
        name,
        username: email.split('@')[0],
        password: Math.random().toString(36).slice(-8), // Generate random password
        role: 'student',
        googleId: sub
      });
      
      // Create profile for new user
      await Profile.create({
        userId: user._id,
        fullName: name,
        email,
        profileImage: picture || '',
        role: 'student'
      });
    } else {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = sub;
        await user.save();
      }
    }
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      'cst_sportspot_secret_key_for_jwt_verification',
      { expiresIn: '7d' }
    );
    
    return NextResponse.json({
      message: 'Login successful',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
