import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    await dbConnect();
    return NextResponse.json({ 
      status: 'success',
      message: 'Database connection successful',
      mongodbUri: process.env.MONGODB_URI ? 'Present' : 'Missing'
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      mongodbUri: process.env.MONGODB_URI ? 'Present' : 'Missing'
    }, { status: 500 });
  }
} 