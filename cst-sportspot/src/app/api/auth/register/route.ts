import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Profile from '@/models/Profile';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const { fullName, username, email, password, role, studentNumber, year, course } = body;

    // Validate required fields
    if (!fullName || !username || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if username is at least 3 characters
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists (by email or username)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: fullName,
      username,
      email,
      password: hashedPassword,
      role: role || 'student', // Default to student if not provided
      studentNumber: studentNumber || null, // Use null for empty student numbers
    });

    // Create profile with optional fields
    await Profile.create({
      userId: user._id,
      fullName,
      email,
      username,
      studentNumber: studentNumber || null,
      year: year || null,
      course: course || null,
      role: role || 'student',
    });

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}
