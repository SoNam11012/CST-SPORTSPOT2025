import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
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
    // Verify authentication
    const token = req.headers.get('authorization')?.split(' ')[1] || '';
    const payload = await verifyJWT(token) as any;
    
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get user ID from token (could be id or email depending on your auth system)
    const userId = payload.id || payload.email || payload.sub;
    
    console.log('Fetching booking stats for user:', userId);

    // Get total bookings count for this user
    const totalBookings = await Booking.countDocuments({ userId });
    console.log('Total bookings found:', totalBookings);
    
    // Get active bookings count (status = 'Approved' or 'Pending')
    const activeBookings = await Booking.countDocuments({ 
      userId, 
      status: { $in: ['Approved', 'Pending'] },
      date: { $gte: new Date() } // Only count future bookings as active
    });
    console.log('Active bookings found:', activeBookings);
    
    return NextResponse.json({
      totalBookings,
      activeBookings
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    return NextResponse.json({ error: 'Failed to fetch booking statistics' }, { status: 500 });
  }
}
