import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { Text, Box, OrbitControls, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import * as THREE from 'three';

interface Booking {
  id: string;
  date: string;
  venue: string | { name: string; id: string };
  status: string;
}

interface CalendarDayProps {
  date: Date;
  bookings: Booking[];
  isCurrentMonth: boolean;
  onClick: () => void;
  isSelected: boolean;
  position: [number, number, number];
}

// Individual calendar day cube
function CalendarDay({ date, bookings, isCurrentMonth, onClick, isSelected, position }: CalendarDayProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  
  // Find if there are any bookings for this day
  const hasBookings = bookings.some(booking => {
    const bookingDate = new Date(booking.date);
    return isSameDay(bookingDate, date);
  });
  
  // Get booking status if there's a booking
  const getBookingStatus = () => {
    const booking = bookings.find(b => {
      const bookingDate = new Date(b.date);
      return isSameDay(bookingDate, date);
    });
    return booking ? booking.status : null;
  };
  
  const status = getBookingStatus();
  
  // Determine color based on booking status
  const getColor = () => {
    if (!isCurrentMonth) return "#cccccc";
    if (!hasBookings) return "#ffffff";
    if (status === 'Approved') return "#4ade80";
    if (status === 'Pending') return "#fbbf24";
    return "#ef4444";
  };
  
  return (
    <group 
      position={position}
      onClick={onClick}
    >
      <Box 
        ref={mesh}
        args={[0.9, 0.9, 0.2]} 
        castShadow
      >
        <meshStandardMaterial 
          color={getColor()} 
          metalness={0.1}
          roughness={0.8}
          emissive={isSelected ? "#2c6e49" : "#000000"}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </Box>
      <Text
        position={[0, 0, 0.15]}
        fontSize={0.4}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        {date.getDate().toString()}
      </Text>
      {hasBookings && (
        <Box
          position={[0, -0.35, 0.15]}
          args={[0.1, 0.1, 0.1]}
          castShadow
        >
          <meshStandardMaterial 
            color={status === 'Approved' ? "#22c55e" : status === 'Pending' ? "#eab308" : "#ef4444"} 
            emissive={status === 'Approved' ? "#22c55e" : status === 'Pending' ? "#eab308" : "#ef4444"}
            emissiveIntensity={0.5}
          />
        </Box>
      )}
    </group>
  );
}

// Calendar header with month name
function CalendarHeader({ month, position }: { month: string, position: [number, number, number] }) {
  return (
    <Text
      position={position}
      fontSize={0.8}
      color="#2c6e49"
      anchorX="center"
      anchorY="middle"
      font="/fonts/Inter-Bold.woff"
    >
      {month}
    </Text>
  );
}

// Calendar grid with days of week
function CalendarDaysOfWeek({ position }: { position: [number, number, number] }) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <group position={position}>
      {daysOfWeek.map((day, index) => (
        <Text
          key={day}
          position={[(index - 3) * 1.2, 0, 0]}
          fontSize={0.4}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          {day}
        </Text>
      ))}
    </group>
  );
}

interface Dashboard3DCalendarProps {
  bookings: Booking[];
  onSelectDate?: (date: Date) => void;
}

export default function Dashboard3DCalendar({ bookings = [], onSelectDate }: Dashboard3DCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Generate days for current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Handle day click
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    if (onSelectDate) {
      onSelectDate(date);
    }
  };
  
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.5} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* Month header */}
        <CalendarHeader 
          month={format(currentDate, 'MMMM yyyy')} 
          position={[0, 5, 0]} 
        />
        
        {/* Days of week header */}
        <CalendarDaysOfWeek position={[0, 3.5, 0]} />
        
        {/* Calendar days */}
        <group position={[0, 0, 0]}>
          {days.map((day, index) => {
            const dayOfWeek = day.getDay();
            const weekOfMonth = Math.floor((index + monthStart.getDay()) / 7);
            
            return (
              <CalendarDay
                key={day.toISOString()}
                date={day}
                bookings={bookings}
                isCurrentMonth={true}
                onClick={() => handleDayClick(day)}
                isSelected={selectedDate ? isSameDay(selectedDate, day) : false}
                position={[
                  (dayOfWeek - 3) * 1.2, // x position based on day of week
                  2 - weekOfMonth * 1.2,  // y position based on week of month
                  0
                ]}
              />
            );
          })}
        </group>
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          minDistance={10}
          maxDistance={20}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
