import { useState, useMemo, useEffect } from 'react';
import { Building, BuildingCategory } from './types/campus';
import { buildings } from './data/buildings';
import { useFavorites } from './hooks/useFavorites';
import SearchBar from './components/SearchBar';

import BuildingCard from './components/BuildingCard';
import BuildingDetail from './components/BuildingDetail';
import EmergencyServices from './components/EmergencyServices';
import EventsCatalogue from './components/EventsCatalogue';
import ChatBot from './components/ChatBot';
import ErrorBoundary from './components/ErrorBoundary';
import { MapPin, Heart, Info, Menu, X, Calendar, MessageCircle, Locate, UserCog } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import AdminLogin from './components/AdminLogin';
import BuildingManagement from './components/BuildingManagement';
import ProtectedRoute from './components/ProtectedRoute';
import MapSelector from './components/MapSelector';
import MapWrapper from './components/MapWrapper';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BuildingCategory | 'all'>('all');
  const [detailBuilding, setDetailBuilding] = useState<Building | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'services'>('map');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showBuildingManagement, setShowBuildingManagement] = useState(false);
  const [currentMapType, setCurrentMapType] = useState<'google' | 'leaflet'>('google');
  
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { isAdmin } = useAuth();

  // Handle geolocation
  useEffect(() => {
    let watchId: number | null = null;

    if (showUserLocation) {
      if (!navigator.geolocation) {
        setGeolocationError('Geolocation is not supported by this browser');
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      const handleSuccess = () => {
        setGeolocationError(null);
      };

      const handleError = (error: GeolocationPositionError) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setGeolocationError(errorMessage);
      };

      watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    } else {
      // setUserLocation(null);
      setGeolocationError(null);
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [showUserLocation]);

  const filteredBuildings = useMemo(() => {
    return buildings.filter(building => {
      const matchesSearch = 
        building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.services.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesCategory = selectedCategory === 'all' || building.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const favoriteBuildings = useMemo(() => {
    const favSet = new Set(favorites);
    return buildings.filter(building => favSet.has(building.id));
  }, [favorites]);

  const handleGetDirections = (venue: string) => {
    // Find the building that matches the venue
    const targetBuilding = buildings.find(building => 
      building.name.toLowerCase().includes(venue.toLowerCase()) ||
      venue.toLowerCase().includes(building.name.toLowerCase()) ||
      building.code.toLowerCase() === venue.toLowerCase()
    );

    if (targetBuilding) {
      setActiveTab('map');
    } else {
      // Fallback to Google Maps if building not found
      const query = encodeURIComponent(`${venue} university campus`);
      window.open(`https://www.google.com/maps/search/${query}`, '_blank');
    }
  };
  const tabs = [
    { id: 'map', label: 'Campus Map', icon: MapPin },
    { id: 'list', label: 'All Buildings', icon: Info },
    { id: 'services', label: 'Services', icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Action Buttons */}
      {!showEvents && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
          {/* Chat Assistant Button - stays in original position */}
          <button
            onClick={() => setShowChatBot(true)}
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
            title="Chat Assistant"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Location and Events Buttons - moved up and to right middle */}
      <div className="fixed top-24 right-6 flex flex-col gap-3 z-40">
        {currentMapType === 'google' && (
          <button
            onClick={() => {
              if (geolocationError) {
                alert(geolocationError);
                return;
              }
              setShowUserLocation(!showUserLocation);
            }}
            className={`w-14 h-14 ${
              showUserLocation 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                : 'bg-gradient-to-r from-gray-600 to-gray-700'
            } text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 ${
              showUserLocation ? 'animate-pulse' : ''
            }`}
            title={showUserLocation ? 'Hide My Location' : 'Show My Location'}
          >
            <Locate className="h-6 w-6" />
          </button>
        )}
        <button
          onClick={() => setShowEvents(true)}
          className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
          title="View Events"
        >
          <Calendar className="h-6 w-6" />
        </button>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Navigate_Malnad</h1>
                <p className="text-blue-200 text-sm">Your Campus Guide</p>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'map' | 'list' | 'services')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-200 hover:text-white hover:bg-blue-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
              <button
                onClick={() => setShowAdminLogin(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-blue-200 hover:text-white hover:bg-blue-700"
              >
                <UserCog className="h-4 w-4" />
                Admin
              </button>
              {isAdmin && (
                <button
                  onClick={() => setShowBuildingManagement(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-blue-200 hover:text-white hover:bg-blue-700"
                >
                  <UserCog className="h-4 w-4" />
                  Manage Buildings
                </button>
              )}
            </nav>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <nav className="flex flex-col space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as 'map' | 'list' | 'services');
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-left ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-200 hover:text-white hover:bg-blue-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowBuildingManagement(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-left text-blue-200 hover:text-white hover:bg-blue-700"
                  >
                    <UserCog className="h-4 w-4" />
                    Manage Buildings
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {activeTab !== 'services' && (
          <div className="mb-4">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        )}

        {/* Favorites Section */}
        {activeTab === 'list' && favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-current" />
              Your Favorites
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteBuildings.map((building) => (
                <BuildingCard
                  key={building.id}
                  building={building}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                  onSelect={setDetailBuilding}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'map' && (
          <div className="h-[calc(100vh-12rem)] relative bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="absolute top-4 right-4 z-50">
              <MapSelector currentMapType={currentMapType} onMapTypeChange={setCurrentMapType} />
            </div>
            <div className="w-full h-full relative">
              <ErrorBoundary>
                <MapWrapper
                  buildings={buildings}
                  selectedBuilding={null}
                  onBuildingSelect={setDetailBuilding}
                  showUserLocation={showUserLocation}
                  userLocation={null}
                  mapType={currentMapType}
                />
              </ErrorBoundary>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              All Buildings {filteredBuildings.length !== buildings.length && `(${filteredBuildings.length} results)`}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBuildings.map((building) => (
                <BuildingCard
                  key={building.id}
                  building={building}
                  isFavorite={isFavorite(building.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelect={setDetailBuilding}
                />
              ))}
            </div>
            {filteredBuildings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No buildings found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && <EmergencyServices />}
      </main>

      {/* Building Detail Modal */}
      {detailBuilding && (
        <BuildingDetail
          building={detailBuilding}
          isFavorite={isFavorite(detailBuilding.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setDetailBuilding(null)}
        />
      )}

      {/* Events Catalogue Modal */}
      {showEvents && (
        <EventsCatalogue 
          onClose={() => setShowEvents(false)} 
          onGetDirections={handleGetDirections}
        />
      )}

      {/* ChatBot Modal */}
      {showChatBot && (
        <ChatBot onClose={() => setShowChatBot(false)} />
      )}

      {showAdminLogin && (
        <AdminLogin onClose={() => setShowAdminLogin(false)} />
      )}

      {showBuildingManagement && (
        <ProtectedRoute adminOnly>
          <BuildingManagement onClose={() => setShowBuildingManagement(false)} />
        </ProtectedRoute>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Navigate_Malnad</h3>
              <p className="text-gray-300">
                Your comprehensive guide to navigating the university campus with ease.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#emergency" key="emergency" className="block text-gray-300 hover:text-white transition-colors">Emergency Services</a>
                <a href="#map" key="map" className="block text-gray-300 hover:text-white transition-colors">Campus Map</a>
                <a href="#directory" key="directory" className="block text-gray-300 hover:text-white transition-colors">Building Directory</a>
                <a href="#contact" key="contact" className="block text-gray-300 hover:text-white transition-colors">Contact Us</a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
              <p className="text-gray-300 mb-2">Campus Security</p>
              <p className="text-xl font-bold text-red-400">(555) 911-HELP</p>
              <p className="text-gray-400 text-sm">Available 24/7</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Navigate_Malnad. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppContent;