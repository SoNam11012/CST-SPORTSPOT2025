import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

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

    // Get all users
    const users = await User.find({}, {
      _id: 1,
      name: 1,
      email: 1,
      username: 1,
      role: 1,
      studentNumber: 1,
      createdAt: 1
    }).sort({ createdAt: -1 });

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      studentNumber: user.studentNumber,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : ''
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
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

    // Parse request body
    const userData = await req.json();

    // Create new user
    const newUser = await User.create(userData);

    return NextResponse.json({
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      createdAt: newUser.createdAt ? new Date(newUser.createdAt).toISOString().split('T')[0] : ''
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
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

    // Get user ID from query params
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Delete user
    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
