import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Venue from '@/models/Venue';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const venue = await Venue.findById(params.id);

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ venue });
  } catch (error: any) {
    console.error('Error fetching venue:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch venue' },
      { status: 500 }
    );
  }
} 