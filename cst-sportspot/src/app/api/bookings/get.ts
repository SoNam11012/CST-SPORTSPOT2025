import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Booking from '@/models/Booking';

export async function GET(request: Request) {
  try {
    console.log('GET /api/bookings/get - Starting request');
    await dbConnect();
    console.log('Database connected successfully');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    console.log('Requested bookings for userId:', userId);

    if (!userId) {
      console.log('No userId provided in request');
      return NextResponse.json(
        { error: 'User ID is required', bookings: [] },
        { status: 400 }
      );
    }

    try {
      // Try to find bookings without populate first to isolate any issues
      const bookings = await Booking.find({ userId }).sort({ date: 1 }).lean();
      console.log(`Found ${bookings.length} bookings for user ${userId}`);
      
      // Convert any ObjectId to string to ensure JSON serialization works
      const safeBookings = bookings.map(booking => {
        // Create a new object with all properties
        const safeBooking = { ...booking };
        
        // Ensure _id is a string
        if (safeBooking._id) {
          safeBooking._id = safeBooking._id.toString();
        }
        
        // Ensure venueId is a string if it exists
        if (safeBooking.venueId && typeof safeBooking.venueId === 'object') {
          safeBooking.venueId = safeBooking.venueId.toString();
        }
        
        return safeBooking;
      });
      
      // Return the bookings directly without trying to populate
      // This simplifies the query and avoids potential issues with references
      return NextResponse.json({ bookings: safeBookings });
    } catch (dbError: any) {
      console.error('Database error fetching bookings:', dbError);
      return NextResponse.json(
        { error: 'Database error: ' + (dbError.message || 'Unknown error'), bookings: [] },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings', bookings: [] },
      { status: 500 }
    );
  }
}
