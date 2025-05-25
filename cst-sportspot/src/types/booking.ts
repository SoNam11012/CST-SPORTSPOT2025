'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

const courses = [
  'Computer Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Business Administration',
  'Psychology',
  'Biology',
  'Mathematics',
  'English Literature',
  'Other',
];

const BookingModal: React.FC = () => {
  const router = useRouter();
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

  useEffect(() => {
    const modal = document.getElementById('bookingModal');
    if (modal) {
      const handleShow = (event: Event) => {
        const button = (event as any).relatedTarget as HTMLElement;
        const venue = button?.getAttribute('data-venue') || '';
        const venueId = button?.getAttribute('data-venue-id') || '';
        setFormData((prev) => ({
          ...prev,
          venueName: venue,
          venueId: venueId,
        }));
        const modalHeader = document.querySelector('.modal-header');
        if (modalHeader) {
          modalHeader.className = `modal-header ${venue.toLowerCase().replace(/\s/g, '')}`;
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
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

    try {
      const bookingData = {
        ...formData,
        startTime: formData.time,
        endTime: calculateEndTime(formData.time),
        status: 'pending',
        userId: 'user123', // Replace with actual user ID from authentication
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data: { message: string; error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Close modal
      const modalElement = document.getElementById('bookingModal');
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      }

      // Reset form
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

      // Redirect to bookings page
      router.push('/bookings');
    } catch (err) {
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
    return `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes(),
    ).padStart(2, '0')}`;
  };

  return (
    <div className="modal fade" id="bookingModal" tabIndex={-1} aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Book <span id="venue-name">{formData.venueName}</span>
            </h5>
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
            <form id="bookingForm" onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Student Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="studentNumber"
                    value={formData.studentNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Year</label>
                  <select
                    className="form-select"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your year</option>
                    {[1, 2, 3, 4, 5].map((y) => (
                      <option key={y} value={y}>{`${y} Year`}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-8">
                  <label className="form-label">Course</label>
                  <select
                    className="form-select"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your course</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Booking Date</label>
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
                  <label className="form-label">Booking Time</label>
                  <input
                    type="time"
                    className="form-control"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Participants</label>
                <input
                  type="number"
                  className="form-control"
                  name="participants"
                  value={formData.participants}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  aproposid="equipment-needed"
                  name="needsEquipment"
                  checked={formData.needsEquipment}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="equipment-needed">
                  Need Equipment?
                </label>
              </div>
              <div className="mb-3">
                <label className=" дожform-label">Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional information"
                />
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
                  {loading ? 'Booking...' : 'Book Now'}
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