'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface FormData {
  fullName: string;
  studentNumber: string;
  year: string;
  course: string;
  email: string;
  date: string;
  time: string;
  participants: string;
  needsEquipment: boolean;
  notes: string;
  venueId: string;
  venueName: string;
}

interface User {
  email: string;
  name: string;
  username: string;
  studentNumber?: string;
  role: 'student' | 'teacher';
}

const courses = [
  'Architecture',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Software Engineering',
  'Information Technology',
  'Civil Engineering',
  'Engineering Geology',
  'Electronics and Communication Engineering',
  'Water Resource Enginerring',
];

const BookingModal: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth() as { user: User | null };
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    studentNumber: '',
    year: '',
    course: '',
    email: '',
    date: '',
    time: '',
    participants: '',
    needsEquipment: false,
    notes: '',
    venueId: '',
    venueName: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Pre-fill user data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        studentNumber: user.studentNumber || ''
      }));
    }
  }, [user]);

  // Effect to load venue data from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedVenue = localStorage.getItem('selectedVenue');
        if (storedVenue) {
          const venueData = JSON.parse(storedVenue);
          console.log('Found stored venue data:', venueData);
          
          if (venueData.id && venueData.name) {
            setFormData(prev => ({
              ...prev,
              venueId: venueData.id,
              venueName: venueData.name
            }));
            console.log('Updated form data with stored venue');
          }
        }
      } catch (error) {
        console.error('Error loading stored venue data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const loadBootstrap = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Load Bootstrap JS
          await import('bootstrap/dist/js/bootstrap.bundle.min.js');
          console.log('Bootstrap loaded successfully');
        } catch (error) {
          console.error('Failed to load Bootstrap:', error);
        }
      }
    };
    loadBootstrap();

    const modal = document.getElementById('bookingModal');
    if (modal) {
      const handleShow = (event: Event) => {
        try {
          // Use relatedTarget instead of target to get the button that triggered the modal
          const button = (event as any).relatedTarget as HTMLElement;
          console.log('Modal button:', button);
          
          if (!button) {
            console.error('No button found in event');
            return;
          }
          
          const venue = button.getAttribute('data-venue') || '';
          const venueId = button.getAttribute('data-venue-id') || '';
          console.log('Venue data from attributes:', { venue, venueId });

          // Clear any previous errors
          setError('');
          
          if (!venueId) {
            console.error('No venue ID found in button attributes');
            setError('Invalid venue selection');
            return;
          }

          // Update form data with venue information
          setFormData(prev => ({
            ...prev,
            venueName: venue,
            venueId: venueId,
          }));
          console.log('Form data updated with venue:', venue, 'ID:', venueId);
        } catch (error) {
          console.error('Error in handleShow:', error);
          setError('Error selecting venue. Please try again.');
        }

        const modalHeader = document.querySelector('.modal-header');
        if (modalHeader && formData.venueName) {
          modalHeader.className = `modal-header ${formData.venueName.toLowerCase().replace(/\s/g, '')}`;
        }

        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('date') as HTMLInputElement;
        if (dateInput) {
          dateInput.min = today;
        }
      };

      modal.addEventListener('show.bs.modal', handleShow);

      return () => {
        modal.removeEventListener('show.bs.modal', handleShow);
      };
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user) {
      setError('Please log in to make a booking');
      setLoading(false);
      return;
    }

    // Always ensure we have a venue ID, even if it's a default one
    const venueId = formData.venueId || 'default-venue';
    const venueName = formData.venueName || 'Selected Venue';

    if (!formData.participants || parseInt(formData.participants) <= 0) {
      setError('Please enter a valid number of participants');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting booking with venue data:', {
        venueId,
        venueName
      });
      
      // Prepare booking data for submission with simplified venue handling
      const bookingData = {
        fullName: formData.fullName,
        studentNumber: formData.studentNumber,
        year: formData.year,
        course: formData.course,
        email: formData.email,
        date: formData.date,
        startTime: formData.time,
        endTime: calculateEndTime(formData.time),
        userId: user.email,
        participants: parseInt(formData.participants),
        needsEquipment: formData.needsEquipment,
        notes: formData.notes,
        venueId: venueId,
        venueName: venueName,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Show success message
      alert('Booking created successfully!');
      
      // Close the modal
      const modalElement = document.getElementById('bookingModal');
      if (modalElement) {
        try {
          // Try to use Bootstrap's modal instance if available
          const modalInstance = (window as any).bootstrap?.Modal?.getInstance(modalElement);
          if (modalInstance) {
            modalInstance.hide();
          } else {
            // Fallback to manual hiding
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
              backdrop.remove();
            }
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');
          }
        } catch (modalError) {
          console.error('Error closing modal:', modalError);
        }
      }

      // Reset form data
      setFormData({
        fullName: '',
        studentNumber: '',
        year: '',
        course: '',
        email: '',
        date: '',
        time: '',
        participants: '',
        needsEquipment: false,
        notes: '',
        venueId: '',
        venueName: '',
      });

      // Use setTimeout to ensure the modal is fully closed before redirecting
      setTimeout(() => {
        console.log('Redirecting to bookings page...');
        router.push('/bookings');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setHours(date.getHours() + 2);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="modal fade" id="bookingModal" tabIndex={-1} aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Book {formData.venueName}</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="fullName" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="studentNumber" className="form-label">
                    Student Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="studentNumber"
                    name="studentNumber"
                    value={formData.studentNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="year" className="form-label">
                    Year
                  </label>
                  <select
                    className="form-select"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">First Year</option>
                    <option value="2">Second Year</option>
                    <option value="3">Third Year</option>
                    <option value="4">Fourth Year</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="course" className="form-label">
                    Course
                  </label>
                  <select
                    className="form-select"
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="participants" className="form-label">
                    Number of Participants
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="participants"
                    name="participants"
                    value={formData.participants}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="date" className="form-label">
                    Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="time" className="form-label">
                    Time
                  </label>
                  <input
                    type="time"
                    className="form-control"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="needsEquipment"
                    name="needsEquipment"
                    checked={formData.needsEquipment}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="needsEquipment">
                    Need Equipment
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">
                  Additional Notes
                </label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    'Book Now'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;