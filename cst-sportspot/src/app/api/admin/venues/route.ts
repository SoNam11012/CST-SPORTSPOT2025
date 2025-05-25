import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
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

    // Get all venues (no filter for admin)
    const venues = await Venue.find({}).sort({ createdAt: -1 });
    console.log(`Found ${venues.length} venues for admin panel`);

    // Format the response
    const formattedVenues = venues.map(venue => {
      // Convert to plain object to handle Mongoose document
      const venueObj = venue.toObject ? venue.toObject() : venue;
      
      return {
        id: venueObj._id.toString(),
        name: venueObj.name,
        type: venueObj.type,
        capacity: venueObj.capacity,
        status: venueObj.status || 'Available',
        equipment: venueObj.equipment || [],
        image: venueObj.image || '',
        bookedSlots: venueObj.bookedSlots || []
      };
    });

    return NextResponse.json({ venues: formattedVenues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Verify admin authentication
    const token = req.headers.get('authorization')?.split(' ')[1] || '';
    const payload = await verifyJWT(token) as any;
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();
    
    const body = await req.json();
    
    // Process equipment if it's a string
    if (typeof body.equipment === 'string') {
      body.equipment = body.equipment.split(',').map((item: string) => item.trim()).filter(Boolean);
    }
    
    const venue = await Venue.create(body);
    return NextResponse.json(venue, { status: 201 });
  } catch (error: any) {
    console.error('[ADMIN_VENUES_POST]', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A venue with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
    
    const body = await req.json();
    const { id, ...updateData } = body;

    // Process equipment if it's a string
    if (typeof updateData.equipment === 'string') {
      updateData.equipment = updateData.equipment.split(',').map((item: string) => item.trim()).filter(Boolean);
    }

    const venue = await Venue.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true, runValidators: true }
    );

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json(venue);
  } catch (error) {
    console.error('[ADMIN_VENUES_PUT]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 });
    }

    // Check if venue exists
    const venue = await Venue.findById(id);
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Check if venue has associated bookings
    const bookingsCount = await Booking.countDocuments({ venueId: id });
    if (bookingsCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete venue with existing bookings. Please delete associated bookings first or change their venue.' 
      }, { status: 400 });
    }

    // Delete venue
    await Venue.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('[ADMIN_VENUES_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
