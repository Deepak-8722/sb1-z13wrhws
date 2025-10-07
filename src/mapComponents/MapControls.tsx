import React from 'react';
import { MapPin, Route, Navigation, Plus, Eye, EyeOff } from 'lucide-react';

interface MapControlsProps {
  mode: 'view' | 'add-location' | 'draw-road' | 'plan-route';
  setMode: (mode: 'view' | 'add-location' | 'draw-road' | 'plan-route') => void;
  showLocations: boolean;
  setShowLocations: (show: boolean) => void;
  showRoads: boolean;
  setShowRoads: (show: boolean) => void;
  isNavigating: boolean;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  mode,
  setMode,
  showLocations,
  setShowLocations,
  showRoads,
  setShowRoads,
  isNavigating,
  onStartNavigation,
  onStopNavigation,
}) => {
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2 space-y-2">
      <div className="flex flex-col space-y-1">
        <button
          onClick={() => setMode(mode === 'add-location' ? 'view' : 'add-location')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'add-location'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Location</span>
        </button>

        <button
          onClick={() => setMode(mode === 'draw-road' ? 'view' : 'draw-road')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'draw-road'
              ? 'bg-green-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Route className="w-4 h-4" />
          <span>Draw Road</span>
        </button>

        <button
          onClick={() => setShowLocations(!showLocations)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full ${
            showLocations
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {showLocations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span>Locations</span>
        </button>

        <button
          onClick={() => setShowRoads(!showRoads)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full ${
            showRoads
              ? 'bg-green-50 text-green-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {showRoads ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span>Roads</span>
        </button>
      </div>

      <div className="border-t pt-2">
        <button
          onClick={isNavigating ? onStopNavigation : onStartNavigation}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full ${
            isNavigating
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>{isNavigating ? 'Stop Navigation' : 'Start Navigation'}</span>
        </button>
      </div>
    </div>
  );
};
