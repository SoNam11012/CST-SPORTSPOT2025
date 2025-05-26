import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Venue from '@/models/Venue';
import Booking from '@/models/Booking';
import { startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if venue exists
    const venue = await Venue.findById(params.id);
    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Get the start and end of the requested date
    const targetDate = parseISO(date);
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Find all bookings for this venue on the specified date
    const bookings = await Booking.find({
      venueId: params.id,
      status: { $in: ['Pending', 'Approved'] },
      date: {
        $gte: dayStart,
        $lte: dayEnd
      }
    }).sort({ startTime: 1 });

    // Extract booked time slots with more details
    const bookedSlots = bookings.map(booking => ({
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      bookedBy: booking.fullName || booking.email || 'Anonymous',
      bookingId: booking._id,
      participants: booking.participants,
      notes: booking.notes
    }));

    // Get venue's booked slots from the venue model
    const venueBookedSlots = venue.bookedSlots?.filter((slot: { date: Date | string; startTime: string; endTime: string }) => 
      isWithinInterval(new Date(slot.date), {
        start: dayStart,
        end: dayEnd
      })
    ) || [];

    // Combine both sources of booked slots
    const allBookedSlots = [
      ...bookedSlots,
      ...venueBookedSlots.map((slot: { startTime: string; endTime: string }) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: 'Blocked', // For slots blocked by admin
        bookedBy: 'Admin',
        bookingId: null,
        participants: null,
        notes: 'Reserved by administrator'
      }))
    ].sort((a, b) => {
      // Sort by start time
      return a.startTime.localeCompare(b.startTime);
    });

    // Return the availability data
    return NextResponse.json({
      date: date,
      venueName: venue.name,
      venueStatus: venue.status,
      bookedSlots: allBookedSlots,
      isAvailable: venue.status === 'Available'
    });
  } catch (error: any) {
    console.error('Error checking venue calendar availability:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check venue availability' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { date, startTime, endTime } = body;
    
    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Date, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if venue exists
    const venue = await Venue.findById(params.id);
    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Get the start and end of the requested date
    const targetDate = parseISO(date);
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Find any bookings that overlap with the requested time slot
    const overlappingBookings = await Booking.find({
      venueId: params.id,
      status: { $in: ['Pending', 'Approved'] },
      date: {
        $gte: dayStart,
        $lte: dayEnd
      },
      $or: [
        // Booking starts during our slot
        {
          startTime: { $gte: startTime, $lt: endTime }
        },
        // Booking ends during our slot
        {
          endTime: { $gt: startTime, $lte: endTime }
        },
        // Booking completely encompasses our slot
        {
          startTime: { $lte: startTime },
          endTime: { $gte: endTime }
        }
      ]
    });

    // Check venue's booked slots from the venue model
    const venueOverlappingSlots = venue.bookedSlots?.filter((slot: { date: Date | string; startTime: string; endTime: string }) => 
      isWithinInterval(new Date(slot.date), {
        start: dayStart,
        end: dayEnd
      }) && 
      ((slot.startTime >= startTime && slot.startTime < endTime) ||
       (slot.endTime > startTime && slot.endTime <= endTime) ||
       (slot.startTime <= startTime && slot.endTime >= endTime))
    ) || [];

    const isSlotAvailable = 
      venue.status === 'Available' && 
      overlappingBookings.length === 0 && 
      venueOverlappingSlots.length === 0;

    return NextResponse.json({
      date: date,
      startTime: startTime,
      endTime: endTime,
      isAvailable: isSlotAvailable,
      conflictingBookings: overlappingBookings.length + venueOverlappingSlots.length
    });
  } catch (error: any) {
    console.error('Error checking specific time slot availability:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check time slot availability' },
      { status: 500 }
    );
  }
}
