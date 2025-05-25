import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Venue from '@/models/Venue';
import Booking from '@/models/Booking';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Check if venue exists and is available
    const venue = await Venue.findById(params.id);
    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    if (venue.status !== 'Available') {
      return NextResponse.json({
        isAvailable: false,
        reason: 'Venue is not available for booking'
      });
    }

    // Check if venue has any active bookings
    const activeBookings = await Booking.find({
      venueId: params.id,
      status: 'confirmed',
      date: { $gte: new Date() }
    });

    return NextResponse.json({
      isAvailable: true,
      activeBookings: activeBookings.length
    });
  } catch (error: any) {
    console.error('Error checking venue availability:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check venue availability' },
      { status: 500 }
    );
  }
} 