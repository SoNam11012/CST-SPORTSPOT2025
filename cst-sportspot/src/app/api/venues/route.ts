import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Venue from '@/models/Venue';

// GET all venues
export async function GET() {
  try {
    await dbConnect();

    const venues = await Venue.find({
      status: 'Available'
    }).sort({ createdAt: -1 }).limit(6);

    return NextResponse.json({ venues });
  } catch (error: any) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch venues' },
      { status: 500 }
    );
  }
}

// POST new venue
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const venue = await Venue.create(body);
    return NextResponse.json(venue, { status: 201 });
  } catch (error: any) {
    console.error('[VENUES_POST]', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A venue with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update venue
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...updateData } = body;

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
    console.error('[VENUES_PUT]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE venue
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 });
    }

    const venue = await Venue.findByIdAndDelete(id);

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('[VENUES_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 