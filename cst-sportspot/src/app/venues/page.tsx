'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'aos/dist/aos.css';
import AOS from 'aos';
import Navbar from '@/components/Nav';
import VenueGrid from '@/components/VenueGrid';
import BookingModal from '@/components/BookingModal';
import Footer from '@/components/Footer';
import '@/styles/venue.css';

const VenuePage = () => {
  const router = useRouter();

  useEffect(() => {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
  }, []);

  return (
    <div className="min-h-screen bg-[#f6fff8]">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="back-button"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
        <main className="container">
          <VenueGrid />
        </main>
      </div>
      <BookingModal />
      <Footer />
    </div>
  );
};

export default VenuePage;
