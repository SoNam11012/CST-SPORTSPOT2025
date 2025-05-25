import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const MONGODB_URI = process.env.MONGODB_URI;
export const DB_NAME = 'register'; // replace with your DB name

export const COLLECTIONS = {
  USERS: 'users',
  BOOKINGS: 'bookings',
  VENUES: 'venues'
};

if (!MONGODB_URI) {
  throw new Error('❌ Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache;
}

let cached = global.mongooseCache || { conn: null, promise: null };

if (process.env.NODE_ENV === 'development') {
  if (!global.mongooseCache) {
    global.mongooseCache = cached;
  }
}

async function dbConnect(): Promise<typeof mongoose> {
  try {
    if (cached.conn) {
      console.log('Using cached database connection');
      return cached.conn;
    }

    if (!cached.promise) {
      console.log('Creating new database connection to:', MONGODB_URI);
      cached.promise = mongoose.connect(MONGODB_URI!, {
        dbName: DB_NAME,
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
        socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
        connectTimeoutMS: 10000, // 10 seconds timeout for initial connection
        maxPoolSize: 10, // Maintain up to 10 socket connections
      });
    }

    console.log('Awaiting database connection...');
    cached.conn = await cached.promise;
    console.log('Database connected successfully');
    return cached.conn;
  } catch (error) {
    console.error('Database connection error:', error);
    // Reset the promise so we can try again next time
    cached.promise = null;
    throw error;
  }
}

export default dbConnect;
