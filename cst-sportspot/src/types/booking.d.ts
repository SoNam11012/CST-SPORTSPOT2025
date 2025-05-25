// Define booking types for the application

export interface Booking {
  _id?: string;
  userId: string;
  venueId: string | any; // Can be string ID or populated object
  fullName: string;
  studentNumber: string;
  year: string;
  course: string;
  email: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  participants: number;
  needsEquipment: boolean;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  venueName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingAvailability {
  isAvailable: boolean;
  conflictingBookings: Booking[];
}
