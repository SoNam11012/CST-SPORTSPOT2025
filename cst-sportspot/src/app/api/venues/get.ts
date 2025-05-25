import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Venue from '@/models/Venue';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const type = searchParams.get('type');

    const filter: any = {};
    if (sport) filter.sport = sport;
    if (type) filter.type = new RegExp(type, 'i'); // case-insensitive

    const venues = await Venue.find(filter).lean();

    return NextResponse.json(venues);
  } catch (error) {
    console.error('[GET_VENUES_ERROR]', error);
    return NextResponse.json({ error: 'Server error fetching venues' }, { status: 500 });
  }
}
