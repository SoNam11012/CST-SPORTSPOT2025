'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import '@/styles/profile.css';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaCalendarAlt, FaBook, FaArrowLeft, FaCamera } from 'react-icons/fa';

interface Profile {
  fullName: string;
  studentNumber: string;
  year: string;
  course: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
  updatedAt?: string; // Make this optional to fix TypeScript error
}

interface BookingStats {
  totalBookings: number;
  activeBookings: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [bookingStats, setBookingStats] = useState<BookingStats>({ totalBookings: 0, activeBookings: 0 });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to fetch user profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data.profile);
      setFormData(data.profile);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch booking statistics
  const fetchBookingStats = async () => {
    try {
      console.log('Fetching booking statistics...');
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Add cache-busting query parameter to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/bookings/stats?t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch booking statistics');
      }
      
      const data = await response.json();
      console.log('Received booking stats:', data);
      
      setBookingStats({
        totalBookings: data.totalBookings || 0,
        activeBookings: data.activeBookings || 0
      });
    } catch (err: any) {
      console.error('Error fetching booking stats:', err);
      // Don't set error state here to avoid blocking the profile display
    }
  };

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading

    if (!user) {
      router.push('/login?redirect=/profile');
      return;
    }

    // Load initial data
    fetchProfile();
    fetchBookingStats();
    
    // Set up interval to refresh booking stats every 30 seconds
    const statsInterval = setInterval(() => {
      fetchBookingStats();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(statsInterval);
  }, [user, router, authLoading]);
  
  // Add a visibility change listener to refresh stats when user returns to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        console.log('Page is now visible, refreshing booking stats');
        fetchBookingStats();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleProfileImageClick = () => {
    if (!isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large. Maximum size is 5MB.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Only JPEG and PNG images are allowed.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create a URL for the image file
      const imageUrl = URL.createObjectURL(file);
      
      // Update UI immediately with the local URL
      if (profile) {
        // Create a temporary display version
        const tempImg = document.createElement('img');
        tempImg.src = imageUrl;
        tempImg.onload = async () => {
          try {
            // Convert to base64 for sending to server
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set dimensions
            canvas.width = tempImg.width;
            canvas.height = tempImg.height;
            
            // Draw image to canvas
            ctx?.drawImage(tempImg, 0, 0);
            
            // Get base64 data URL
            const base64Image = canvas.toDataURL(file.type);
            
            // Update profile in state
            if (profile) {
              setProfile({
                ...profile,
                profileImage: base64Image
              });
            }
            
            // Send to server
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('/api/profile', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                profileImage: base64Image
              })
            });
            
            if (!response.ok) {
              throw new Error('Server error: Failed to update profile image');
            }
            
            setSuccessMessage('Profile image updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
          } catch (err) {
            console.error('Error updating profile image:', err);
            setError('Failed to update profile image. Please try again.');
            fetchProfile(); // Revert on error
          } finally {
            setUploading(false);
            // Clean up object URL
            URL.revokeObjectURL(imageUrl);
          }
        };
        
        tempImg.onerror = () => {
          setError('Failed to load the image');
          setUploading(false);
          URL.revokeObjectURL(imageUrl);
        };
      }
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process the image');
      setUploading(false);
    }
  };

  if (authLoading || loading) {
  return (
      <div className="min-h-screen bg-[#f6fff8]">
        <Navbar />
        <div className="profile-container">
          <div className="loading-skeleton">
            <div className="profile-header">
              <div className="profile-image-container">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto"></div>
              </div>
              <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6fff8]">
        <Navbar />
        <div className="profile-container">
          <div className="error-message">
            <strong>Error! </strong>
            <span>{error}</span>
                  </div>
                  </div>
                </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6fff8] to-[#f0f7f2]">
      <Navbar />
      <div className="profile-container">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="back-button flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          
          <div className="text-sm text-gray-500">
            <span className="mr-2">Last updated:</span>
            <span>{profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
        
        {successMessage && (
          <div className="success-message flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        <div className="profile-header">
          <div className="profile-image-container">
            <div className="relative inline-block">
              <img
                src={profile?.profileImage || 'https://github.com/SoNam11012/CST-SportSpot/blob/main/default-avatar.png?raw=true'}
                alt="Profile"
                className={`profile-image ${!isEditing ? 'cursor-pointer' : ''} ${uploading ? 'opacity-50' : ''}`}
                onClick={handleProfileImageClick}
              />
              {!isEditing && (
                <div className="absolute bottom-0 right-0 bg-[#2c6e49] text-white p-2 rounded-full cursor-pointer shadow-md">
                  <FaCamera size={20} />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2c6e49]"></div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg, image/png" 
                onChange={handleImageUpload} 
              />
            </div>
          </div>
          <h1 className="profile-name">{profile?.fullName}</h1>
          <p className="profile-email">{profile?.email}</p>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-[#e8f5e9] flex items-center justify-center mr-2">
                <FaCalendarAlt size={24} className="text-[#2c6e49]" />
              </div>
            </div>
            <div className="stat-value">{bookingStats.totalBookings}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-[#e8f5e9] flex items-center justify-center mr-2">
                <FaCalendarAlt size={24} className="text-[#2c6e49]" />
              </div>
            </div>
            <div className="stat-value">{bookingStats.activeBookings}</div>
            <div className="stat-label">Active Bookings</div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
                    <input
                      type="text"
                name="fullName"
                value={formData.fullName || ''}
                onChange={handleInputChange}
                className="form-input"
                required
                    />
                  </div>

            <div className="form-group">
              <label className="form-label">Student Number</label>
                    <input
                type="text"
                name="studentNumber"
                value={formData.studentNumber || ''}
                onChange={handleInputChange}
                className="form-input"
                    />
                  </div>

            <div className="form-group">
              <label className="form-label">Year</label>
              <select
                name="year"
                value={formData.year || ''}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Course</label>
                    <input
                type="text"
                name="course"
                value={formData.course || ''}
                onChange={handleInputChange}
                className="form-input"
                    />
                  </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
                    <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleInputChange}
                className="form-input"
                    />
                  </div>

            <div className="button-group">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
                      <button
                        type="submit"
                className="btn btn-primary"
                      >
                        Save Changes
                      </button>
                    </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <div className="info-label">
                <FaUser className="inline mr-2" />
                Student Number
              </div>
              <div className="info-value">{profile?.studentNumber || 'Not provided'}</div>
            </div>

            <div className="info-group">
              <div className="info-label">
                <FaCalendarAlt className="inline mr-2" />
                Year
              </div>
              <div className="info-value">{profile?.year || 'Not provided'}</div>
            </div>

            <div className="info-group">
              <div className="info-label">
                <FaBook className="inline mr-2" />
                Course
              </div>
              <div className="info-value">{profile?.course || 'Not provided'}</div>
            </div>

            <div className="info-group">
              <div className="info-label">
                <FaPhone className="inline mr-2" />
                Phone Number
              </div>
              <div className="info-value">{profile?.phoneNumber || 'Not provided'}</div>
                </div>

            <div className="button-group">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 