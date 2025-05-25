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

    // Get all bookings
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    
    console.log(`Found ${bookings.length} bookings in the database`);
    
    // Fetch all users and venues to avoid multiple database queries
    const users = await User.find({});
    const venues = await Venue.find({});
    
    // Create lookup maps for faster access
    const userMap = new Map();
    users.forEach(user => userMap.set(user._id.toString(), user));
    
    const venueMap = new Map();
    venues.forEach(venue => venueMap.set(venue._id.toString(), venue));
    
    console.log(`Loaded ${users.length} users and ${venues.length} venues for lookup`);


    // Format the response
    const formattedBookings = bookings.map(booking => {
      // Convert booking to plain object to handle Mongoose document
      const bookingObj = booking.toObject ? booking.toObject() : booking;
      
      // Extract user data using the lookup map
      let userData = { id: '', name: 'Unknown User', email: '' };
      if (bookingObj.userId) {
        const userId = bookingObj.userId.toString();
        const userDoc = userMap.get(userId);
        
        if (userDoc) {
          userData = {
            id: userId,
            name: userDoc.name || bookingObj.fullName || 'Unknown User',
            email: userDoc.email || bookingObj.email || ''
          };
        } else {
          // User not found in map, use booking's user info
          userData = {
            id: userId,
            name: bookingObj.fullName || 'Unknown User',
            email: bookingObj.email || ''
          };
        }
      } else if (bookingObj.fullName) {
        // Fallback to booking's user info if userId is not present
        userData = {
          id: '',
          name: bookingObj.fullName,
          email: bookingObj.email || ''
        };
      }

      // Extract venue data using the lookup map
      let venueData = { id: '', name: 'Unknown Venue', type: '' };
      
      // First check if we have a venueName directly in the booking
      if (bookingObj.venueName) {
        venueData.name = bookingObj.venueName;
      }
      
      // Then try to get more info from the venue collection
      if (bookingObj.venueId) {
        const venueId = bookingObj.venueId.toString();
        // Try to find venue by ID in our map
        let venueDoc = venueMap.get(venueId);
        
        // If not found by ID, try to find by name
        if (!venueDoc && bookingObj.venueName) {
          const venueName = bookingObj.venueName;
          for (const [_, venue] of venueMap.entries()) {
            if (venue.name === venueName) {
              venueDoc = venue;
              break;
            }
          }
        }
        
        if (venueDoc) {
          venueData = {
            id: venueId,
            name: venueDoc.name || bookingObj.venueName || 'Unknown Venue',
            type: venueDoc.type || ''
          };
        } else {
          // Venue not found in map
          venueData = {
            id: venueId,
            name: bookingObj.venueName || 'Unknown Venue',
            type: ''
          };
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
    });

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    // Verify admin authentication
    const token = req.headers.get('authorization')?.split(' ')[1] || '';
    const payload = await verifyJWT(token) as any;
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get booking ID and updated status from request
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const data = await req.json();
    const { status } = data;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    console.log(`Updating booking ${id} with status: ${status}`);

    // Check if booking exists first
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    // Convert to plain object to avoid Mongoose document issues
    const bookingObj = updatedBooking.toObject ? updatedBooking.toObject() : updatedBooking;

    console.log('Updated booking:', JSON.stringify(bookingObj, null, 2));

    return NextResponse.json({
      id: bookingObj._id.toString(),
      status: bookingObj.status,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    // Verify admin authentication
    const token = req.headers.get('authorization')?.split(' ')[1] || '';
    const payload = await verifyJWT(token) as any;
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get booking ID from query params
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    console.log(`Attempting to delete booking with ID: ${id}`);

    // Check if booking exists first
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Delete booking
    const result = await Booking.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
    }

    console.log(`Successfully deleted booking with ID: ${id}`);
    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
