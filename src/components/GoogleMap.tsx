import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Building } from '../types/campus';
import { MapPin, AlertCircle } from 'lucide-react';

interface GoogleMapProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  onBuildingSelect: (building: Building) => void;
  showUserLocation: boolean;
  userLocation: { latitude: number; longitude: number } | null;
}

// Default campus center (you can adjust these coordinates to your actual campus)
const CAMPUS_CENTER = {
  lat: 40.7128, // Example: New York coordinates
  lng: -74.0060
};

const getCategoryColor = (category: string) => {
  const colors = {
    academic: '#3B82F6',
    library: '#8B5CF6',
    dining: '#F97316',
    residential: '#10B981',
    recreation: '#EC4899',
    administrative: '#6B7280',
    parking: '#EAB308',
    emergency: '#EF4444'
  };
  return colors[category as keyof typeof colors] || '#6B7280';
};

export default function GoogleMap({ 
  buildings, 
  selectedBuilding, 
  onBuildingSelect,
  showUserLocation,
  userLocation 
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
          throw new Error('Missing or invalid Google Maps API key');
        }

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        // Load the Google Maps API
        await (loader as any).load();

        if (mapRef.current && window.google) {
          const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: CAMPUS_CENTER,
            zoom: 16,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP
          });

          setMap(mapInstance);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps. Please check your API key.');
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  // Add building markers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));

    const newMarkers = buildings.map((building) => {
      // Convert building coordinates to lat/lng (adjust these calculations for your campus)
      const lat = building.latitude;
      const lng = building.longitude;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: building.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: selectedBuilding?.id === building.id ? 12 : 8,
          fillColor: getCategoryColor(building.category),
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
              ${building.name}
            </h3>
            <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px;">
              ${building.code} • ${building.category.charAt(0).toUpperCase() + building.category.slice(1)}
            </p>
            <p style="margin: 0 0 8px 0; color: #374151; font-size: 13px;">
              ${building.description}
            </p>
            <p style="margin: 0; color: #6B7280; font-size: 12px;">
              <strong>Hours:</strong> ${building.hours}
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        onBuildingSelect(building);
        infoWindow.open(map, marker);
      });

      return marker;
    });

    markersRef.current = newMarkers;
  }, [map, buildings, selectedBuilding, onBuildingSelect]);

  // Handle user location marker
  useEffect(() => {
    if (!map) return;

    if (showUserLocation && userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }

      const newUserMarker = new google.maps.Marker({
        position: {
          lat: userLocation.latitude,
          lng: userLocation.longitude
        },
        map: map,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3
        },
        animation: google.maps.Animation.BOUNCE
      });

      // Add a pulsing circle around user location
      new google.maps.Circle({
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.2,
        map: map,
        center: {
          lat: userLocation.latitude,
          lng: userLocation.longitude
        },
        radius: 50 // 50 meters radius
      });

      const userInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
              📍 Your Location
            </h3>
            <p style="margin: 0; color: #6B7280; font-size: 12px;">
              Lat: ${userLocation.latitude.toFixed(6)}<br>
              Lng: ${userLocation.longitude.toFixed(6)}
            </p>
          </div>
        `
      });

      newUserMarker.addListener('click', () => {
        userInfoWindow.open(map, newUserMarker);
      });

  userMarkerRef.current = newUserMarker;

      // Center map on user location
      map.panTo({
        lat: userLocation.latitude,
        lng: userLocation.longitude
      });
    } else if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
  }, [map, showUserLocation, userLocation]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Campus Map</h3>
        <div className="h-[400px] md:h-[500px] flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Campus Map</h3>
        <div className="h-[400px] md:h-[500px] flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Map Loading Error</p>
            <p className="text-red-500 text-sm">{error}</p>
            <p className="text-gray-600 text-xs mt-2">
              Please add your Google Maps API key to the environment variables
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Interactive Campus Map</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>Google Maps</span>
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-[400px] md:h-[500px] rounded-lg border border-gray-200"
      />

      {/* Map Legend */}
      <div className="mt-4 bg-gray-50 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Academic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Library</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Dining</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Housing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Emergency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Parking</span>
          </div>
          {showUserLocation && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Your Location</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}