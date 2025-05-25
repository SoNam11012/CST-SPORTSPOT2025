'use client';

import { useState, useEffect } from 'react';

interface Venue {
  id: string;
  name: string;
  type: string;
  capacity: number;
  status: 'Available' | 'Booked' | 'Maintenance';
  equipment: string[];
  image: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  capacity?: string;
  equipment?: string;
}

export default function AdminVenues() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Form state for new venue
  const [newVenue, setNewVenue] = useState({
    name: '',
    type: 'Indoor',
    capacity: '',
    equipment: '',
    status: 'Available' as const
  });

  // Default venues from user page to seed if none exist
  const defaultVenues = [
    {
      name: 'Football',
      type: 'Outdoor',
      capacity: 22,
      status: 'Available',
      equipment: ['Balls', 'Nets', 'Cones'],
      image: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/fbcourt.jpg?raw=true'
    },
    {
      name: 'Basketball',
      type: 'Indoor',
      capacity: 10,
      status: 'Available',
      equipment: ['Balls', 'Scoreboard'],
      image: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/bbcourt.jpg?raw=true'
    },
    {
      name: 'Volleyball',
      type: 'Indoor',
      capacity: 12,
      status: 'Available',
      equipment: ['Balls', 'Net System'],
      image: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/vbcourt.jpg?raw=true'
    },
    {
      name: 'Table Tennis',
      type: 'Indoor',
      capacity: 4,
      status: 'Available',
      equipment: ['Tables', 'Paddles', 'Balls'],
      image: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/ttcourt.jpg?raw=true'
    },
    {
      name: 'Indoor Badminton Court 1',
      type: 'Indoor',
      capacity: 4,
      status: 'Available',
      equipment: ['Rackets', 'Shuttlecocks', 'Nets'],
      image: 'https://github.com/SoNam11012/CST-SportSpot/blob/main/ibcourt.jpg?raw=true'
    },
    {
      name: 'Indoor Badminton Court 2',
      type: 'Indoor',
      capacity: 4,
      status: 'Available',
      equipment: ['Rackets', 'Shuttlecocks', 'Nets'],
      image: 'https://github.com/SoNam11012/court/blob/main/20250318_163543.jpg?raw=true'
    }
  ];

  // Function to force add all 6 venues, replacing any with the same names
  const forceAddAllVenues = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Force adding all 6 venues...');
      
      // First, find any existing venues with the same names
      for (const venue of defaultVenues) {
        // Try to find an existing venue with this name
        const existingVenue = venues.find(v => v.name.toLowerCase() === venue.name.toLowerCase());
        
        if (existingVenue) {
          // Update the existing venue
          console.log(`Updating existing venue: ${venue.name}`);
          
          const response = await fetch('/api/admin/venues', {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
              id: existingVenue.id,
              ...venue
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log(`Failed to update venue ${venue.name}: ${errorData.error || response.statusText}`);
          } else {
            console.log(`Successfully updated venue: ${venue.name}`);
          }
        } else {
          // Create a new venue
          console.log(`Creating new venue: ${venue.name}`);
          
          const response = await fetch('/api/admin/venues', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(venue),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log(`Failed to create venue ${venue.name}: ${errorData.error || response.statusText}`);
          } else {
            console.log(`Successfully created venue: ${venue.name}`);
          }
        }
      }
      
      // Refresh venues list
      await fetchVenues();
      setError('All 6 venues have been added or updated successfully!');
    } catch (err: any) {
      console.error('Error adding venues:', err);
      setError(`Failed to add venues: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to seed default venues if none exist
  const seedDefaultVenues = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Seeding default venues...');
      
      // First, check if any venues already exist with these names
      const existingVenueNames = venues.map(v => v.name.toLowerCase());
      
      // Filter out venues that already exist
      const venuesToAdd = defaultVenues.filter(v => 
        !existingVenueNames.includes(v.name.toLowerCase())
      );
      
      if (venuesToAdd.length === 0) {
        console.log('All default venues already exist');
        setError('All venues already exist in the database.');
        setLoading(false);
        return;
      }
      
      // Add each venue that doesn't already exist
      let addedCount = 0;
      for (const venue of venuesToAdd) {
        console.log(`Attempting to add venue: ${venue.name}`);
        
        const response = await fetch('/api/admin/venues', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(venue),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.log(`Failed to add venue ${venue.name}: ${errorData.error || response.statusText}`);
          continue;
        }
        
        console.log(`Successfully added venue: ${venue.name}`);
        addedCount++;
      }
      
      // Show success message
      if (addedCount > 0) {
        setError(`Successfully added ${addedCount} new venues`);
      } else {
        setError('No new venues were added. They may already exist or there was an error.');
      }
      
      // Refresh venues list
      await fetchVenues();
    } catch (err: any) {
      console.error('Error seeding venues:', err);
      setError(`Failed to seed default venues: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch venues on component mount
  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Fetching venues with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('/api/admin/venues', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.error || `Failed to fetch venues: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Venues data received:', data.venues?.length ? `${data.venues.length} venues` : 'No venues');
      
      // Format the venues data for display
      if (data.venues && Array.isArray(data.venues)) {
        const formattedVenues = data.venues.map((venue: any) => ({
          id: venue.id || venue._id,
          name: venue.name,
          type: venue.type,
          capacity: venue.capacity,
          status: venue.status || 'Available',
          equipment: venue.equipment || [],
          image: venue.image || ''
        }));
        
        setVenues(formattedVenues);
      } else {
        console.error('Unexpected data format:', data);
        setError('Received invalid data format from server');
        setVenues([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load venues. Please try again later.');
      console.error('Error fetching venues:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data: typeof newVenue): FormErrors => {
    const errors: FormErrors = {};
    
    if (!data.name.trim()) {
      errors.name = 'Venue name is required';
    }
    
    if (!data.type) {
      errors.type = 'Venue type is required';
    }
    
    if (!data.capacity) {
      errors.capacity = 'Capacity is required';
    } else if (parseInt(data.capacity) < 1) {
      errors.capacity = 'Capacity must be at least 1';
    }
    
    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewVenue(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm(newVenue);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      // Process equipment properly
      let equipmentArray: string[] = [];
      if (newVenue.equipment && typeof newVenue.equipment === 'string') {
        equipmentArray = newVenue.equipment.split(',').map((item: string) => item.trim()).filter(Boolean);
      }

      const formData = {
        ...newVenue,
        capacity: parseInt(newVenue.capacity),
        equipment: equipmentArray
      };

      console.log('Adding new venue:', formData);

      const response = await fetch('/api/admin/venues', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Add venue API error:', errorData);
        throw new Error(errorData.error || `Failed to add venue: ${response.status}`);
      }

      const data = await response.json();
      console.log('Add venue result:', data);

      // Reset form and close modal
      setNewVenue({
        name: '',
        type: 'Indoor',
        capacity: '',
        equipment: '',
        status: 'Available'
      });
      setShowAddModal(false);
      fetchVenues(); // Refresh venues list
    } catch (err: any) {
      setError(err.message || 'Failed to add venue');
      console.error('Error adding venue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log(`Deleting venue with ID: ${id}`);
      
      const response = await fetch(`/api/admin/venues?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete venue API error:', errorData);
        throw new Error(errorData.error || `Failed to delete venue: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Delete venue result:', result);
      
      // Remove venue from state
      setVenues(venues.filter(venue => venue.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete venue');
      console.error('Error deleting venue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenue) return;

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log(`Updating venue with ID: ${selectedVenue.id}`);
      
      // Process equipment properly
      let equipmentArray: string[] = [];
      if (typeof selectedVenue.equipment === 'string') {
        equipmentArray = selectedVenue.equipment.split(',').map((item: string) => item.trim()).filter(Boolean);
      } else if (Array.isArray(selectedVenue.equipment)) {
        equipmentArray = selectedVenue.equipment;
      }
      
      const response = await fetch('/api/admin/venues', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          id: selectedVenue.id,
          name: selectedVenue.name,
          type: selectedVenue.type,
          capacity: selectedVenue.capacity,
          status: selectedVenue.status,
          equipment: equipmentArray
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update venue API error:', errorData);
        throw new Error(errorData.error || `Failed to update venue: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Update venue result:', data);

      setSelectedVenue(null);
      fetchVenues(); // Refresh venues list
    } catch (err: any) {
      setError(err.message || 'Failed to update venue');
      console.error('Error updating venue:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter venues based on status and search term
  const filteredVenues = venues.filter(venue => {
    // Filter by status if not 'all'
    const statusMatch = statusFilter === 'all' || venue.status === statusFilter;
    
    // Filter by search term (case insensitive)
    const searchMatch = searchTerm === '' || 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      venue.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Booked':
        return 'bg-blue-100 text-blue-800';
      case 'Maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && venues.length === 0) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {error && (
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
            <button
              className="absolute top-0 right-0 px-4 py-3"
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Venue Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={forceAddAllVenues}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              disabled={loading}
              title="This will add or update all 6 default venues from the user page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Add All 6 Venues
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#2c6e49] text-white px-4 py-2 rounded-md hover:bg-[#1b4332] transition-colors"
              disabled={loading}
            >
              Add New Venue
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Venues
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
              />
            </div>
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
              >
                <option value="all">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded w-full">
                <p><span className="font-medium">{filteredVenues.length}</span> venues found</p>
                <p><span className="font-medium">{venues.filter(v => v.status === 'Available').length}</span> available for booking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.length > 0 ? filteredVenues.map((venue) => (
            <div key={venue.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 w-full relative">
                <div className="absolute inset-0 bg-gray-200">
                  {venue.image ? (
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                    <p className="text-sm text-gray-600">{venue.type}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(venue.status)}`}>
                    {venue.status}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="font-medium">{venue.capacity} people</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Equipment</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {venue.equipment.map((item, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setSelectedVenue(venue)}
                    className="flex-1 bg-indigo-50 text-indigo-600 py-2 rounded hover:bg-indigo-100 transition-colors"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(venue.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 transition-colors"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-3 py-12 flex flex-col items-center justify-center bg-white rounded-lg shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No venues found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Venue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Venue</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newVenue.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49] ${
                    formErrors.name ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter venue name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={newVenue.type}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49] ${
                      formErrors.type ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                  </select>
                  {formErrors.type && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.type}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={newVenue.capacity}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49] ${
                      formErrors.capacity ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter capacity"
                    min="1"
                  />
                  {formErrors.capacity && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.capacity}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment (comma-separated)
                </label>
                <input
                  type="text"
                  name="equipment"
                  value={newVenue.equipment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                  placeholder="e.g., Balls, Net, First Aid Kit"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormErrors({});
                    setNewVenue({
                      name: '',
                      type: 'Indoor',
                      capacity: '',
                      equipment: '',
                      status: 'Available'
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2c6e49] text-white rounded hover:bg-[#1b4332]"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Venue Modal */}
      {selectedVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Venue</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Name
                </label>
                <input
                  type="text"
                  value={selectedVenue.name}
                  onChange={(e) => setSelectedVenue({ ...selectedVenue, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select 
                    value={selectedVenue.type}
                    onChange={(e) => setSelectedVenue({ ...selectedVenue, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={selectedVenue.capacity}
                    onChange={(e) => setSelectedVenue({ ...selectedVenue, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select 
                  value={selectedVenue.status}
                  onChange={(e) => setSelectedVenue({ ...selectedVenue, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                >
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment (comma-separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(selectedVenue.equipment) ? selectedVenue.equipment.join(', ') : ''}
                  onChange={(e) => setSelectedVenue({ ...selectedVenue, equipment: e.target.value as unknown as string[] })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c6e49]"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedVenue(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2c6e49] text-white rounded hover:bg-[#1b4332]"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
