// Script to update bookings with missing venue names
const mongoose = require('mongoose');
require('dotenv').config();

// Define Booking schema for this script
const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  venueId: { 
    type: mongoose.Schema.Types.Mixed,
    ref: 'Venue', 
    required: true 
  },
  venueName: { type: String, required: false },
  fullName: { type: String, required: true },
  studentNumber: { type: String, required: true },
  year: { type: String, required: true },
  course: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  participants: { type: Number, required: true },
  needsEquipment: { type: Boolean, default: false },
  notes: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

// Define Venue schema for this script
const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  capacity: { type: Number, required: true },
  image: { type: String, required: true },
  availability: { type: Boolean, default: true }
});

// Create models
const Booking = mongoose.model('Booking', bookingSchema);
const Venue = mongoose.model('Venue', venueSchema);

// Venue name mapping for common venue IDs
const venueNameMap = {
  'basketball': 'Basketball Court',
  'volleyball': 'Volleyball Court',
  'badminton': 'Badminton Court',
  'football': 'Football Field',
  'tennis': 'Tennis Court',
  'swimming': 'Swimming Pool',
  'gym': 'Gymnasium',
  'table-tennis': 'Table Tennis Room',
  'default-venue': 'Sports Facility'
};

async function updateBookingVenueNames() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all bookings without a venue name
    const bookingsToUpdate = await Booking.find({ 
      $or: [
        { venueName: { $exists: false } },
        { venueName: null },
        { venueName: '' }
      ]
    });
    
    console.log(`Found ${bookingsToUpdate.length} bookings without venue names`);
    
    // Get all venues for lookup
    const venues = await Venue.find({});
    const venueMap = new Map();
    venues.forEach(venue => venueMap.set(venue._id.toString(), venue));
    
    console.log(`Loaded ${venues.length} venues for reference`);

    // Update each booking
    let updatedCount = 0;
    for (const booking of bookingsToUpdate) {
      let venueName = null;
      
      // Try to find venue name from venue collection
      if (booking.venueId) {
        const venueId = booking.venueId.toString();
        const venue = venueMap.get(venueId);
        
        if (venue) {
          venueName = venue.name;
        } else if (venueNameMap[venueId]) {
          // Use predefined mapping if available
          venueName = venueNameMap[venueId];
        }
      }
      
      // If we still don't have a venue name, use a default based on ID
      if (!venueName && booking.venueId) {
        const venueId = booking.venueId.toString();
        // Try to create a readable name from the ID
        venueName = venueId
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      
      // If all else fails, use a generic name
      if (!venueName) {
        venueName = 'Sports Venue';
      }
      
      // Update the booking
      booking.venueName = venueName;
      await booking.save();
      updatedCount++;
      
      console.log(`Updated booking ${booking._id}: Set venue name to "${venueName}"`);
    }
    
    console.log(`Successfully updated ${updatedCount} bookings`);
  } catch (error) {
    console.error('Error updating bookings:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the update function
updateBookingVenueNames();
