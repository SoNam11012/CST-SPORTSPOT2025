import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Venue from '@/models/Venue';
import Booking from '@/models/Booking';

// Helper function to verify JWT token
async function verifyJWT(token: string) {
  try {
    // Using a consistent secret since .env might not be available
    const decoded = jwt.verify(token, 'cst_sportspot_secret_key_for_jwt_verification');
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    // Verify admin authentication
    const token = req.headers.get('authorization')?.split(' ')[1] || '';
    const payload = await verifyJWT(token) as any;
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get real counts from database
    const totalUsers = await User.countDocuments();
    const totalVenues = await Venue.countDocuments();
    
    // Get active bookings (status = 'confirmed')
    const activeBookings = await Booking.countDocuments({ status: 'confirmed' });
    
    // Get pending requests (status = 'pending')
    const pendingRequests = await Booking.countDocuments({ status: 'pending' });
    
    // Return real stats from database
    return NextResponse.json({
      totalUsers,
      activeBookings,
      totalVenues,
      pendingRequests
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
