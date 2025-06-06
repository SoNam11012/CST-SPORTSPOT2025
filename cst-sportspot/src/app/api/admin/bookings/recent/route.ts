import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Venue from '@/models/Venue';

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

    // Fetch the most recent bookings from the database
    const bookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`Found ${bookings.length} recent bookings`);
    
    // Format the response
    const recentBookings = await Promise.all(bookings.map(async (booking) => {
      // Convert booking to plain object to handle Mongoose document
      const bookingObj = booking.toObject ? booking.toObject() : booking;
      
      // Get user data
      let userData = { id: '', name: bookingObj.fullName || 'Unknown User', email: bookingObj.email || '' };
      if (bookingObj.userId) {
        try {
          const user = await User.findById(bookingObj.userId);
          if (user) {
            userData = {
              id: user._id.toString(),
              name: user.name || bookingObj.fullName,
              email: user.email || bookingObj.email
            };
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
      
      // Get venue data
      let venueData = { id: '', name: 'Unknown Venue', type: '' };
      
      // First check if we have a venueName directly in the booking
      if (bookingObj.venueName) {
        venueData.name = bookingObj.venueName;
      }
      
      // Then try to get more info from the venue collection
      if (bookingObj.venueId) {
        try {
          // Try to find venue by ID
          const venue = await Venue.findById(bookingObj.venueId);
          if (venue) {
            venueData = {
              id: venue._id.toString(),
              name: venue.name || bookingObj.venueName || 'Unknown Venue',
              type: venue.type || ''
            };
          } else if (bookingObj.venueName) {
            // If venue not found by ID but we have a name, try to find by name
            const venueByName = await Venue.findOne({ name: bookingObj.venueName });
            if (venueByName) {
              venueData = {
                id: venueByName._id.toString(),
                name: venueByName.name,
                type: venueByName.type || ''
              };
            } else {
              // Just use the name we have
              venueData = {
                id: bookingObj.venueId.toString(),
                name: bookingObj.venueName,
                type: ''
              };
            }
          } else {
            // No venue found and no venueName
            venueData = {
              id: bookingObj.venueId.toString(),
              name: 'Unknown Venue',
              type: ''
            };
          }
        } catch (err) {
          console.error('Error fetching venue data:', err);
          // Use venueName as fallback if available
          if (bookingObj.venueName) {
            venueData.name = bookingObj.venueName;
          }
        }
      }
      
      return {
        id: bookingObj._id.toString(),
        user: userData,
        venue: venueData,
        date: bookingObj.date ? new Date(bookingObj.date).toISOString().split('T')[0] : '',
        startTime: bookingObj.startTime,
        endTime: bookingObj.endTime,
        status: bookingObj.status,
        createdAt: bookingObj.createdAt ? new Date(bookingObj.createdAt).toISOString().split('T')[0] : ''
      };
    }));
    
    console.log('Formatted recent bookings data');
    if (recentBookings.length > 0) {
      console.log('Sample booking:', JSON.stringify(recentBookings[0], null, 2));
    }

    return NextResponse.json(recentBookings);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch recent bookings' }, { status: 500 });
  }
}
