'use client';

import React, { useEffect, useState } from 'react';
import { FaUsers, FaCircle, FaTableTennis, FaBasketballBall, FaVolleyballBall, FaRunning, FaBaseballBall, FaFutbol } from 'react-icons/fa';
import BookingModal from './BookingModal';

interface Venue {
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  img?: string;
  image?: string;
  features?: string[];
  category?: string;
  type?: string;
  capacity?: number;
  status?: string;
  availability?: 'available' | 'limited';
  icon?: React.ReactNode;
  description?: string;
  equipment?: string[];
  bookedSlots?: Array<{date: Date, startTime: string, endTime: string}>;
}

// Fallback venues in case API fails
const fallbackVenues: Venue[] = [
  {
    _id: 'football',
    name: 'Football',
    image: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/fbcourt.jpg?raw=true',
    features: ['Full Size', '22 Players'],
    type: 'outdoor team',
    status: 'Available',
    icon: <FaFutbol />,
    description: 'Standard football field with seating and floodlights.'
  },
  {
    _id: 'basketball',
    name: 'Basketball',
    image: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/bbcourt.jpg?raw=true',
    features: ['Indoor', '10 Players'],
    type: 'indoor team',
    status: 'Available',
    icon: <FaBasketballBall />,
    description: 'Indoor court with scoreboard.'
  },
  {
    _id: 'volleyball',
    name: 'Volleyball',
    image: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/vbcourt.jpg?raw=true',
    features: ['Indoor', '12 Players'],
    type: 'indoor team',
    status: 'Available',
    icon: <FaVolleyballBall />,
    description: 'Indoor volleyball court with net system.'
  }
];

// Map venue types to icons
const getVenueIcon = (type: string = '') => {
  const typeLC = type.toLowerCase();
  if (typeLC.includes('football') || typeLC.includes('soccer')) return <FaFutbol />;
  if (typeLC.includes('basketball')) return <FaBasketballBall />;
  if (typeLC.includes('volleyball')) return <FaVolleyballBall />;
  if (typeLC.includes('table tennis') || typeLC.includes('ping pong')) return <FaTableTennis />;
  if (typeLC.includes('badminton')) return <FaRunning />;
  return <FaRunning />; // Default icon
};

const VenueGrid: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Fetch venues from API
  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/venues');
        if (!response.ok) {
          throw new Error('Failed to fetch venues');
        }
        const data = await response.json();
        
        // Process venues data
        const processedVenues = data.venues.map((venue: Venue) => ({
          ...venue,
          icon: getVenueIcon(venue.type),
          // Create features array based on venue properties
          features: [
            venue.type?.includes('Indoor') ? 'Indoor' : 'Outdoor',
            `${venue.capacity} Players`
          ]
        }));
        
        setVenues(processedVenues.length > 0 ? processedVenues : fallbackVenues);
      } catch (err) {
        console.error('Error fetching venues:', err);
        setError('Failed to load venues. Using fallback data.');
        setVenues(fallbackVenues);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVenues();
  }, []);

  // Filter venues based on query and filter
  useEffect(() => {
    const lowerQuery = query.toLowerCase();
    const filtered = venues.filter(v =>
      (filter === 'all' || 
       (v.type?.toLowerCase().includes(filter) || v.category?.toLowerCase().includes(filter))) &&
      v.name.toLowerCase().includes(lowerQuery)
    );
    setFilteredVenues(filtered);
  }, [filter, query, venues]);

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
        {loading ? (
          // Loading skeleton
          Array(3).fill(0).map((_, idx) => (
            <div key={idx} className="col-sm-6 col-md-4 venue-item">
              <div className="sport-card">
                <div className="sport-img-container position-relative bg-gray-200 animate-pulse"></div>
                <div className="sport-details">
                  <div className="w-full">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="col-12 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredVenues.map((venue, idx) => (
          <div key={idx} className="col-sm-6 col-md-4 venue-item" data-aos="fade-up">
            <div className="sport-card">
              <div className="sport-img-container position-relative">
                <img src={venue.image || venue.img} alt={venue.name} className="sport-img" />
                <div className={`availability-tooltip ${venue.status === 'Available' ? 'available' : 'limited'}`}>
                  <FaCircle /> {venue.status || 'Available'}
                </div>
              </div>
              <div className="sport-details">
                <div>
                  <div className="sport-icon">{venue.icon}</div>
                  <h3 className="sport-name">{venue.name}</h3>
                  <div className="venue-features">
                    {venue.features?.map((f, i) => (
                      <div key={i} className="venue-feature">
                        <FaUsers className="me-1" /> {f}
                      </div>
                    ))}
                  </div>
                  <p className="small text-muted">{venue.description}</p>
                </div>
                <div className="venue-buttons">
                  <button
                    className="check-availability-btn"
                    onClick={() => {
                      window.location.href = `/venues/${venue._id}#availability`;
                    }}
                  >
                    Check Availability
                  </button>
                  <button
                    className="book-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#bookingModal"
                    data-venue={venue.name}
                    data-venue-id={venue._id}
                    data-venue-type={venue.type || venue.category}
                    onClick={() => {
                      // Store venue data in localStorage as a backup method
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('selectedVenue', JSON.stringify({
                          id: venue._id,
                          name: venue.name,
                          category: venue.type || venue.category
                        }));
                      }
                      console.log('Booking button clicked for venue:', venue.name, 'with ID:', venue._id);
                    }}
                  >
                    Book Now
                  </button>
                </div>
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