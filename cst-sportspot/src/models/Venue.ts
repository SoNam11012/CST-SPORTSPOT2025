import mongoose, { Schema, Document } from 'mongoose';

export interface ISlot {
  date: Date;
  startTime: string;
  endTime: string;
}

export interface IVenue extends Document {
  name: string;
  type: string; // Make this more flexible
  capacity: number;
  status: string; // Make this more flexible
  equipment?: string[];
  image?: string;
  bookedSlots?: ISlot[];
  createdAt?: Date;
  updatedAt?: Date;
}

const SlotSchema: Schema = new Schema(
  {
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const VenueSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a venue name'],
      unique: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify venue type'],
      // Remove enum restriction to allow any string
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify venue capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    status: {
      type: String,
      required: true,
      // Remove enum restriction
      default: 'active',
    },
    equipment: [
      {
        type: String,
      },
    ],
    image: {
      type: String,
      default: '',
    },
    bookedSlots: [SlotSchema], // ✅ Add this line
  },
  {
    timestamps: true,
  }
);

const Venue = mongoose.models.Venue || mongoose.model<IVenue>('Venue', VenueSchema);

export default Venue;
