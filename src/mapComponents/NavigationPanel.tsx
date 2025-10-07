import React from 'react';
import { Navigation, Clock, MapPin } from 'lucide-react';
import { Route } from '../types/map';

interface NavigationPanelProps {
  currentRoute: Route | null;
  isNavigating: boolean;
  userLocation: [number, number] | null;
  onCloseNavigation: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  currentRoute,
  isNavigating,
  userLocation,
  onCloseNavigation,
}) => {
  if (!isNavigating || !currentRoute) return null;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Navigation</h3>
        </div>
        <button
          onClick={onCloseNavigation}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-blue-50 p-3 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">{currentRoute.name}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800">{formatTime(currentRoute.estimatedTime)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800">{formatDistance(currentRoute.distance)}</span>
            </div>
          </div>
        </div>

        {userLocation && (
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Current Location:</strong><br />
              Lat: {userLocation[0].toFixed(6)}<br />
              Lng: {userLocation[1].toFixed(6)}
            </p>
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-md">
          <h5 className="font-medium text-gray-700 mb-2">Turn-by-Turn Directions</h5>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">1</span>
              <p>Head north on current road</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">2</span>
              <p>Continue on the planned route</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">🎯</span>
              <p>Arrive at destination</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};