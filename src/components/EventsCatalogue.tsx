import { useState, useMemo } from 'react';
import { CampusEvent, EventCategory } from '../types/events';
import { campusEvents } from '../data/events';
import { Calendar, Clock, MapPin, Users, Tag, X, Filter, Search, Navigation } from 'lucide-react';

interface EventsCatalogueProps {
  onClose: () => void;
  onGetDirections?: (venue: string) => void;
}

const categoryColors = {
  academic: 'bg-blue-100 text-blue-800 border-blue-200',
  social: 'bg-pink-100 text-pink-800 border-pink-200',
  sports: 'bg-green-100 text-green-800 border-green-200',
  cultural: 'bg-purple-100 text-purple-800 border-purple-200',
  workshop: 'bg-orange-100 text-orange-800 border-orange-200',
  career: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  volunteer: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  orientation: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const categories: { value: EventCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Events' },
  { value: 'academic', label: 'Academic' },
  { value: 'social', label: 'Social' },
  { value: 'sports', label: 'Sports' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'career', label: 'Career' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'orientation', label: 'Orientation' }
];

export default function EventsCatalogue({ onClose, onGetDirections }: EventsCatalogueProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return campusEvents.filter(event => {
      const matchesSearch = 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isUpcoming = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate >= today;
  };

  const getRegistrationStatus = (event: CampusEvent) => {
    if (!event.registrationRequired) return null;
    if (!event.capacity) return 'Registration Required';
    
    const spotsLeft = event.capacity - (event.registeredCount || 0);
    if (spotsLeft <= 0) return 'Full';
    if (spotsLeft <= 10) return `${spotsLeft} spots left`;
    return 'Registration Open';
  };

  const handleGetDirections = (venue: string) => {
    if (onGetDirections) {
      onGetDirections(venue);
      onClose(); // Close the events catalogue
    } else {
      // Fallback to opening Google Maps
      const query = encodeURIComponent(`${venue} university campus`);
      window.open(`https://www.google.com/maps/search/${query}`, '_blank');
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Campus Events</h2>
              <p className="text-blue-100">Discover what's happening on campus</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, venues, or organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as EventCategory | 'all')}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[event.category]}`}>
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </span>
                      {isUpcoming(event.date) && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Upcoming
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {event.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                    
                    {event.registrationRequired && (
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className={`font-medium ${
                          getRegistrationStatus(event) === 'Full' ? 'text-red-600' :
                          getRegistrationStatus(event)?.includes('spots left') ? 'text-orange-600' :
                          'text-blue-600'
                        }`}>
                          {getRegistrationStatus(event)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {event.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                      {event.tags.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{event.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetDirections(event.venue);
                      }}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions to {event.venue}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${categoryColors[selectedEvent.category]} mb-3`}>
                    {selectedEvent.category.charAt(0).toUpperCase() + selectedEvent.category.slice(1)}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedEvent.name}</h2>
                  <p className="text-gray-600">Organized by {selectedEvent.organizer}</p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Event Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-800">Date</p>
                        <p className="text-gray-600">{formatDate(selectedEvent.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-800">Time</p>
                        <p className="text-gray-600">{selectedEvent.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-800">Venue</p>
                        <p className="text-gray-600">{selectedEvent.venue}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Registration</h3>
                  {selectedEvent.registrationRequired ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-800">Status</p>
                          <p className={`${
                            getRegistrationStatus(selectedEvent) === 'Full' ? 'text-red-600' :
                            getRegistrationStatus(selectedEvent)?.includes('spots left') ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {getRegistrationStatus(selectedEvent)}
                          </p>
                        </div>
                      </div>
                      {selectedEvent.capacity && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Registered</span>
                            <span>{selectedEvent.registeredCount || 0} / {selectedEvent.capacity}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((selectedEvent.registeredCount || 0) / selectedEvent.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-green-600 font-medium">No registration required</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleGetDirections(selectedEvent.venue)}
                    className="flex items-center justify-center gap-2 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Navigation className="h-5 w-5" />
                    Get Directions
                  </button>
                  <button 
                    className={`py-3 px-6 rounded-lg font-medium transition-colors ${
                      selectedEvent.registrationRequired && getRegistrationStatus(selectedEvent) === 'Full'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={selectedEvent.registrationRequired && getRegistrationStatus(selectedEvent) === 'Full'}
                  >
                    {selectedEvent.registrationRequired 
                      ? getRegistrationStatus(selectedEvent) === 'Full' 
                        ? 'Event Full' 
                        : 'Register'
                      : 'Add to Calendar'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}