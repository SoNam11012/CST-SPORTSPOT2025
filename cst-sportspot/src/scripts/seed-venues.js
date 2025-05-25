// This script will seed the database with the 6 default venues
const { MongoClient } = require('mongodb');

// MongoDB connection string - replace with your actual connection string if different
const uri = "mongodb://localhost:27017/register";

// The 6 default venues from the user venue page
const defaultVenues = [
  {
    name: 'Football',
    type: 'Outdoor',
    capacity: 22,
    status: 'Available',
    equipment: ['Balls', 'Nets', 'Cones'],
    image: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/fbcourt.jpg?raw=true',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Basketball',
    type: 'Indoor',
    capacity: 10,
    status: 'Available',
    equipment: ['Balls', 'Scoreboard'],
    image: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/bbcourt.jpg?raw=true',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Volleyball',
    type: 'Indoor',
    capacity: 12,
    status: 'Available',
    equipment: ['Balls', 'Net System'],
    image: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/vbcourt.jpg?raw=true',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Table Tennis',
    type: 'Indoor',
    capacity: 4,
    status: 'Available',
    equipment: ['Tables', 'Paddles', 'Balls'],
    image: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/ttcourt.jpg?raw=true',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Indoor Badminton Court 1',
    type: 'Indoor',
    capacity: 4,
    status: 'Available',
    equipment: ['Rackets', 'Shuttlecocks', 'Nets'],
    image: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/ibcourt.jpg?raw=true',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Indoor Badminton Court 2',
    type: 'Indoor',
    capacity: 4,
    status: 'Available',
    equipment: ['Rackets', 'Shuttlecocks', 'Nets'],
    image: 'https://github.com/SoNam11012/court/blob/main/20250318_163543.jpg?raw=true',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedVenues() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db('register');
    const venuesCollection = database.collection('venues');
    
    // Check existing venues to avoid duplicates
    for (const venue of defaultVenues) {
      const existingVenue = await venuesCollection.findOne({ name: venue.name });
      
      if (!existingVenue) {
        // Insert the venue if it doesn't exist
        await venuesCollection.insertOne(venue);
        console.log(`Added venue: ${venue.name}`);
      } else {
        console.log(`Venue already exists: ${venue.name}`);
      }
    }
    
    // Count total venues
    const count = await venuesCollection.countDocuments();
    console.log(`Total venues in database: ${count}`);
    
  } catch (error) {
    console.error('Error seeding venues:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedVenues();
