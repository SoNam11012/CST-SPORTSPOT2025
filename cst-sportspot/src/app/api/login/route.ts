import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { compare } from 'bcryptjs';
import { signJwt } from '@/lib/auth';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { studentNumber: identifier }
      ]
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: 'Incorrect password' }, { status: 401 });
    }

    const token = signJwt({ id: user._id, email: user.email });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        studentNumber: user.studentNumber
      }
    });
  } catch (error) {
    console.error('[LOGIN_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
