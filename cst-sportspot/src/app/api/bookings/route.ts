import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import Venue from '@/models/Venue';
import { Types } from 'mongoose';

// Define types locally to avoid import issues
interface BookingType {
  _id?: string;
  userId: string;
  venueId: string | any;
  date: string | Date;
  startTime: string;
  endTime: string;
  status: string;
}

interface BookingAvailability {
  isAvailable: boolean;
  conflictingBookings: any[];
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/bookings - Starting request');
    await connectToDatabase();
    console.log('Database connected successfully');

    const userId = request.nextUrl.searchParams.get('userId');
    console.log('Requested bookings for userId:', userId);
    
    if (!userId) {
      console.log('No userId provided in request');
      return NextResponse.json({ error: 'Missing userId', bookings: [] }, { status: 400 });
    }

    try {
      // Find all bookings for the user
      const bookings = await Booking.find({ userId }).lean().sort({ date: 1 });
      console.log(`Found ${bookings.length} bookings for user ${userId}`);
      
      // Debug log the raw bookings data
      console.log('Raw bookings data:', JSON.stringify(bookings, null, 2));
      
      // Transform bookings to ensure proper serialization
      const formattedBookings = bookings.map(booking => {
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
        
        // Extract venue name from the booking data
        // First check if venueName exists directly
        if (booking.venueName && typeof booking.venueName === 'string') {
          safeBooking.venueName = booking.venueName;
        }
        // If not, try to get it from other sources
        else if (booking.venue && booking.venue.name) {
          safeBooking.venueName = booking.venue.name;
        }
        // Finally, if we still don't have a venue name, use a default
        else {
          // Try to use a venue name based on the venueId if available
          const venueMap: Record<string, string> = {
            'basketball': 'Basketball Court',
            'volleyball': 'Volleyball Court',
            'badminton': 'Badminton Court',
            'football': 'Football Field',
            'tennis': 'Tennis Court',
            'swimming': 'Swimming Pool',
            'gym': 'Gymnasium',
            'table-tennis': 'Table Tennis Room',
            'default-venue': 'Sports Facility'
          };
          
          const venueId = typeof booking.venueId === 'string' ? booking.venueId : String(booking.venueId || '');
          // Check if the venueId exists in our map
          safeBooking.venueName = Object.prototype.hasOwnProperty.call(venueMap, venueId) ? venueMap[venueId] : 'Sports Venue';
        }
        
        console.log('Processed booking with venue name:', safeBooking.venueName);
        
        return safeBooking;
      });

      console.log('Returning formatted bookings');
      return NextResponse.json({ bookings: formattedBookings });
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

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/bookings - Starting request');
    await connectToDatabase();
    console.log('Database connected successfully');
    
    let body;
    try {
      body = await request.json();
      console.log('Received booking request with body:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['userId', 'date', 'startTime', 'endTime'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log(`Missing required field: ${field}`);
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Format the date properly if it's a string
    if (typeof body.date === 'string') {
      try {
        // Ensure date is in ISO format
        body.date = new Date(body.date).toISOString();
      } catch (dateError) {
        console.error('Error formatting date:', dateError);
        // Continue with the original date string
      }
    }

    // Ensure we have a venue name
    const venueName = body.venueName || 'Default Venue';
    console.log('Using venue name:', venueName);

    // Create the booking directly with all provided data
    try {
      console.log('Creating booking with data:', {
        userId: body.userId,
        venueId: body.venueId || 'default-venue',
        venueName: venueName,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime
      });
      
      // Check for double bookings before creating the booking
      const availability = await checkAvailability({
        venueId: body.venueId || 'default-venue',
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime
      });
      
      // If the time slot is already booked, return an error
      if (!availability.isAvailable) {
        console.log('Time slot already booked:', availability.conflictingBookings);
        return NextResponse.json(
          { error: 'This time slot is already booked. Please select a different time.' },
          { status: 409 } // Conflict status code
        );
      }
      
      // Fetch venue details to ensure we have complete information
      let venueDetails = null;
      try {
        if (body.venueId) {
          venueDetails = await Venue.findById(body.venueId).lean();
          console.log('Found venue details:', venueDetails ? 'yes' : 'no');
        }
      } catch (venueError) {
        console.error('Error fetching venue details:', venueError);
      }
      
      // Create booking with consistent venue information
      const newBooking = await Booking.create({
        ...body,
        venueId: body.venueId || 'default-venue', // Ensure we have a venueId
        venueName: venueName, // Always include venue name
        // Store venue as an object with complete information
        venue: venueDetails ? {
          id: venueDetails._id.toString(),
          name: venueDetails.name,
          type: venueDetails.type || 'Unknown',
          location: venueDetails.location || 'Unknown'
        } : {
          id: body.venueId || 'default-venue',
          name: venueName,
          type: 'Unknown',
          location: 'Unknown'
        },
        status: 'Approved' // Set status directly to Approved instead of Pending
      });
      
      console.log('Successfully created booking with ID:', newBooking._id);
      
      // Convert to a safe object for JSON response
      const safeBooking = newBooking.toObject ? newBooking.toObject() : newBooking;
      if (safeBooking._id) {
        safeBooking._id = safeBooking._id.toString();
      }
      
      return NextResponse.json(safeBooking, { status: 201 });
    } catch (bookingError) {
      console.error('Error creating booking:', bookingError);
      
      // Try one more time with minimal data
      try {
        console.log('Attempting simplified booking creation');
        const fallbackBooking = await Booking.create({
          userId: body.userId,
          venueId: body.venueId || 'default-venue',
          venueName: venueName,
          date: body.date,
          startTime: body.startTime,
          endTime: body.endTime,
          fullName: body.fullName || 'Unknown User',
          email: body.email || body.userId,
          studentNumber: body.studentNumber || 'Unknown',
          year: body.year || '1',
          course: body.course || 'Unknown',
          participants: body.participants || 1,
          status: 'Approved' // Set status directly to Approved instead of Pending
        });
        
        console.log('Created fallback booking with ID:', fallbackBooking._id);
        
        // Convert to a safe object for JSON response
        const safeFallbackBooking = fallbackBooking.toObject ? fallbackBooking.toObject() : fallbackBooking;
        if (safeFallbackBooking._id) {
          safeFallbackBooking._id = safeFallbackBooking._id.toString();
        }
        
        return NextResponse.json(safeFallbackBooking, { status: 201 });
      } catch (finalError) {
        console.error('Final fallback failed:', finalError);
        return NextResponse.json(
          { error: 'Unable to create booking. Please try again later.' },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// Helper function to check for time slot conflicts
async function checkAvailability(booking: Partial<BookingType>): Promise<BookingAvailability> {
  const venueObjectId = new Types.ObjectId(booking.venueId);

  const conflicts = await Booking.find({
    venueId: booking.venueId,
    date: booking.date,
    status: { $in: ['Approved', 'Pending'] },
    $or: [
      {
        startTime: { $lte: booking.startTime },
        endTime: { $gt: booking.startTime },
      },
      {
        startTime: { $lt: booking.endTime },
        endTime: { $gte: booking.endTime },
      },
    ],
  }).lean();

  return {
    isAvailable: conflicts.length === 0,
    conflictingBookings: conflicts,
  };
}
