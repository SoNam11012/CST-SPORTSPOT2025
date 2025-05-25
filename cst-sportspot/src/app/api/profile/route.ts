import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Profile from '@/models/Profile';

async function getUserIdFromToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    // Use the same hardcoded secret as in other routes
    const decoded = verify(token, 'cst_sportspot_secret_key_for_jwt_verification') as { userId: string };
    return decoded.userId;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, studentNumber, year, course, phoneNumber, profileImage } = body;

    await dbConnect();
    
    // Create update object with only the fields that are provided
    const updateData: any = { updatedAt: new Date() };
    
    if (fullName !== undefined) updateData.fullName = fullName;
    if (studentNumber !== undefined) updateData.studentNumber = studentNumber;
    if (year !== undefined) updateData.year = year;
    if (course !== undefined) updateData.course = course;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    
    console.log('Updating profile with fields:', Object.keys(updateData));
    
    const profile = await Profile.findOneAndUpdate(
      { userId },
      updateData,
      { new: true }
    );

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
} 