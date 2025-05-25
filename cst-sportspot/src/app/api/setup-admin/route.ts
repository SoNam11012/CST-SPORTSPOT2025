import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Profile from '@/models/Profile';
import bcrypt from 'bcryptjs';

// This is a special route that should only be used during initial setup
// In a production environment, this should be secured or removed
export async function GET(request: Request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Admin user details
    const adminUser = {
      name: 'Admin User',
      email: 'admin@cstsportspot.com',
      username: 'admin',
      password: await bcrypt.hash('admin123', 10), // Default password, should be changed after first login
      role: 'admin'
    };
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [{ email: adminUser.email }, { username: adminUser.username }]
    });
    
    if (existingAdmin) {
      // Update existing user to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        return NextResponse.json({ 
          message: 'Existing user updated with admin role', 
          email: existingAdmin.email,
          username: existingAdmin.username
        });
      }
      
      return NextResponse.json({ 
        message: 'Admin user already exists', 
        email: existingAdmin.email,
        username: existingAdmin.username
      });
    }
    
    // Create new admin user
    const newAdmin = await User.create(adminUser);
    
    // Create admin profile
    await Profile.create({
      userId: newAdmin._id,
      fullName: adminUser.name,
      email: adminUser.email,
      username: adminUser.username,
      role: 'admin'
    });
    
    return NextResponse.json({ 
      message: 'Admin user created successfully', 
      email: adminUser.email,
      username: adminUser.username,
      password: 'admin123' // Only show password in response for initial setup
    });
    
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create admin user' 
    }, { status: 500 });
  }
}
