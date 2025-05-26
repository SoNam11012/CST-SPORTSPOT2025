'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO,
  addDays
} from 'date-fns';
import { FaArrowLeft } from 'react-icons/fa';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  status?: string;
  bookedBy?: string;
}

interface VenueAvailabilityCheckerProps {
  venueId: string;
  onTimeSlotSelect?: (date: string, startTime: string, endTime: string, isAvailable: boolean) => void;
  onBookNow?: () => void;
}

export default function VenueAvailabilityChecker({ venueId, onTimeSlotSelect, onBookNow }: VenueAvailabilityCheckerProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);

  // Generate time slots from 6:00 AM to 10:00 PM in 1-hour increments
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    for (let hour = 6; hour < 22; hour++) {
      const startHour = hour.toString().padStart(2, '0');
      const endHour = (hour + 1).toString().padStart(2, '0');
      
      slots.push({
        startTime: `${startHour}:00`,
        endTime: `${endHour}:00`,
        isAvailable: true
      });
    }
    return slots;
  };

  // Update calendar days when month changes
  useEffect(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Add days from previous month to start the calendar on Sunday
    const firstDayOfMonth = days[0].getDay();
    const previousMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => 
      addDays(start, -(firstDayOfMonth - i))
    );
    
    // Add days from next month to end the calendar on Saturday
    const lastDayOfMonth = days[days.length - 1].getDay();
    const nextMonthDays = Array.from({ length: 6 - lastDayOfMonth }, (_, i) => 
      addDays(end, i + 1)
    );
    
    setCalendarDays([...previousMonthDays, ...days, ...nextMonthDays]);
  }, [currentDate]);

  // Fetch availability data when a date is selected
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots(generateTimeSlots());
      return;
    }

    const fetchAvailability = async () => {
      setLoading(true);
      setError('');
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(`/api/venues/${venueId}/calendar-availability?date=${formattedDate}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch availability data');
        }
        
        const data = await response.json();
        console.log('Availability data:', data); // Debug log
        const bookedSlotsData = data.bookedSlots || [];
        setBookedSlots(bookedSlotsData);
        
        if (bookedSlotsData.length === 0) {
          // If no bookings, just show the message that all slots are available
          setTimeSlots([]);
        } else {
          // Only show booked slots
          setTimeSlots(bookedSlotsData.map((slot: any) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: false,
            status: slot.status,
            bookedBy: slot.bookedBy || 'Reserved'
          })));
        }
      } catch (err: any) {
        console.error('Error fetching availability:', err);
        setError(err.message || 'Failed to load availability data');
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
    
    // Set up an interval to refresh the data every 30 seconds
    const intervalId = setInterval(() => {
      fetchAvailability();
    }, 30000);
    
    // Clean up the interval when the component unmounts or when the date changes
    return () => clearInterval(intervalId);
  }, [selectedDate, venueId]);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSlotClick = (slot: TimeSlot) => {
    if (!selectedDate || !slot.isAvailable) return;
    
    if (onTimeSlotSelect) {
      onTimeSlotSelect(
        format(selectedDate, 'yyyy-MM-dd'),
        slot.startTime,
        slot.endTime,
        slot.isAvailable
      );
    }
  };
  
  const handleBookNow = () => {
    if (onBookNow) {
      onBookNow();
    } else if (selectedDate && onTimeSlotSelect) {
      // If no specific onBookNow handler is provided, use the onTimeSlotSelect with the first available slot
      const availableSlots = generateTimeSlots().filter(slot => 
        !timeSlots.some(bookedSlot => 
          bookedSlot.startTime === slot.startTime && 
          bookedSlot.endTime === slot.endTime
        )
      );
      
      if (availableSlots.length > 0) {
        onTimeSlotSelect(
          format(selectedDate, 'yyyy-MM-dd'),
          availableSlots[0].startTime,
          availableSlots[0].endTime,
          true
        );
      }
    }
  };

  // Check if a date has any bookings
  const hasBookings = (date: Date) => {
    if (!selectedDate || !bookedSlots || bookedSlots.length === 0) return false;
    
    // For the current implementation, we're checking if the selected date has bookings
    // and showing an indicator for that date
    return isSameDay(date, selectedDate) && bookedSlots.length > 0;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-[#2c6e49] transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Venues</span>
        </button>
        <h2 className="text-xl font-semibold text-gray-800">Check Availability</h2>
      </div>
      
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handlePreviousMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <i className="fas fa-chevron-left text-gray-600"></i>
        </button>
        <h3 className="text-lg font-medium text-gray-700">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <button 
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <i className="fas fa-chevron-right text-gray-600"></i>
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const isTodayDate = isToday(day);
            const isPastDate = day < new Date(new Date().setHours(0, 0, 0, 0));
            
            return (
              <button
                key={index}
                onClick={() => !isPastDate && handleDateSelect(day)}
                disabled={isPastDate}
                className={`
                  p-2 rounded-full text-sm relative
                  ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
                  ${isSelected ? 'bg-[#2c6e49] text-white' : ''}
                  ${isTodayDate && !isSelected ? 'border border-[#2c6e49]' : ''}
                  ${isPastDate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                `}
              >
                {format(day, 'd')}
                {hasBookings(day) && (
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Time Slots */}
      {selectedDate && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">
            Bookings for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h4>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c6e49]"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-2">{error}</div>
          ) : timeSlots.length === 0 ? (
            <div className="bg-[#e9f5db] text-[#2c6e49] p-4 rounded text-center">
              <p className="font-medium">No bookings for this date!</p>
              <p className="text-sm mt-2">All time slots are available for booking.</p>
              <button
                onClick={() => handleBookNow()}
                className="mt-4 px-6 py-2 bg-[#2c6e49] text-white rounded-md hover:bg-[#1b4332] transition-colors"
              >
                Book Now
              </button>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              <p className="text-sm text-gray-600">The following time slots are already booked:</p>
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="bg-red-50 border border-red-100 text-red-700 rounded p-3 flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                    <span className="text-xs block mt-1">{slot.status || 'Booked'}</span>
                  </div>
                  {slot.bookedBy && (
                    <span className="text-xs bg-red-100 px-2 py-1 rounded">{slot.bookedBy}</span>
                  )}
                </div>
              ))}
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => handleBookNow()}
                  className="px-6 py-2 bg-[#2c6e49] text-white rounded-md hover:bg-[#1b4332] transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-4 flex items-center text-sm text-gray-600 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#e9f5db] rounded mr-1"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-50 rounded mr-1"></div>
          <span>Booked</span>
        </div>
        {selectedDate && isToday(selectedDate) && (
          <div className="flex items-center">
            <div className="w-3 h-3 border border-[#2c6e49] rounded mr-1"></div>
            <span>Today</span>
          </div>
        )}
      </div>
    </div>
  );
}
