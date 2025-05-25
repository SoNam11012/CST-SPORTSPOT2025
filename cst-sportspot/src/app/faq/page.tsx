'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/faq.css';
import { FaSearch, FaBasketballBall, FaQuestionCircle, FaArrowLeft } from 'react-icons/fa';
import Footer from '@/components/Footer';  // Adjust path if needed
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const faqData = [
  {
    category: 'General Questions',
    items: [
      {
        question: 'What is CST-SportSpot and how does it work?',
        answer:
          'CST-SportSpot is a campus-based platform that allows students to book sports venues and facilities on campus. Users can browse available venues, check their availability, and make bookings through our user-friendly interface.'
      },
      {
        question: 'Do I need to create an account to book a venue?',
        answer:
          'Yes, you need to create an account to book venues through CST-SportSpot. This helps us manage bookings and ensure a fair and organized system for all users.'
      },
      {
        question: 'Who can use CST-SportSpot?',
        answer:
          'CST-SportSpot is primarily designed for current students, faculty, and staff of the university. Visitors may have limited access depending on current policies.'
      }
    ]
  },
  {
    category: 'Booking & Reservations',
    items: [
      {
        question: 'How far in advance can I book a venue?',
        answer:
          'You can book venues up to 14 days in advance. This allows for flexible planning while ensuring fair access for all users.'
      },
      {
        question: 'How long can I book a venue for?',
        answer:
          'Standard booking slots are 1 hour for individual sports and 2 hours for team sports. Peak hours may have different duration restrictions.'
      },
      {
        question: 'Can I cancel or modify my booking?',
        answer:
          'Yes, you can cancel or modify your booking up to 24 hours before your scheduled time. Late cancellations may be subject to penalties.'
      },
      {
        question: 'How do I know my booking is confirmed?',
        answer:
          'After completing your booking, you will receive an immediate confirmation email containing your booking details.'
      }
    ]
  },
  {
    category: 'Venues & Equipment',
    items: [
      {
        question: 'Is equipment provided with venue bookings?',
        answer:
          'Basic equipment is available for most venues at no additional charge. Please check the specific venue details before booking.'
      },
      {
        question: 'What facilities are available at the venues?',
        answer:
          'All our sports venues include changing rooms with lockers and shower facilities. Some venues may offer additional amenities.'
      },
      {
        question: 'What are the operating hours for sports venues?',
        answer:
          'Indoor venues are open from 7:00 AM to 10:00 PM Monday through Friday, and from 8:00 AM to 8:00 PM on weekends.'
      }
    ]
  },
  {
    category: 'Payments & Fees',
    items: [
      {
        question: 'How much does it cost to book a venue?',
        answer:
          'For students, faculty and staff, all the venue bookings are free. External users may be charged based on university policies.'
      }
    ]
  },
  {
    category: 'Rules & Policies',
    items: [
      {
        question: 'What are the rules for using the sports venues?',
        answer:
          "All users must adhere to the university's code of conduct, respect time slots, and leave the area clean after use."
      },
      {
        question: 'What happens if I cancel my booking late?',
        answer:
          'Cancellations made less than 24 hours before the scheduled booking time may incur a penalty or suspension of booking privileges.'
      },
      {
        question: 'Am I responsible for any damage to the equipment?',
        answer:
          'Yes, users are responsible for any damage caused to the equipment or venue during their booked session.'
      }
    ]
  }
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const accordionRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  const filteredFaqData = useMemo(() => {
    if (!searchTerm) return faqData;

    return faqData
      .map(category => ({
        ...category,
        items: category.items.filter(item =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(category => category.items.length > 0);
  }, [searchTerm]);

  return (
    <div className="faq-page">
      <header className="bg-primary text-white p-4 text-center">
        <h1><FaBasketballBall className="me-2" /> CST-SportSpot FAQ</h1>
        <p>Find answers to common questions about booking sports venues, rules, payments, and more.</p>
      </header>

      <nav className="bg-[#2c6e49] shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()} 
                className="text-white hover:text-[#ffc971] flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Back
              </button>
              <Link href="/" className="text-2xl font-bold text-white flex items-center">
                <i className="fas fa-basketball-ball mr-2"></i>
                CST-SportSpot
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-5">
        <div className="mb-4 position-relative">
          <input
            type="text"
            placeholder="Search for questions..."
            className="form-control search-faq-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="search-faq-input-icon" />
        </div>

        {filteredFaqData.length === 0 ? (
          <div className="no-results text-center">
            <FaQuestionCircle className="no-results-icon" style={{ fontSize: '3rem' }} />
            <h3 className="mb-3">No FAQs Found</h3>
            <p className="no-results-text">
              We couldn't find any FAQs matching your search. Try different keywords or browse through our categories.
            </p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => setSearchTerm('')}
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div ref={accordionRef}>
            {filteredFaqData.map((section, categoryIndex) => (
              <div key={categoryIndex} className="mb-5">
                <h2 className="category-title mb-3">{section.category}</h2>
                <div className="accordion" id={`accordion-${categoryIndex}`}>
                  {section.items.map((faq, itemIndex) => {
                    const uniqueId = `faq-${categoryIndex}-${itemIndex}`;
                    return (
                      <div key={uniqueId} className="accordion-item">
                        <h2 className="accordion-header" id={`heading-${uniqueId}`}>
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#${uniqueId}`}
                            aria-expanded="false"
                            aria-controls={uniqueId}
                          >
                            {faq.question}
                          </button>
                        </h2>
                        <div
                          id={uniqueId}
                          className="accordion-collapse collapse"
                          aria-labelledby={`heading-${uniqueId}`}
                          data-bs-parent={`#accordion-${categoryIndex}`}
                        >
                          <div className="accordion-body">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
