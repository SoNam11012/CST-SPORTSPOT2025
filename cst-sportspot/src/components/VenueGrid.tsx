'use client';

import React, { useEffect, useState } from 'react';
import { FaUsers, FaCircle, FaTableTennis, FaBasketballBall, FaVolleyballBall, FaRunning, FaBaseballBall, FaFutbol } from 'react-icons/fa';
import BookingModal from './BookingModal';
// Removed MongoDB dependency to avoid browser compatibility issues

interface Venue {
  id: string;
  name: string;
  img: string;
  features: string[];
  category: string;
  availability: 'available' | 'limited';
  icon: React.ReactNode;
  description: string;
}

const venues: Venue[] = [
  {
    id: 'football',
    name: 'Football',
    img: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/fbcourt.jpg?raw=true',
    features: ['Full Size', '22 Players'],
    category: 'outdoor team',
    availability: 'available',
    icon: <FaFutbol />,
    description: 'Standard football field with seating and floodlights.'
  },
  {
    id: 'basketball',
    name: 'Basketball',
    img: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/bbcourt.jpg?raw=true',
    features: ['Indoor', '10 Players'],
    category: 'indoor team',
    availability: 'limited',
    icon: <FaBasketballBall />,
    description: 'Indoor court with scoreboard.'
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    img: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/vbcourt.jpg?raw=true',
    features: ['Indoor', '12 Players'],
    category: 'indoor team',
    availability: 'available',
    icon: <FaVolleyballBall />,
    description: 'Indoor volleyball court with net system.'
  },
  {
    id: 'tabletennis',
    name: 'Table Tennis',
    img: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/ttcourt.jpg?raw=true',
    features: ['Indoor', '2-4 Players'],
    category: 'indoor individual',
    availability: 'available',
    icon: <FaTableTennis />,
    description: 'Professional-grade tables and lighting.'
  },
  {
    id: 'badminton1',
    name: 'Indoor Badminton Court 1',
    img: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/ibcourt.jpg?raw=true',
    features: ['Indoor', '2-4 Players'],
    category: 'indoor individual',
    availability: 'available',
    icon: <FaRunning />,
    description: 'Four courts with proper flooring and nets.'
  },
  {
    id: 'badminton2',
    name: 'Indoor Badminton Court 2',
    img: 'https://github.com/SoNam11012/court/blob/main/20250318_163543.jpg?raw=true',
    features: ['Indoor', '2-4 Players'],
    category: 'indoor individual',
    availability: 'limited',
    icon: <FaBaseballBall />,
    description: 'Hard-surface court with proper markings.'
  }
];

const VenueGrid: React.FC = () => {
  const [filteredVenues, setFilteredVenues] = useState(venues);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const loadBootstrap = async () => {
      if (typeof window !== 'undefined') {
        try {
          await import('bootstrap/dist/js/bootstrap.bundle.min.js');
        } catch (error) {
          console.error('Failed to load Bootstrap:', error);
        }
      }
    };
    loadBootstrap();
  }, []);

  useEffect(() => {
    const lowerQuery = query.toLowerCase();
    const filtered = venues.filter(v =>
      (filter === 'all' || v.category.includes(filter)) &&
      v.name.toLowerCase().includes(lowerQuery)
    );
    setFilteredVenues(filtered);
  }, [filter, query]);

  const handleSort = (sortType: 'asc' | 'desc') => {
    const sorted = [...filteredVenues].sort((a, b) =>
      sortType === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    setFilteredVenues(sorted);
  };

  return (
    <section className="all-sports">
      <h2 className="section-title" data-aos="fade-up">Sports Venues</h2>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="search-results-info mb-0">Showing {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''}</p>
        <div className="dropdown">
          <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            Sort by
          </button>
          <ul className="dropdown-menu">
            <li><button className="dropdown-item" onClick={() => handleSort('asc')}>Name (A-Z)</button></li>
            <li><button className="dropdown-item" onClick={() => handleSort('desc')}>Name (Z-A)</button></li>
          </ul>
        </div>
      </div>

      <div className="filter-tags mb-4">
        {['all', 'indoor', 'outdoor', 'team', 'individual'].map(tag => (
          <button
            key={tag}
            className={`filter-tag ${filter === tag ? 'active' : ''}`}
            onClick={() => setFilter(tag)}
          >
            {tag.charAt(0).toUpperCase() + tag.slice(1)}
          </button>
        ))}
      </div>

      <div className="row g-4" id="sports-grid">
        {filteredVenues.map((venue, idx) => (
          <div key={idx} className="col-sm-6 col-md-4 venue-item" data-aos="fade-up">
            <div className="sport-card">
              <div className="sport-img-container position-relative">
                <img src={venue.img} alt={venue.name} className="sport-img" />
                <div className={`availability-tooltip ${venue.availability}`}>
                  <FaCircle /> {venue.availability.charAt(0).toUpperCase() + venue.availability.slice(1)}
                </div>
              </div>
              <div className="sport-details">
                <div>
                  <div className="sport-icon">{venue.icon}</div>
                  <h3 className="sport-name">{venue.name}</h3>
                  <div className="venue-features">
                    {venue.features.map((f, i) => (
                      <div key={i} className="venue-feature">
                        <FaUsers className="me-1" /> {f}
                      </div>
                    ))}
                  </div>
                  <p className="small text-muted">{venue.description}</p>
                </div>
                <button
                  className="book-btn"
                  data-bs-toggle="modal"
                  data-bs-target="#bookingModal"
                  data-venue={venue.name}
                  data-venue-id={venue.id}
                  data-venue-type={venue.category}
                  onClick={() => {
                    // Store venue data in localStorage as a backup method
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('selectedVenue', JSON.stringify({
                        id: venue.id,
                        name: venue.name,
                        category: venue.category
                      }));
                    }
                    console.log('Booking button clicked for venue:', venue.name, 'with ID:', venue.id);
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <BookingModal />
    </section>
  );
};

export default VenueGrid;