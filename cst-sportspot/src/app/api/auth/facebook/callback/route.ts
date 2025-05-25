import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Profile from '@/models/Profile';

// Facebook OAuth configuration
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const REDIRECT_URI = 'http://localhost:3000/api/auth/facebook/callback'; // Adjust based on your deployment URL

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      throw new Error('No authorization code provided');
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`
    );
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }
    
    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;
    
    // Get user data from Facebook
    const userResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`
    );
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data from Facebook');
    }
    
    const userData = await userResponse.json();
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
    console.error('Facebook callback error:', error);
    // Redirect to login page with error
    const url = new URL(request.url);
    const redirectUrl = new URL('/login', url.origin);
    redirectUrl.searchParams.set('error', 'Facebook authentication failed');
    return NextResponse.redirect(redirectUrl.toString());
  }
}
