import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Profile from '@/models/Profile';

// Facebook OAuth configuration
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const REDIRECT_URI = 'http://localhost:3000/api/auth/facebook/callback'; // Adjust based on your deployment URL

// Redirect to Facebook login page
export async function GET() {
  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  authUrl.searchParams.append('client_id', FACEBOOK_APP_ID);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('scope', 'email,public_profile');
  authUrl.searchParams.append('response_type', 'code');
  
  return NextResponse.redirect(authUrl.toString());
}

// Handle Facebook login with token
export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    
    // Get user data from Facebook
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data from Facebook');
    }
    
    const userData = await response.json();
    const { id, name, email, picture } = userData;
    
    if (!email) {
      throw new Error('Email not provided by Facebook');
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
        facebookId: id
      });
      
      // Create profile for new user
      await Profile.create({
        userId: user._id,
        fullName: name,
        email,
        profileImage: picture?.data?.url || '',
        role: 'student'
      });
    } else {
      // Update Facebook ID if not set
      if (!user.facebookId) {
        user.facebookId = id;
        await user.save();
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      'cst_sportspot_secret_key_for_jwt_verification',
      { expiresIn: '7d' }
    );
    
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Facebook auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
