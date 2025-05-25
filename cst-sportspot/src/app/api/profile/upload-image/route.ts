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

export async function POST(req: Request) {
  try {
    console.log('Profile image upload request received');
    
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1] || '';
    const payload = await verifyJWT(token) as any;
    
    if (!payload) {
      console.error('Invalid or expired token');
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();
    console.log('Database connected');

    // Get user ID from token
    const userId = payload.id;
    console.log('User ID from token:', userId);

    // Check if the request is multipart/form-data
    const formData = await req.formData();
    const file = formData.get('profileImage') as File;

    if (!file) {
      console.error('No image file in the request');
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }
    
    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size);
      return NextResponse.json({ error: 'Image file is too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Check file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json({ error: 'Only JPEG and PNG images are allowed.' }, { status: 400 });
    }

    try {
      // Convert file to base64 for storage
      // (In a production app, you would upload to a storage service like AWS S3)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
      console.log('Image converted to base64 successfully');

      // Update user profile with the new image
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profileImage: base64Image },
        { new: true }
      );

      if (!updatedUser) {
        console.error('User not found with ID:', userId);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      console.log('User profile updated successfully');

      return NextResponse.json({
        success: true,
        imageUrl: base64Image,
        message: 'Profile image updated successfully'
      });
    } catch (conversionError) {
      console.error('Error processing image:', conversionError);
      return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json({ 
      error: 'Failed to upload profile image', 
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
