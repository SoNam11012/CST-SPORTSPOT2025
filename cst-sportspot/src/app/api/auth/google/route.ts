import { NextResponse } from 'next/server';

// Simple placeholder for Google authentication
export async function GET() {
  return NextResponse.json({
    message: "Google authentication is currently being set up. Please use email/password login."
  });
}

export async function POST() {
  return NextResponse.json({ 
    error: 'Google authentication is currently being set up. Please use email/password login.' 
  }, { status: 503 });
}
