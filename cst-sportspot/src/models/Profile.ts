import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  studentNumber: {
    type: String,
    required: false,
    default: '',
  },
  year: {
    type: String,
    required: false,
    default: '',
  },
  course: {
    type: String,
    required: false,
    default: '',
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: false,
    default: 'student',
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  profileImage: {
    type: String,
    default: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/default-avatar.png?raw=true',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

export default Profile; 