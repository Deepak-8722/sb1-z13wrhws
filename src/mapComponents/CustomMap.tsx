import React, { useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapControls } from './MapControls';
import { MyLocationButton } from './MyLocationButton';
import { LocationModal } from './LocationModal';
import { NavigationPanel } from './NavigationPanel';
import { Location, Road, Route, MapState } from '../mapTypes/map';
import { useGeolocation } from '../mapHook/useGeolocation';

// Fix for default markers in react-leaflet
// Fix for default markers in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons for different location categories
const createCustomIcon = (category: Location['category']) => {
  const iconMap = {
    restaurant: '🍽️',
    hospital: '🏥',
    school: '🏫',
    shopping: '🛍️',
    gas: '⛽',
    hotel: '🏨',
    custom: '📍',
  };

  return L.divIcon({
    html: `<div style="background: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid #3B82F6; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 14px;">${iconMap[category as keyof typeof iconMap]}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: 'custom-marker',
  });
};

// User location icon
const userLocationIcon = L.divIcon({
  html: `<div style="background: #3B82F6; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  className: 'user-location-marker',
});

interface MapEventsHandlerProps {
  mode: string;
  onMapClick: (lat: number, lng: number) => void;
}

const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({ mode, onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (mode !== 'view') {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};



export const CustomMap: React.FC = () => {
  const [mapState, setMapState] = useState<MapState>({
    center: [40.7128, -74.0060], // Default to NYC
    zoom: 13,
    userLocation: null,
    isNavigating: false,
    currentRoute: null,
  });

  const [mode, setMode] = useState<'view' | 'add-location' | 'draw-road' | 'plan-route'>('view');
  const [locations, setLocations] = useState<Location[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showLocations, setShowLocations] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  
  // Drawing state
  const [currentRoadPoints, setCurrentRoadPoints] = useState<[number, number][]>([]);
  const [routeWaypoints, setRouteWaypoints] = useState<[number, number][]>([]);
  
  const mapRef = useRef<L.Map>(null);
  const { location: userLocation, loading: userLocationLoading } = useGeolocation();

  // Update user location in state
  React.useEffect(() => {
    if (userLocation) {
      setMapState((prev: MapState) => ({ ...prev, userLocation }));
    }
  }, [userLocation]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    switch (mode) {
      case 'add-location':
        setSelectedPosition([lat, lng]);
        setIsLocationModalOpen(true);
        break;
      case 'draw-road':
        setCurrentRoadPoints(prev => [...prev, [lat, lng]]);
        break;
      case 'plan-route':
        setRouteWaypoints(prev => [...prev, [lat, lng]]);
        break;
    }
  }, [mode]);

  const handleSaveLocation = useCallback((locationData: Omit<Location, 'id' | 'createdAt'>) => {
    const newLocation: Location = {
      ...locationData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setLocations(prev => [...prev, newLocation]);
  }, []);

  const handleFinishRoad = useCallback(() => {
    if (currentRoadPoints.length >= 2) {
      const newRoad: Road = {
        id: Date.now().toString(),
        name: `Road ${roads.length + 1}`,
        coordinates: currentRoadPoints,
        type: 'custom',
        createdAt: new Date(),
      };
      setRoads(prev => [...prev, newRoad]);
      setCurrentRoadPoints([]);
      setMode('view');
    }
  }, [currentRoadPoints, roads.length]);

  const handleFinishRoute = useCallback(() => {
    if (routeWaypoints.length >= 2) {
      const distance = routeWaypoints.reduce((total, point, index) => {
        if (index === 0) return 0;
        const prev = routeWaypoints[index - 1];
        // Simple distance calculation (in meters, approximate)
        const R = 6371e3; // Earth's radius in meters
        const φ1 = prev[0] * Math.PI/180;
        const φ2 = point[0] * Math.PI/180;
        const Δφ = (point[0] - prev[0]) * Math.PI/180;
        const Δλ = (point[1] - prev[1]) * Math.PI/180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return total + R * c;
      }, 0);

      const newRoute: Route = {
        id: Date.now().toString(),
        name: `Route ${routes.length + 1}`,
        waypoints: routeWaypoints,
        distance,
        estimatedTime: distance / 1000 * 2, // Rough estimate: 2 minutes per km
        createdAt: new Date(),
      };
      setRoutes(prev => [...prev, newRoute]);
      setRouteWaypoints([]);
      setMode('view');
    }
  }, [routeWaypoints, routes.length]);

  const handleStartNavigation = useCallback(() => {
    if (routes.length > 0) {
      const latestRoute = routes[routes.length - 1];
      setMapState((prev: MapState) => ({
        ...prev,
        isNavigating: true,
        currentRoute: latestRoute,
      }));
    }
  }, [routes]);

  const handleStopNavigation = useCallback(() => {
    setMapState((prev: MapState) => ({
      ...prev,
      isNavigating: false,
      currentRoute: null,
    }));
  }, []);

  const handleGoToCurrentLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView(userLocation, 16);
    }
  }, [userLocation]);

  // Handle keyboard shortcuts for finishing drawing
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (mode === 'draw-road' && currentRoadPoints.length >= 2) {
          handleFinishRoad();
        } else if (mode === 'plan-route' && routeWaypoints.length >= 2) {
          handleFinishRoute();
        }
      } else if (e.key === 'Escape') {
        setCurrentRoadPoints([]);
        setRouteWaypoints([]);
        setMode('view');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mode, currentRoadPoints, routeWaypoints, handleFinishRoad, handleFinishRoute]);

  return (
    <div className="relative w-full h-screen">
      <MapContainer
        center={mapState.center}
        zoom={mapState.zoom}
        className="w-full h-full z-0"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapEventsHandler mode={mode} onMapClick={handleMapClick} />

        {/* User location marker */}
        {mapState.userLocation && (
          <Marker position={mapState.userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-blue-600">Your Location</p>
                <p className="text-sm text-gray-600">
                  {mapState.userLocation[0].toFixed(6)}, {mapState.userLocation[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Location markers */}
        {showLocations && locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={createCustomIcon(location.category)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-gray-900 mb-1">{location.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                <div className="text-xs text-gray-500">
                  <p>Category: {location.category}</p>
                  <p>Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                  <p>Added: {location.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Roads */}
        {showRoads && roads.map((road) => (
          <Polyline
            key={road.id}
            positions={road.coordinates}
            pathOptions={{
              color: '#10B981',
              weight: 4,
              opacity: 0.8,
            }}
          />
        ))}

        {/* Current road being drawn */}
        {currentRoadPoints.length > 1 && (
          <Polyline
            positions={currentRoadPoints}
            pathOptions={{
              color: '#F59E0B',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10',
            }}
          />
        )}

        {/* Routes */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.waypoints}
            pathOptions={{
              color: '#8B5CF6',
              weight: 6,
              opacity: 0.9,
            }}
          />
        ))}

        {/* Current route being planned */}
        {routeWaypoints.length > 1 && (
          <Polyline
            positions={routeWaypoints}
            pathOptions={{
              color: '#EF4444',
              weight: 4,
              opacity: 0.8,
              dashArray: '5, 5',
            }}
          />
        )}

        {/* Route waypoint markers */}
        {routeWaypoints.map((point, index) => (
          <Marker
            key={`waypoint-${index}`}
            position={point}
            icon={L.divIcon({
              html: `<div style="background: #8B5CF6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-weight: bold; font-size: 12px;">${index + 1}</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          />
        ))}
      </MapContainer>

      {/* Controls */}
      <MapControls
        mode={mode}
        setMode={setMode}
        showLocations={showLocations}
        setShowLocations={setShowLocations}
        showRoads={showRoads}
        setShowRoads={setShowRoads}
        isNavigating={mapState.isNavigating}
        onStartNavigation={handleStartNavigation}
        onStopNavigation={handleStopNavigation}
      />

      {/* My Location Button */}
      <MyLocationButton
        userLocation={userLocation}
        onGoToCurrentLocation={handleGoToCurrentLocation}
        isLoading={userLocationLoading}
      />

      {/* Navigation Panel */}
      <NavigationPanel
        currentRoute={mapState.currentRoute}
        isNavigating={mapState.isNavigating}
        userLocation={mapState.userLocation}
        onCloseNavigation={handleStopNavigation}
      />

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={handleSaveLocation}
        position={selectedPosition}
      />

      {/* Instructions overlay */}
      {(mode === 'draw-road' || mode === 'plan-route') && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-md">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 mb-2">
              {mode === 'draw-road' ? 'Draw Road Mode' : 'Plan Route Mode'}
            </p>
            <p className="text-xs text-gray-600 mb-2">
              Click on the map to add points. Need at least 2 points.
            </p>
            <div className="flex space-x-2 justify-center">
              <button
                onClick={mode === 'draw-road' ? handleFinishRoad : handleFinishRoute}
                disabled={(mode === 'draw-road' ? currentRoadPoints : routeWaypoints).length < 2}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Finish (Enter)
              </button>
              <button
                onClick={() => {
                  setCurrentRoadPoints([]);
                  setRouteWaypoints([]);
                  setMode('view');
                }}
                className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
              >
                Cancel (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};