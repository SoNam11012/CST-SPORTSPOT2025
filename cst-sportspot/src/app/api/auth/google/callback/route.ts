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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      throw new Error('No authorization code provided');
    }
    
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    
    // Get user info using access token
    const userInfoClient = new OAuth2Client();
    userInfoClient.setCredentials({ access_token: tokens.access_token });
    
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );
    
    const userData = await userInfoResponse.json();
    const { email, name, picture, sub } = userData;
    
    if (!email) {
      throw new Error('Email not provided by Google');
    }
    
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
    
    // Redirect to frontend with token
    const redirectUrl = new URL('/login/social-callback', url.origin);
    redirectUrl.searchParams.set('token', jwtToken);
    redirectUrl.searchParams.set('user', JSON.stringify({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    }));
    
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Google callback error:', error);
    // Redirect to login page with error
    const url = new URL(request.url);
    const redirectUrl = new URL('/login', url.origin);
    redirectUrl.searchParams.set('error', 'Google authentication failed');
    return NextResponse.redirect(redirectUrl.toString());
  }
}
